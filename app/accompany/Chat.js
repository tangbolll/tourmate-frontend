import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    KeyboardAvoidingView, 
    Platform,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import Constants from 'expo-constants';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import {
    fetchOrCreateChatRoom,
    fetchMessages,
    getWebSocketURL,
    getAccompanyPostInfo 
} from '../../utils/ChatApi';


const { width: screenWidth } = Dimensions.get('window');

// 날짜 구분선 컴포넌트
const DateSeparator = ({ date }) => {
    return (
        <View style={styles.dateSeparatorContainer}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>{date}</Text>
            <View style={styles.dateSeparatorLine} />
        </View>
    );
};

// MessageBubble 컴포넌트
const MessageBubble = ({ message, showSenderName, showTime, isFirstInGroup, isLastInGroup, style }) => {
    const isMyMessage = message.user?.isSelf || false;

    return (
        <View style={[
            bubbleStyles.messageContainer,
            isMyMessage ? bubbleStyles.myMessageContainer : bubbleStyles.otherMessageContainer,
            isFirstInGroup ? {} : { marginTop: 2 }, // 연속 메시지는 간격 줄임
            style
        ]}> 
            {!isMyMessage && showSenderName && (
                <Text style={bubbleStyles.senderName}>
                    {message.user?.name || '익명'}
                </Text>
            )}
            
            <View style={bubbleStyles.bubbleWithTime}>
                {isMyMessage && showTime && (
                    <Text style={[bubbleStyles.timestamp, bubbleStyles.myTimestamp]}>
                        {message.time}
                    </Text>
                )}
                
                <View style={[
                    bubbleStyles.bubble,
                    isMyMessage ? bubbleStyles.myBubble : bubbleStyles.otherBubble,
                    // 연속 메시지의 경우 꼬리 표시 조건 변경
                    isFirstInGroup ? {} : (isMyMessage ? { marginRight: 8 } : { marginLeft: 8 })
                ]}>
                    {/* 첫 번째 메시지에만 꼬리 표시 */}
                    {isFirstInGroup && (
                        <View style={[
                            bubbleStyles.tail,
                            isMyMessage ? bubbleStyles.myTail : bubbleStyles.otherTail
                        ]} />
                    )}
                    
                    <Text style={[
                        bubbleStyles.messageText,
                        isMyMessage ? bubbleStyles.myMessageText : bubbleStyles.otherMessageText
                    ]}>
                        {message.text}
                    </Text>
                </View>
                
                {!isMyMessage && showTime && (
                    <Text style={[bubbleStyles.timestamp, bubbleStyles.otherTimestamp]}>
                        {message.time}
                    </Text>
                )}
            </View>
        </View>
    );
};

const Chat = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const postId = params.postId;
    const chatRoomId = params.chatRoomId;
    const { currentUserId } = useAuth();

    // 상태로 관리
    const [chatRoom, setChatRoom] = useState(null);
    const [accompanyInfo, setAccompanyInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [showActions, setShowActions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    
    const scrollViewRef = useRef();
    const stompClientRef = useRef(null);

    // 날짜 포맷팅 함수들
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const formatDateForSeparator = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    // 메시지를 날짜별로 그룹화하고 연속 메시지 처리하는 함수
    const groupMessagesByDate = (messages) => {
        const grouped = [];
        let currentDate = null;

        messages.forEach((message, index) => {
            const messageDate = message.sendTime;
            
            // 날짜가 바뀌었거나 첫 번째 메시지인 경우 날짜 구분선 추가
            if (!currentDate || !isSameDay(currentDate, messageDate)) {
                currentDate = messageDate;
                grouped.push({
                    type: 'dateSeparator',
                    date: formatDateForSeparator(messageDate),
                    id: `date_${messageDate}_${index}`
                });
            }
            
            // 연속 메시지 그룹 처리
            const prevMessage = messages[index - 1];
            const nextMessage = messages[index + 1];
            
            // 같은 사용자의 연속 메시지인지 확인
            const isSameUser = prevMessage && 
                prevMessage.user?.isSelf === message.user?.isSelf &&
                (prevMessage.user?.name === message.user?.name || 
                 (prevMessage.user?.isSelf && message.user?.isSelf));
            
            const isNextSameUser = nextMessage && 
                nextMessage.user?.isSelf === message.user?.isSelf &&
                (nextMessage.user?.name === message.user?.name || 
                 (nextMessage.user?.isSelf && message.user?.isSelf));
            
            // 같은 시간(분)인지 확인
            const isSameTime = prevMessage && 
                formatTime(prevMessage.sendTime) === formatTime(message.sendTime);
            
            const isNextSameTime = nextMessage && 
                formatTime(nextMessage.sendTime) === formatTime(message.sendTime);
            
            // 연속 메시지 그룹에서의 위치 결정
            const isFirstInGroup = !isSameUser || !isSameDay(prevMessage?.sendTime, messageDate);
            const isLastInGroup = !isNextSameUser || !isSameDay(nextMessage?.sendTime, messageDate);
            
            // 시간 표시 여부 결정 (같은 사용자의 연속 메시지 중 마지막에만 시간 표시)
            const showTime = isLastInGroup || !isNextSameTime;
            
            // 사용자명 표시 여부 결정 (연속 메시지의 첫 번째에만 표시)
            const showSenderName = isFirstInGroup;
            
            // 메시지 추가
            grouped.push({
                type: 'message',
                ...message,
                showSenderName,
                showTime,
                isFirstInGroup,
                isLastInGroup
            });
        });

        return grouped;
    };

    // 웹소켓 연결 useEffect
    useEffect(() => {
        if (!chatRoom?.id || !currentUserId) {
            console.log('웹소켓 연결 조건 미충족:', { chatRoomId: chatRoom?.id, currentUserId });
            return;
        }

        console.log('🔌 웹소켓 연결 시작...');

        const socket = new SockJS(getWebSocketURL());
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => console.log('STOMP Debug:', str),
            onConnect: (frame) => {
                console.log('✅ 웹소켓 연결 성공:', frame);
                setIsConnected(true);

                // 채팅방 구독
                const subscription = stompClient.subscribe(
                    `/topic/chatroom.${chatRoom.id}`, 
                    (message) => {
                        console.log('📨 새 메시지 수신:', message.body);
                        try {
                            const chatMessage = JSON.parse(message.body);
                            
                            // 내가 보낸 메시지는 웹소켓으로 받지 않음 (중복 방지)
                            if (String(chatMessage.senderId) === String(currentUserId)) {
                                return;
                            }
                            
                            // 새 메시지를 상태에 추가
                            const newMessage = {
                                id: chatMessage.id || `${chatMessage.roomId}_${Date.now()}`,
                                user: {
                                    isSelf: false, // 다른 사람의 메시지
                                    name: chatMessage.senderNickname || `사용자${chatMessage.senderId}`
                                },
                                text: chatMessage.content,
                                time: formatTime(chatMessage.sendTime || new Date()),
                                sendTime: chatMessage.sendTime || new Date().toISOString()
                            };
                            
                            setMessages(prev => {
                                // 🔧 중복 메시지 방지 (ID 기반)
                                if (prev.some(msg => msg.id === newMessage.id)) {
                                    console.log('🔄 중복 메시지 방지:', newMessage.id);
                                    return prev;
                                }
                                console.log('➕ 새 메시지 추가:', newMessage);
                                return [...prev, newMessage];
                            });
                            
                        } catch (error) {
                            console.error('❌ 메시지 파싱 오류:', error);
                        }
                    }
                );

                console.log('📡 채팅방 구독 완료:', `/topic/chatroom.${chatRoom.id}`);
            },
            onStompError: (frame) => {
                console.error('❌ STOMP 오류:', frame.headers['message']);
                setIsConnected(false);
            },
            onWebSocketClose: (event) => {
                console.log('🔌 웹소켓 연결 종료:', event);
                setIsConnected(false);
            },
            onWebSocketError: (error) => {
                console.error('❌ 웹소켓 오류:', error);
                setIsConnected(false);
            }
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        // 클린업 함수
        return () => {
            console.log('🔌 웹소켓 연결 해제');
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
            setIsConnected(false);
        };
    }, [chatRoom?.id, currentUserId]);

    // 메시지 전송 함수 (낙관적 업데이트)
    const handleSendStomp = async (text = '') => {
        if (!text.trim()) {
            console.log('❌ 빈 메시지는 전송할 수 없습니다.');
            return;
        }

        if (!stompClientRef.current?.connected) {
            console.log('❌ 웹소켓이 연결되지 않음');
            Alert.alert('연결 오류', '채팅 서버에 연결되지 않았습니다.');
            return;
        }

        if (!chatRoom?.id) {
            console.log('❌ 채팅방 정보가 없음');
            Alert.alert('오류', '채팅방 정보를 찾을 수 없습니다.');
            return;
        }

        setSendingMessage(true);
        
        // 🔧 낙관적 업데이트용 임시 메시지 (고유 ID 생성)
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const tempMessage = {
            id: tempId,
            user: {
                name: '나',
                isSelf: true
            },
            text: text.trim(),
            time: formatTime(new Date()),
            sendTime: new Date().toISOString(),
            isTemporary: true,
            tempId: tempId // 🔧 임시 메시지 식별용
        };
        
        console.log('➕ 낙관적 업데이트 - 임시 메시지 추가:', tempMessage);
        setMessages(prev => [...prev, tempMessage]);
        setInputText('');

        try {
            // 서버로 보낼 메시지 포맷
            const messageBody = {
                senderId: parseInt(currentUserId), //  백엔드가 숫자를 기대하므로 변환
                roomId: chatRoom.id,
                message: text.trim()
            };

            console.log('📤 메시지 전송:', messageBody);

            // STOMP 클라이언트로 메시지 전송
            stompClientRef.current.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(messageBody)
            });

            console.log('✅ 메시지 전송 완료');

            // 🔧 전송 성공 후 임시 메시지를 완전히 제거 (웹소켓으로 실제 메시지가 오지 않으므로)
            // 낙관적 업데이트된 메시지를 그대로 유지

        } catch (error) {
            console.error('❌ 메시지 전송 오류:', error);
            
            // 🔧 실패 시 임시 메시지 제거
            setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
            Alert.alert('전송 실패', '메시지를 보낼 수 없습니다.');
        } finally {
            setSendingMessage(false);
        }
    };

    // 메시지 추가 시 자동 스크롤
    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

// 초기 데이터 로드
useEffect(() => {
    const loadChatData = async () => {
        if (!chatRoomId && !postId) {
            setError('잘못된 접근입니다.');
            setLoading(false);
            return;
        }

        // 🔧 currentUserId가 없으면 로딩을 기다림
        if (!currentUserId) {
            console.log('⏳ currentUserId 로딩 대기 중...');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log('🚀 채팅방 초기화 시작');
            console.log('📝 파라미터:', { chatRoomId, postId, currentUserId });
            
            let roomData;
            
            // 1. 채팅방 정보 가져오기
            if (chatRoomId) {
                roomData = await fetchOrCreateChatRoom(chatRoomId, true);
            } else if (postId) {
                roomData = await fetchOrCreateChatRoom(postId, false);
            }
            
            if (!roomData) {
                setError('채팅방을 불러올 수 없습니다.');
                return;
            }
            
            console.log('🏠 채팅방 데이터:', roomData);
            setChatRoom(roomData);
            
            // 2. 동행 게시물 정보 가져오기
            const accompanyIdToUse = roomData.accompanyId || postId;
            console.log('🎯 동행 ID:', accompanyIdToUse);
            
            if (accompanyIdToUse) {
                try {
                    // 🔧 currentUserId를 두 번째 매개변수로 전달
                    const postInfo = await getAccompanyPostInfo(accompanyIdToUse, currentUserId);
                    console.log('📋 동행 정보:', postInfo);
                    setAccompanyInfo(postInfo);
                } catch (error) {
                    console.error('동행 정보 조회 실패:', error);
                    // 동행 정보 조회 실패해도 계속 진행
                }
            }
            
            // 3. 기존 메시지 목록 가져오기
            const messages = await fetchMessages(roomData.id, currentUserId);
            console.log('💬 메시지 개수:', messages.length);
            setMessages(messages);
            
            console.log('✅ 채팅방 초기화 완료');
            
        } catch (error) {
            console.error('❌ 채팅 데이터 로드 실패:', error);
            setError('채팅방을 불러올 수 없습니다.');
            Alert.alert('오류', '채팅방 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }; 

    loadChatData();
}, [chatRoomId, postId, currentUserId]); // 🔧 currentUserId도 의존성에 추가
    
    // 메시지 전송 핸들러
    const handleSend = () => {
        if (!inputText.trim()) return;
        handleSendStomp(inputText);
    };

    // 액션 버튼 토글
    const toggleActions = () => {
        setShowActions(!showActions);
    };

    // 게시물 보기 버튼
    const handleViewPost = () => {
        router.push(`/accompany/AccompanyPost?postId=${postId}`);
    };

    // 로딩 상태
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="gray" />
                    <Text style={styles.loadingText}>채팅방을 준비하는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>오류가 발생했습니다</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => {
                            setError(null);
                            setLoading(true);
                        }}
                    >
                        <Text style={styles.retryButtonText}>다시 시도</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // 메시지들을 날짜별로 그룹화
    const groupedMessages = groupMessagesByDate(messages);

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 부분 */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Feather name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
                <View style={styles.headerLocationRow}>
                    <Icon name="map-pin" size={12} color="black" style={styles.icon} />
                    <Text style={styles.locationText}>
                        {accompanyInfo?.location || chatRoom?.location || '위치 정보 없음'}
                    </Text>
                    <Ionicons name="person" size={12} color="black" style={[styles.icon, { marginLeft: 12 }]} />
                    <Text style={styles.participantsText}>
                        {/* 🔧 participants 처리 방식 변경 */}
                        {Array.isArray(chatRoom?.participants) ? chatRoom.participants.length : (chatRoom?.participantCount || 0)}명 / {accompanyInfo?.maxParticipants || chatRoom?.maxParticipants || '?'}명
                    </Text>
                </View>
                <View style={styles.headerTitleRow}>
                    <TouchableOpacity onPress={handleViewPost}>
                        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                    {accompanyInfo?.title || '테스트 제목'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

        </View>

            {/* 공지사항 */}
            <View style={styles.announcementWrapper}>
                <View style={styles.announcementContainer}>
                    <Feather name="volume-2" size={20} color="black" />
                    <Text style={styles.announcementLabel}> 안내</Text>
                    <Text style={styles.announcementText}>
                        동행 채팅방입니다.{"\n"}서로를 존중하며 즐거운 대화를 나눠주세요!
                    </Text>
                </View>
            </View>

            {/* 채팅 메시지 목록 */}
            <ScrollView 
                style={styles.messagesContainer}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {groupedMessages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>동행 채팅방이 생성되었습니다!</Text>
                        <Text style={styles.emptySubText}>첫 번째 메시지를 보내보세요!</Text>
                    </View>
                ) : (
                    groupedMessages.map(item => {
                        if (item.type === 'dateSeparator') {
                            return (
                                <DateSeparator 
                                    key={item.id}
                                    date={item.date}
                                />
                            );
                        } else {
                            return (
                                <MessageBubble 
                                    key={item.id} 
                                    message={item}
                                    showSenderName={item.showSenderName}
                                    showTime={item.showTime}
                                    isFirstInGroup={item.isFirstInGroup}
                                    isLastInGroup={item.isLastInGroup}
                                    style={item.isTemporary ? { opacity: 0.7 } : {}}
                                />
                            );
                        }
                    })
                )}
            </ScrollView>

            {/* 확장 버튼 클릭 시 노출되는 하단 버튼 영역
            {showActions && (
                <View style={styles.bottomButtons}>
                    <TouchableOpacity style={styles.actionButtonTop}>
                        <Text style={styles.actionButtonText}>내 위치 공유하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonBottom}>
                        <Text style={styles.actionButtonText}>사진/동영상 전송하기</Text>
                    </TouchableOpacity>
                </View>
            )} */}

            {/* 메시지 입력 영역 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={10}
                style={styles.inputContainer}
            >
                {/* <TouchableOpacity style={styles.addButton} onPress={toggleActions}>
                    <Feather name={showActions ? "x" : "plus"} size={24} color="black" />
                </TouchableOpacity> */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="메시지를 입력해주세요."
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        editable={!sendingMessage && isConnected}
                    />
                    <TouchableOpacity 
                        style={styles.sendButton} 
                        onPress={handleSend} 
                        disabled={!inputText.trim() || sendingMessage || !isConnected}
                    >
                        {sendingMessage ? (
                            <ActivityIndicator size="small" color="#9CA3AF" />
                        ) : (
                            <Feather 
                                name="send" 
                                size={20} 
                                color={inputText.trim() && isConnected ? "#3B82F6" : "#9CA3AF"} 
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// 스타일 정의
const bubbleStyles = StyleSheet.create({
    messageContainer: {
        marginVertical: 3,
        paddingHorizontal: 16,
        width: '100%',
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: screenWidth * 0.7,
        minWidth: 60,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
        flexShrink: 1, 
    },
    myBubble: {
        backgroundColor: '#D9D9D9',
        marginRight: 8,
    },
    otherBubble: {
        backgroundColor: '#D9D9D9',
        marginLeft: 8,
    },
    senderName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        marginLeft: 16, 
        fontWeight: '500',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 16,
        textAlign: 'left',
    },
    myMessageText: {
        color: '#000000',
    },
    otherMessageText: {
        color: '#000000',
    },
    bubbleWithTime: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        maxWidth: '100%',
    },
    timestamp: {
        fontSize: 11,
        opacity: 0.7,
        marginHorizontal: 5,
        alignSelf: 'flex-end',
        minWidth: 50, 
    },
    myTimestamp: {
        color: '#666666',
        textAlign: 'right',
    },
    otherTimestamp: {
        color: '#666666',
        textAlign: 'left',
    },
    tail: {
        position: 'absolute',
        top: 10,
        width: 0,
        height: 0,
    },
    myTail: {
        right: -8,
        borderLeftWidth: 8,
        borderLeftColor: '#D9D9D9',
        borderTopWidth: 6,
        borderTopColor: 'transparent',
        borderBottomWidth: 6,
        borderBottomColor: 'transparent',
    },
    otherTail: {
        left: -8,
        borderRightWidth: 8,
        borderRightColor: '#D9D9D9',
        borderTopWidth: 6,
        borderTopColor: 'transparent',
        borderBottomWidth: 6,
        borderBottomColor: 'transparent',
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#FF6B6B',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    errorMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    header: {
        backgroundColor: '#9CA3AF',
        paddingTop: 30,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerContent: {
        flex: 1,
    },
    headerLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        marginLeft: 4,
        marginRight: 8,
    },
    participantsText: {
        fontSize: 12,
    },
    connectionStatus: {
        marginLeft: 8,
    },
    connected: {
        color: '#10B981',
    },
    disconnected: {
        color: '#EF4444',
    },
    connectionText: {
        fontSize: 8,
    },
        headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 4,
        color: 'black',
    },
    announcementWrapper: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: 'transparent',
    },
    announcementContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#9CA3AF',
        flexDirection: 'row',
        alignItems: 'center',
    },
    announcementLabel: {
        marginLeft: 8,
        fontWeight: 'bold',
        color: '#333',
    },
    announcementText: {
        marginLeft: 8,
        flex: 1,
        color: '#333',
    },
    messagesContainer: {
        flex: 1,
        padding: 8,
    },
    dateSeparatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    dateSeparatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dateSeparatorText: {
        fontSize: 12,
        color: '#9CA3AF',
        paddingHorizontal: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
    },
    bottomButtons: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    actionButtonTop: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4B5563',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    actionButtonBottom: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4B5563',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: 'white',
        marginBottom: Platform.OS === 'ios' ? -40 : 0,
    },
    addButton: {
        padding: 6,
        marginRight: 4,
        marginBottom: 30,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        paddingLeft: 12,
        paddingRight: 4,
        marginRight: 8,
        backgroundColor: 'white',
        marginBottom: 30,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        maxHeight: 100,
        color: '#000',
    },
    sendButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Chat;