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


const { width: screenWidth } = Dimensions.get('window');
const CHARS_PER_LINE = 24;

const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};

const API_URL = getBaseURL();

// MessageBubble 컴포넌트
const MessageBubble = ({ message, style }) => {
    const MAX_BUBBLE_WIDTH = screenWidth * 0.75;
    const isMyMessage = message.user?.isSelf || false;

    return (
        <View style={[
            bubbleStyles.messageContainer,
            isMyMessage ? bubbleStyles.myMessageContainer : bubbleStyles.otherMessageContainer,
            style
        ]}>
            {/* 발신자 이름 (상대방 메시지만) */}
            {!isMyMessage && (
                <Text style={bubbleStyles.senderName}>
                    {message.user?.name || '익명'}
                </Text>
            )}
            
            <View style={bubbleStyles.bubbleWithTime}>
                {/* 시간 표시 (내 메시지일 때 왼쪽에) */}
                {isMyMessage && message.time && (
                    <Text style={[bubbleStyles.timestamp, bubbleStyles.myTimestamp]}>
                        {message.time}
                    </Text>
                )}
                
                <View style={[
                    bubbleStyles.bubble,
                    isMyMessage ? bubbleStyles.myBubble : bubbleStyles.otherBubble,
                ]}>
                    {/* 말풍선 꼬리 */}
                    <View style={[
                        bubbleStyles.tail,
                        isMyMessage ? bubbleStyles.myTail : bubbleStyles.otherTail
                    ]} />
                    
                    <Text style={[
                        bubbleStyles.messageText,
                        isMyMessage ? bubbleStyles.myMessageText : bubbleStyles.otherMessageText
                    ]}>
                        {message.text}
                    </Text>
                </View>
                
                {/* 시간 표시 (상대방 메시지일 때 오른쪽에) */}
                {!isMyMessage && message.time && (
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

    
    // URL 파라미터에서 데이터 추출
    const postId = params.postId;
    const location = params.location || '위치 정보 없음';
    const participants = parseInt(params.participants) || 0;
    const maxParticipants = parseInt(params.maxParticipants) || 0;
    
    console.log('Chat 컴포넌트 파라미터:', { postId, location, participants, maxParticipants });

    // 상태 관리
    const [chatRoom, setChatRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [showActions, setShowActions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    
    
    const scrollViewRef = useRef();
    const stompClientRef = useRef(null);
    
    // 현재 사용자 ID
    const currentUserId = 2;

    // 채팅방 정보 가져오기 또는 생성
    const fetchOrCreateChatRoom = async (accompanyId) => {
        try {
            const url = `${API_URL}/api/accompany/${accompanyId}/chatroom`;
            console.log('채팅방 조회/생성 API 호출:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const roomData = await response.json();
                console.log('✅ 채팅방 데이터 (기존/새로생성):', roomData);
                setChatRoom(roomData);
                return roomData;
            } else if (response.status === 404) {
                // 404면 채팅방이 없다는 뜻이므로, 다시 요청하면 백엔드에서 자동 생성
                console.log('📝 채팅방이 없음, 자동 생성 요청');
                const createResponse = await fetch(url);
                
                if (createResponse.ok) {
                    const newRoomData = await createResponse.json();
                    console.log('✅ 새 채팅방 자동 생성:', newRoomData);
                    setChatRoom(newRoomData);
                    return newRoomData;
                } else {
                    throw new Error(`채팅방 생성 실패: ${createResponse.status}`);
                }
            } else {
                throw new Error(`채팅방 조회 실패: ${response.status}`);
            }
        } catch (error) {
            console.error('채팅방 조회/생성 오류:', error);
            throw error;
        }
    };

    useEffect(() => {
    if (!chatRoom?.id || !currentUserId) return;

    const socket = new SockJS(`${API_URL}/ws`);
    const stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: str => console.log(str),
        onConnect: () => {
            console.log('웹소켓 연결됨');

            stompClient.subscribe(`/topic/chatroom.${chatRoom.id}`, (msg) => {
                const chatMessage = JSON.parse(msg.body);
                setMessages(prev => [...prev, {
                    id: chatMessage.id,
                    user: {
                        isSelf: chatMessage.senderId === currentUserId,
                        name: chatMessage.senderNickname
                    },
                    text: chatMessage.content,
                    time: new Date(chatMessage.sendTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }]);
            });
        }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
        stompClient.deactivate();
    };
}, [chatRoom?.id, currentUserId]);

const handleSendStomp = (text = '') => {
  // 텍스트가 없으면 전송하지 않음
  if (!text.trim() || !stompClientRef.current?.connected || !chatRoom?.id) return;

  // 서버로 보낼 메시지 포맷: 서버 API 스펙에 맞춰서 작성
  const messageBody = {
    senderId: currentUserId,  // 현재 사용자 ID
    roomId: chatRoom.id,      // 현재 채팅방 ID
    message: text             // 전송 메시지
  };

  try {
    // STOMP 클라이언트로 메시지 publish (서버와 약속된 경로)
    stompClientRef.current.publish({
      destination: '/app/chat.sendMessage',  // 서버 쪽 @MessageMapping 경로와 일치해야 함
      body: JSON.stringify(messageBody)
    });

    setInputText('');  // 전송 성공 후 입력창 초기화
  } catch (error) {
    Alert.alert("전송 실패", "메시지를 보낼 수 없습니다.");
  }
};

const fetchMessages = async (roomId) => {
  try {
    const res = await fetch(`${API_URL}/api/accompany/chatroom/${roomId}/messages`);
    if (res.ok) {
      const messageList = await res.json();
      setMessages(
        messageList.map(msg => ({
          id: msg.id,
          user: {
            isSelf: msg.senderId === currentUserId,
            name: msg.senderNickname
          },
          text: msg.content,
          time: formatTime(msg.sendTime)
        }))
      );
    }
  } catch (e) {
    console.error('메시지 불러오기 실패:', e);
  }
};

useEffect(() => {
  if (scrollViewRef.current) {
    scrollViewRef.current.scrollToEnd({ animated: true });
  }
}, [messages]);

    // 시간 포맷팅
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    // 초기 데이터 로드
    useEffect(() => {
        const loadChatData = async () => {
            if (!postId) {
                setError('잘못된 동행 ID입니다.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                console.log('🚀 채팅방 초기화 시작: postId =', postId);
                
                // 1. 채팅방 정보 가져오기 (없으면 자동 생성)
                const roomData = await fetchOrCreateChatRoom(postId);
                
                if (!roomData) {
                    setError('채팅방을 생성할 수 없습니다.');
                    return;
                }
                
                // 2. 메시지 목록 가져오기
                await fetchMessages(roomData.id);
                
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
    }, [postId]);

    // 메시지 전송 핸들러
    const handleSend = () => {
        if ((inputText || '').trim() === '') return;
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
                    <ActivityIndicator size="large" color="#007AFF" />
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
                        <Text style={styles.locationText}>{location}</Text>
                        <Ionicons name="person" size={12} color="black" style={[styles.icon, { marginLeft: 12 }]} />
                        <Text style={styles.participantsText}>{participants}명 / {maxParticipants}명</Text>
                    </View>
                    <View style={styles.headerTitleRow}>
                        <TouchableOpacity onPress={handleViewPost}>
                            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                                {chatRoom?.roomName || `동행 ${postId} 채팅방`}
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
                        동행 {postId}번의 채팅방입니다.{"\n"}서로를 존중하며 즐거운 대화를 나눠주세요!
                    </Text>
                </View>
            </View>

            {/* 채팅 메시지 목록 */}
            <ScrollView 
                style={styles.messagesContainer}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>동행 {postId}번 채팅방이 생성되었습니다!</Text>
                        <Text style={styles.emptySubText}>첫 번째 메시지를 보내보세요!</Text>
                    </View>
                ) : (
                    messages.map(message => (
                        <MessageBubble 
                            key={message.id} 
                            message={message}
                            style={message.isTemporary ? { opacity: 0.7 } : {}}
                        />
                    ))
                )}
            </ScrollView>

            {/* 확장 버튼 클릭 시 노출되는 하단 버튼 영역 */}
            {showActions && (
                <View style={styles.bottomButtons}>
                    <TouchableOpacity style={styles.actionButtonTop}>
                        <Text style={styles.actionButtonText}>내 위치 공유하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonBottom}>
                        <Text style={styles.actionButtonText}>사진/동영상 전송하기</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* 메시지 입력 영역 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={10}
                style={styles.inputContainer}
            >
                <TouchableOpacity style={styles.addButton} onPress={toggleActions}>
                    <Feather name={showActions ? "x" : "plus"} size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="메시지를 입력해주세요."
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        editable={!sendingMessage}
                    />
                    <TouchableOpacity 
                        style={styles.sendButton} 
                        onPress={handleSend} 
                        disabled={!inputText.trim() || sendingMessage}
                    >
                        {sendingMessage ? (
                            <ActivityIndicator size="small" color="#9CA3AF" />
                        ) : (
                            <Feather 
                                name="send" 
                                size={20} 
                                color={inputText.trim() ? "#3B82F6" : "#9CA3AF"} 
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// 기존 스타일에 버블 스타일 추가
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 4,
        flex: 1,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailButton: {
        backgroundColor: '#DEE2E6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginRight: 8,
    },
    detailButtonText: {
        fontSize: 12,
    },
    menuButton: {
        padding: 4,
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
    },
    addButton: {
        padding: 6,
        marginRight: 4,
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