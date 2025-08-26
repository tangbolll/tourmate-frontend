import Constants from 'expo-constants';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';

// API 베이스 URL 설정
    const getBaseURL = () => {
    // 개발 모드일 때
    if (__DEV__) {
        if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8080';
        }
        if (Platform.OS === 'web') {
        return 'http://localhost:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } 
    // 배포(프로덕션) 모드일 때
    else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
    };
const API_URL = getBaseURL();

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
};

// 내가 속한 채팅방 목록 가져오기
export const getMyChatRooms = async (userId) => {
    try {
        const url = `${API_URL}/api/accompany/my-chatrooms?id=${userId}`;
        console.log('API 호출 URL:', url);
        console.log('User ID:', userId);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw server response:', data);
        
        // 서버 응답 데이터 변환 - UserResponse 객체 배열을 숫자로 변환
        const transformedData = data.map(item => {
            console.log('Original item:', JSON.stringify(item, null, 2));
            
            // participants가 UserResponse 객체 배열이므로 length로 변환
            let participantCount = 0;
            if (Array.isArray(item.participants)) {
                participantCount = item.participants.length;
            } else if (typeof item.participants === 'number') {
                participantCount = item.participants;
            } else {
                participantCount = 1; // 기본값
            }
            
            const transformed = {
                id: item.id,
                participants: participantCount,
                // roomName을 title로 매핑
                title: item.roomName || item.title || '제목 없음',
                // accompanyId 추가 (백엔드에서 추가한 필드)
                accompanyId: item.accompanyId,
                // 기본값들 설정
                photo: item.photo || 'https://via.placeholder.com/50',
                message: item.latestMessage || item.message || '최근 메시지가 없습니다',
                timestamp: item.createdAt ? 
                    new Date(item.createdAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric'
                    }) : 
                    (item.timestamp || '시간 없음'),
                unreadCount: item.unreadCount || 0,
                active: item.active
            };
            
            console.log('Transformed item:', JSON.stringify(transformed, null, 2));
            return transformed;
        });
        
        console.log('Transformed data:', transformedData);
        return transformedData;
    } catch (error) {
        console.error('채팅방 목록을 가져오는데 실패했습니다:', error);
        throw error;
    }
};

// 채팅방 상세 정보 가져오기
export const getChatRoomById = async (chatRoomId) => {
    try {
        const url = `${API_URL}/api/accompany/chatroom/${chatRoomId}`;
        console.log('채팅방 상세 조회 URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('ChatRoom detail response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('ChatRoom detail error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('ChatRoom detail response:', data);
        
        return data;
    } catch (error) {
        console.error('채팅방 상세 정보를 가져오는데 실패했습니다:', error);
        throw error;
    }
};

// 채팅방 나가기
export const exitChatRoom = async (chatRoomId, userId) => {
    try {
        const url = `${API_URL}/api/accompany/chatroom/${chatRoomId}/exit?userId=${userId}`;
        console.log('Exit chatroom URL:', url);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Exit response status:', response.status);

        if (!response.ok) {
            const errorMessage = await response.text();
            console.log('Exit error response:', errorMessage);
            throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        console.log('Exit success:', result);
        return result;
    } catch (error) {
        console.error('채팅방 나가기에 실패했습니다:', error);
        throw error;
    }
};

// 동행 ID로 채팅방 조회/생성
export const getOrCreateChatRoomByAccompanyId = async (accompanyId) => {
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
            console.log('✅ 채팅방 데이터:', roomData);
            return roomData;
        } else {
            throw new Error(`채팅방 조회/생성 실패: ${response.status}`);
        }
        
    } catch (error) {
        console.error('채팅방 조회/생성 오류:', error);
        throw error;
    }
};

// 채팅방 메시지 목록 가져오기
export const getChatMessages = async (roomId) => {
    try {
        const url = `${API_URL}/api/accompany/chatroom/${roomId}/messages`;
        console.log('🌐 메시지 조회 API 호출:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const messagesData = await response.json();
            console.log('✅ 메시지 데이터:', messagesData);
            return messagesData;
        } else {
            throw new Error(`메시지 조회 실패: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ 메시지 조회 오류:', error);
        throw error;
    }
};

// 메시지 전송 (WebSocket 사용 전 REST API 대안)
export const sendMessage = async (chatRoomId, userId, message) => {
    try {
        const url = `${API_URL}/api/accompany/chatroom/${chatRoomId}/message`;
        console.log('메시지 전송 API 호출:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                senderId: userId,
                content: message,
                roomId: chatRoomId
            }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ 메시지 전송 성공:', result);
            return result;
        } else {
            throw new Error(`메시지 전송 실패: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ 메시지 전송 오류:', error);
        throw error;
    }
};

// 채팅방 정보 가져오기
export const fetchOrCreateChatRoom = async (accompanyIdOrChatRoomId, isChatRoomId = false) => {
    try {
        // chatRoomId로 직접 조회하는 경우
        if (isChatRoomId) {
            const url = `${API_URL}/api/accompany/chatroom/${accompanyIdOrChatRoomId}`;
            console.log('채팅방 직접 조회:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const roomData = await response.json();
                console.log('✅ 채팅방 데이터 (직접 조회):', roomData);
                return roomData;
            }
        } 
        // accompanyId로 조회/생성하는 경우
        else {
            const url = `${API_URL}/api/accompany/${accompanyIdOrChatRoomId}/chatroom`;
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
                console.log('✅ 채팅방 데이터 (동행 ID):', roomData);
                return roomData;
            }
        }
        
        throw new Error('채팅방 조회/생성 실패');
        
    } catch (error) {
        console.error('채팅방 조회/생성 오류:', error);
        throw error;
    }
};


// 기존 메시지 불러오기 - ✅ currentUserId를 매개변수로 받도록 수정
export const fetchMessages = async (roomId, currentUserId) => {
    try {
        const url = `${API_URL}/api/accompany/chatroom/${roomId}/messages`;
        console.log('🌐 메시지 조회 API 호출:', url);

        const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const messagesData = await response.json();
                console.log('✅ 메시지 데이터:', messagesData);
                
                // 백엔드 응답을 프론트엔드 형식으로 변환
                const transformedMessages = messagesData.map(msg => ({
                    id: msg.id || msg.roomId + '_' + msg.sendTime,
                    user: {
                        name: msg.senderNickname || `사용자${msg.senderId}`,
                        isSelf: String(msg.senderId) === String(currentUserId),
                    },
                    text: msg.content,
                    time: formatTime(msg.sendTime),
                    sendTime: msg.sendTime
                }));
                
                // 시간순 정렬
                transformedMessages.sort((a, b) => new Date(a.sendTime) - new Date(b.sendTime));
                
                return transformedMessages;
            } else {
                throw new Error(`메시지 조회 실패: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ 메시지 조회 오류:', error);
            throw error;
        }
    };

// 동행 게시물 정보 조회 - ✅ currentUserId를 매개변수로 받도록 수정
export const getAccompanyPostInfo = async (accompanyId, currentUserId) => {
    try {
        const url = `${API_URL}/api/accompany/AccompanyPost?postId=${accompanyId}&userId=${currentUserId}`;
        console.log('🌐 동행 게시물 API 호출 (올바른 엔드포인트):', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('📡 응답 상태:', response.status, response.statusText);

        if (response.ok) {
            const backendData = await response.json();
            console.log('📋 백엔드 원본 데이터 (올바른 엔드포인트):', backendData);
            
            // 🔧 다른 페이지와 동일한 변환 로직 사용
            const transformedData = transformAccompanyDetailForChat(backendData);
            
            console.log('✅ 변환된 데이터:', transformedData);
            return transformedData;
            
        } else {
            const errorText = await response.text();
            console.error('❌ API 오류 응답:', errorText);
            throw new Error(`동행 정보 조회 실패: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('❌ 동행 정보 조회 오류:', error);
        throw error;
    }
};

//  transformAccompanyDetail 채팅용
const transformAccompanyDetailForChat = (backendData) => {
    if (!backendData) return null;

    console.log('🔄 데이터 변환 시작:', backendData);


    const transformed = {
        id: backendData.id?.toString() || '1',
        title: backendData.title || '제목 없음',
        location: backendData.location || '위치 미정',
        
        // 🔧 member 처리 방식을 다른 페이지와 동일하게
        members: backendData.member ? Array.from(backendData.member).map(p => p.userId?.toString()) : [],
        applicants: backendData.applyMember ? Array.from(backendData.applyMember).map(a => a.userId?.toString()) : [],
        
        // 🔧 participants 계산 로직을 다른 페이지와 동일하게  
        currentParticipants: backendData.currentParticipants || (backendData.member ? backendData.member.size : 1),
        maxParticipants: backendData.maxRecruit || 0,

        createdByName: backendData.nickname || '알 수 없음',
    };

    console.log('✅ 변환 완료:', transformed);
    return transformed;
};



// WebSocket URL 가져오기
export const getWebSocketURL = () => {
    return `${API_URL}/ws`;
};

// API 베이스 URL 내보내기 (다른 컴포넌트에서 필요한 경우)
export const getAPIBaseURL = () => {
    return API_URL;
};