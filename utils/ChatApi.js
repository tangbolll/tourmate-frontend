import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import { API_URL } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


const formatTime = (dateString) => {
    if (!dateString) return '';

    // 서버에서 보내는 시간이 UTC라고 가정
    // 시간대 정보가 없으면 UTC(Z)를 붙임
    let utcDateString = dateString;
    if (!dateString.includes('Z') && !dateString.includes('+')) {
        utcDateString = dateString + 'Z'; // UTC 표시
    }

    const date = new Date(utcDateString);
    
    const result = date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Seoul' // UTC를 한국 시간으로 변환
    });
    return result;
};

// 내가 속한 채팅방 목록 가져오기
export const getMyChatRooms = async (userId) => {
    try {
        const url = `${API_URL}/api/accompany/my-chatrooms?currentUserId=${userId}`;
        console.log('API 호출 URL:', url);
        console.log('User ID:', userId);
        
        if (!userId) {
            throw new Error('사용자 ID가 없습니다');
        }
        
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
            
            if (response.status === 403) {
                console.log('🚫 403 Forbidden - 사용자 권한 없음');
                console.log('전송된 userId:', userId);
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw server response:', data);
        return data;
        
    } catch (error) {
        console.error('채팅방 목록을 가져오는데 실패했습니다:', error);
        throw error;
    }
};

// 채팅방 상세 정보 가져오기 - currentUserId 추가
export const getChatRoomById = async (chatRoomId, currentUserId) => {
    try {
        const url = `${API_URL}/api/accompany/chatroom/${chatRoomId}?currentUserId=${currentUserId}`;
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

// 동행 ID로 채팅방 조회/생성 - currentUserId 추가
export const getOrCreateChatRoomByAccompanyId = async (accompanyId, currentUserId) => {
    try {
        const url = `${API_URL}/api/accompany/${accompanyId}/chatroom?currentUserId=${currentUserId}`;
        console.log('채팅방 조회/생성 API 호출:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        
        console.log('응답 상태:', response.status);
        
        if (response.ok) {
            const roomData = await response.json();
            console.log('채팅방 데이터:', roomData);
            return roomData;
        } else {
            const errorText = await response.text();
            console.error('API 에러 응답:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
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
            const errorText = await response.text();
            console.error('API 에러 응답:', errorText);
            throw new Error(`메시지 조회 실패: ${response.status} - ${errorText}`);
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
            const errorText = await response.text();
            console.error('API 에러 응답:', errorText);
            throw new Error(`메시지 전송 실패: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('❌ 메시지 전송 오류:', error);
        throw error;
    }
};

// 채팅방 정보 가져오기 - currentUserId 매개변수 추가 및 완전한 구현
export const fetchOrCreateChatRoom = async (accompanyIdOrChatRoomId, currentUserId, isChatRoomId = false) => {
    try {
        // JWT 토큰 가져오기
        const token = await AsyncStorage.getItem('jwtToken');
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        
        // 토큰이 있으면 Authorization 헤더 추가
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        let url;
        
        // chatRoomId로 직접 조회하는 경우
        if (isChatRoomId) {
            url = `${API_URL}/api/accompany/chatroom/${accompanyIdOrChatRoomId}?currentUserId=${currentUserId}`;
            console.log('채팅방 직접 조회:', url);
        } 
        // accompanyId로 조회/생성하는 경우
        else {
            url = `${API_URL}/api/accompany/${accompanyIdOrChatRoomId}/chatroom?currentUserId=${currentUserId}`;
            console.log('채팅방 조회/생성 API 호출:', url);
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers, // JWT 토큰이 포함된 헤더 사용
        });
        
        console.log('응답 상태:', response.status);
        
        if (response.ok) {
            const roomData = await response.json();
            console.log('채팅방 데이터:', roomData);
            return roomData;
        } else {
            const errorText = await response.text();
            console.error('API 에러 응답:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
    } catch (error) {
        console.error('채팅방 조회/생성 오류:', error);
        throw error;
    }
};

// 기존 메시지 불러오기
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
            const errorText = await response.text();
            console.error('API 에러 응답:', errorText);
            throw new Error(`메시지 조회 실패: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('❌ 메시지 조회 오류:', error);
        throw error;
    }
};

// 동행 게시물 정보 조회
export const getAccompanyPostInfo = async (accompanyId, currentUserId) => {
    try {
        const url = `${API_URL}/api/accompany/AccompanyPost?postId=${accompanyId}&userId=${currentUserId}`;
        console.log('🌐 동행 게시물 API 호출:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('📡 응답 상태:', response.status, response.statusText);

        if (response.ok) {
            const backendData = await response.json();
            console.log('📋 백엔드 원본 데이터:', backendData);
            
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

// transformAccompanyDetail 채팅용
const transformAccompanyDetailForChat = (backendData) => {
    if (!backendData) return null;

    console.log('🔄 데이터 변환 시작:', backendData);

    const transformed = {
        id: backendData.id?.toString() || '1',
        title: backendData.title || '제목 없음',
        location: backendData.location || '위치 미정',
        
        members: backendData.member ? Array.from(backendData.member).map(p => p.userId?.toString()) : [],
        applicants: backendData.applyMember ? Array.from(backendData.applyMember).map(a => a.userId?.toString()) : [],
        
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