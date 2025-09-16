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
    Dimensions,
    Keyboard
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    fetchOrCreateChatRoom,
    fetchMessages,
    getWebSocketURL,
    getAccompanyPostInfo,
    markMessagesAsRead
} from '../../utils/ChatApi';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
            isFirstInGroup ? {} : { marginTop: 2 },
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
                    isFirstInGroup ? {} : (isMyMessage ? { marginRight: 8 } : { marginLeft: 8 })
                ]}>
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
    const insets = useSafeAreaInsets();
    const postId = params.postId;
    const chatRoomId = params.chatRoomId;
    const { currentUserId } = useAuth();

    // 키보드 상태 관리 - 더 안정적인 방식
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [screenData, setScreenData] = useState(Dimensions.get('window'));

    // 기존 상태들
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

    // 화면 크기 변화 감지 (키보드로 인한)
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
            setScreenData(window);
        });

        return () => subscription?.remove();
    }, []);

    // 키보드 리스너 설정 - 개선된 버전
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            console.log('키보드 표시됨:', e.endCoordinates.height);
            setKeyboardHeight(e.endCoordinates.height);
            setKeyboardVisible(true);
            
            // 키보드가 나타날 때 자동 스크롤 - 약간의 지연
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 150);
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            console.log('키보드 숨김');
            setKeyboardHeight(0);
            setKeyboardVisible(false);
        });

        const keyboardWillShowListener = Platform.OS === 'ios' 
            ? Keyboard.addListener('keyboardWillShow', (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setKeyboardVisible(true);
            })
            : null;

        const keyboardWillHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => {
                setKeyboardHeight(0);
                setKeyboardVisible(false);
            })
            : null;

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
            keyboardWillShowListener?.remove();
            keyboardWillHideListener?.remove();
        };
    }, []);

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
            
            if (!currentDate || !isSameDay(currentDate, messageDate)) {
                currentDate = messageDate;
                grouped.push({
                    type: 'dateSeparator',
                    date: formatDateForSeparator(messageDate),
                    id: `date_${messageDate}_${index}`
                });
            }
            
            const prevMessage = messages[index - 1];
            const nextMessage = messages[index + 1];
            
            const isSameUser = prevMessage && 
                prevMessage.user?.isSelf === message.user?.isSelf &&
                (prevMessage.user?.name === message.user?.name || 
                 (prevMessage.user?.isSelf && message.user?.isSelf));
            
            const isNextSameUser = nextMessage && 
                nextMessage.user?.isSelf === message.user?.isSelf &&
                (nextMessage.user?.name === message.user?.name || 
                 (nextMessage.user?.isSelf && message.user?.isSelf));
            
            const isSameTime = prevMessage && 
                formatTime(prevMessage.sendTime) === formatTime(message.sendTime);
            
            const isNextSameTime = nextMessage && 
                formatTime(nextMessage.sendTime) === formatTime(message.sendTime);
            
            const isFirstInGroup = !isSameUser || !isSameDay(prevMessage?.sendTime, messageDate);
            const isLastInGroup = !isNextSameUser || !isSameDay(nextMessage?.sendTime, messageDate);
            
            const showTime = isLastInGroup || !isNextSameTime;
            const showSenderName = isFirstInGroup;
            
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

    // 웹소켓 연결 (기존 코드 유지)
    useEffect(() => {
        if (!chatRoom?.id || !currentUserId) {
            console.log('웹소켓 연결 조건 미충족:', { 
                chatRoomId: chatRoom?.id, 
                currentUserId 
            });
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

                const subscription = stompClient.subscribe(
                    `/topic/chatroom.${chatRoom.id}`, 
                    (message) => {
                        console.log('📨 새 메시지 수신:', message.body);
                        try {
                            const chatMessage = JSON.parse(message.body);
                            
                            if (String(chatMessage.senderId) === String(currentUserId)) {
                                console.log('🔄 내 메시지는 웹소켓에서 무시:', chatMessage.senderId);
                                return;
                            }
                            
                            const newMessage = {
                                id: chatMessage.id || `ws_${chatMessage.roomId}_${Date.now()}_${Math.random()}`,
                                user: {
                                    isSelf: false,
                                    name: chatMessage.senderNickname || `사용자${chatMessage.senderId}`
                                },
                                text: chatMessage.content,
                                time: formatTime(chatMessage.sendTime || new Date()),
                                sendTime: chatMessage.sendTime || new Date().toISOString()
                            };
                            
                            setMessages(prev => {
                                const isDuplicate = prev.some(msg => 
                                    msg.id === newMessage.id || 
                                    (msg.text === newMessage.text && 
                                     msg.user?.name === newMessage.user?.name &&
                                     Math.abs(new Date(msg.sendTime) - new Date(newMessage.sendTime)) < 1000)
                                );
                                
                                if (isDuplicate) {
                                    console.log('🔄 중복 메시지 방지:', newMessage.id);
                                    return prev;
                                }
                                
                                console.log('➕ 상대방 새 메시지 추가:', newMessage);
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

        return () => {
            console.log('🔌 웹소켓 연결 해제');
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
            setIsConnected(false);
        };
    }, [chatRoom?.id, currentUserId]);

    // 메시지 전송 함수 (기존 코드 유지)
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
        
        const tempId = `my_temp_${Date.now()}_${Math.random()}`;
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
            tempId: tempId
        };
        
        console.log('➕ 낙관적 업데이트 - 내 메시지만 임시 추가:', tempMessage);
        setMessages(prev => [...prev, tempMessage]);
        setInputText('');

        // 메시지 추가 후 스크롤
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const messageBody = {
                senderId: parseInt(currentUserId),
                roomId: chatRoom.id,
                message: text.trim()
            };

            console.log('📤 메시지 전송:', messageBody);

            stompClientRef.current.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(messageBody)
            });

            console.log('✅ 메시지 전송 완료');

            setTimeout(() => {
                setMessages(prev => 
                    prev.map(msg => 
                        msg.tempId === tempId 
                            ? { ...msg, isTemporary: false, tempId: undefined }
                            : msg
                    )
                );
            }, 500);

        } catch (error) {
            console.error('❌ 메시지 전송 오류:', error);
            
            setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
            Alert.alert('전송 실패', '메시지를 보낼 수 없습니다.');
        } finally {
            setSendingMessage(false);
        }
    };

    // 메시지 추가 시 자동 스크롤 (개선된 로직)
    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            const delay = keyboardVisible ? 200 : 100;
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, delay);
        }
    }, [messages]);

    // 초기 데이터 로드 (기존 코드 유지)
    useEffect(() => {
        const loadChatData = async () => {
            if (!currentUserId) {
                console.log('⏳ currentUserId 로딩 대기 중...');
                return;
            }
            
            if (!chatRoomId && !postId) {
                setError('잘못된 접근입니다.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                console.log('🚀 채팅방 초기화 시작');
                console.log('📝 파라미터:', { chatRoomId, postId, currentUserId });
                
                let roomData;
                
                if (chatRoomId) {
                    roomData = await fetchOrCreateChatRoom(chatRoomId, currentUserId, true);
                } else if (postId) {
                    roomData = await fetchOrCreateChatRoom(postId, currentUserId, false);
                }
                if (!roomData) {
                    setError('채팅방을 불러올 수 없습니다.');
                    return;
                }
                
                console.log('🏠 채팅방 데이터:', roomData);
                setChatRoom(roomData);
                
                const accompanyIdToUse = roomData.accompanyId || postId;
                console.log('🎯 동행 ID:', accompanyIdToUse);
                
                if (accompanyIdToUse) {
                    try {
                        const postInfo = await getAccompanyPostInfo(accompanyIdToUse, currentUserId);
                        console.log('📋 동행 정보:', postInfo);
                        setAccompanyInfo(postInfo);
                    } catch (error) {
                        console.error('동행 정보 조회 실패:', error);
                    }
                }
                
                const messages = await fetchMessages(roomData.id, currentUserId);
                console.log('💬 메시지 개수:', messages.length);
                setMessages(messages);

                if (roomData && roomData.id && currentUserId) {
                    await markMessagesAsRead(roomData.id, currentUserId);
                }
                
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
    }, [chatRoomId, postId, currentUserId]);
        
    // 메시지 전송 핸들러
    const handleSend = () => {
        if (!inputText.trim()) return;
        handleSendStomp(inputText);
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

            {/* 채팅 메시지 목록 - 키보드와 함께 조정되는 ScrollView */}
            <ScrollView 
                style={styles.messagesContainer}
                ref={scrollViewRef}
                contentContainerStyle={[
                    styles.messagesContentContainer,
                    {
                        paddingBottom: keyboardVisible 
                            ? keyboardHeight + 80  // 키보드 높이 + 입력창 + 여유 공간
                            : 80  // 기본 상태에서는 입력창 높이만큼만
                    }
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                    setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                }}
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

            {/* 메시지 입력 영역 - 키보드 높이에 따라 절대 위치 조정 */}
            <View style={[
                styles.inputContainer,
                {
                    position: 'absolute',
                    bottom: keyboardVisible ? keyboardHeight : 0,
                    left: 0,
                    right: 0,
                }
            ]}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="메시지를 입력해주세요."
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxHeight={80}
                        editable={!sendingMessage && isConnected}
                        onFocus={() => {
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 300);
                        }}
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
            </View>
        </SafeAreaView>
    );
};

// 기존 스타일들 유지하되 일부 수정
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
        backgroundColor: '#00000066',
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
    messagesContentContainer: {
        flexGrow: 1,
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
    inputContainer: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        paddingLeft: 12,
        paddingRight: 4,
        backgroundColor: 'white',
        minHeight: 44,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        color: '#000',
    },
    sendButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 40,
        minHeight: 40,
    }
});

export default Chat;