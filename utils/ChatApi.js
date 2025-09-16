import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import { API_URL } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// dayjs 플러그인 확장
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');

// 🔧 UTC 시간을 한국 시간대로 변환하는 공통 함수
const parseUTCToKoreanTime = (dateString) => {
    if (!dateString) return null;

    // 시간대 정보가 없으면 UTC(Z)를 붙임
    let utcDateString = dateString;
    if (!dateString.includes('Z') && !dateString.includes('+')) {
        utcDateString = dateString + 'Z';
    }

    return dayjs.utc(utcDateString).tz('Asia/Seoul');
};

// 🔧 채팅방 리스트용 타임스탬프 포맷팅 (사용자 친화적)
export const formatChatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const messageTime = parseUTCToKoreanTime(timestamp);
    if (!messageTime) return '';
    
    const now = dayjs().tz('Asia/Seoul');
    const diffInMinutes = now.diff(messageTime, 'minute');
    const diffInHours = now.diff(messageTime, 'hour');
    const diffInDays = now.diff(messageTime, 'day');
    
    // 1분 미만
    if (diffInMinutes < 1) {
        return '방금';
    }
    // 1시간 미만
    else if (diffInHours < 1) {
        return `${diffInMinutes}분 전`;
    }
    // 24시간 미만 - 시간:분으로 표시
    else if (diffInHours < 24) {
        return messageTime.format('HH:mm');
    }
    // 2일 전
    else if (diffInDays === 1) {
        return '어제';
    }
    // 3일 전까지는 구체적으로
    else if (diffInDays === 2) {
        return '2일 전';
    }
    else if (diffInDays === 3) {
        return '3일 전';
    }
    // 1주일 미만 - 월일로 표시
    else if (diffInDays < 100) {
        return messageTime.format('M월 D일');
    }
    // 1주일 이상 - 년도까지
    else {
        const currentYear = now.year();
        const messageYear = messageTime.year();
        
        // 같은 년도면 월.일만
        if (currentYear === messageYear) {
            return messageTime.format('M.D');
        } else {
            return messageTime.format('YYYY.M.D');
        }
    }
};

// 🔧 채팅 메시지용 시간 포맷팅 (HH:mm)
export const formatMessageTime = (dateString) => {
    if (!dateString) return '';

    const messageTime = parseUTCToKoreanTime(dateString);
    if (!messageTime) return '';
    
    return messageTime.format('HH:mm');
};

// 🔧 날짜 포맷팅 함수 (YYYY.M.D 형식)
export const formatPostDate = (timestamp) => {
    if (!timestamp) return '알 수 없음';
    
    const date = parseUTCToKoreanTime(timestamp);
    if (!date) return '알 수 없음';
    
    return date.format('YYYY.M.D');
};

// 🔧 채팅방 메시지 날짜 구분선용 포맷팅
export const formatMessageDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    
    const messageTime = parseUTCToKoreanTime(timestamp);
    if (!messageTime) return '';
    
    const now = dayjs().tz('Asia/Seoul');
    const diffInDays = now.diff(messageTime, 'day');
    
    if (diffInDays === 0) {
        return '오늘';
    } else if (diffInDays === 1) {
        return '어제';
    } else if (diffInDays < 7) {
        return messageTime.format('M월 D일');
    } else {
        const currentYear = now.year();
        const messageYear = messageTime.year();
        
        if (currentYear === messageYear) {
            return messageTime.format('M월 D일');
        } else {
            return messageTime.format('YYYY년 M월 D일');
        }
    }
};

// 🔧 상대적 시간 표시 (더 자세한 버전)
export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageTime = parseUTCToKoreanTime(timestamp);
    if (!messageTime) return '';
    
    const now = dayjs().tz('Asia/Seoul');
    const diffInSeconds = now.diff(messageTime, 'second');
    const diffInMinutes = now.diff(messageTime, 'minute');
    const diffInHours = now.diff(messageTime, 'hour');
    const diffInDays = now.diff(messageTime, 'day');
    const diffInWeeks = now.diff(messageTime, 'week');
    const diffInMonths = now.diff(messageTime, 'month');
    
    if (diffInSeconds < 30) {
        return '방금 전';
    } else if (diffInMinutes < 1) {
        return '1분 미만';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
    } else if (diffInDays === 1) {
        return '어제';
    } else if (diffInDays < 7) {
        return `${diffInDays}일 전`;
    } else if (diffInWeeks === 1) {
        return '1주일 전';
    } else if (diffInWeeks < 4) {
        return `${diffInWeeks}주일 전`;
    } else if (diffInMonths === 1) {
        return '1개월 전';
    } else if (diffInMonths < 12) {
        return `${diffInMonths}개월 전`;
    } else {
        return messageTime.format('YYYY.M.D');
    }
};


// 참가자 데이터 변환 함수
const transformParticipants = (room) => {
    console.log('참가자 데이터 변환 시작:', room);
    
    // 다양한 백엔드 응답 형태에 대응
    let participants = [];
    
    if (room.participants) {
        // participants 배열이 있는 경우
        participants = Array.isArray(room.participants) ? room.participants : [];
    } else if (room.members) {
        // members 배열이 있는 경우
        participants = Array.isArray(room.members) ? room.members : [];
    } else if (room.member) {
        // member Set이나 배열이 있는 경우
        participants = Array.isArray(room.member) 
            ? room.member 
            : Array.from(room.member || []);
    } else if (room.participantList) {
        // participantList가 있는 경우
        participants = Array.isArray(room.participantList) ? room.participantList : [];
    } else if (room.userList) {
        // userList가 있는 경우
        participants = Array.isArray(room.userList) ? room.userList : [];
    }
    
    console.log('추출된 참가자 원본:', participants);
    
    // 각 참가자 데이터 정규화
    const transformedParticipants = participants.map((participant, index) => {
        if (typeof participant === 'string') {
            // 참가자가 문자열(ID)인 경우
            return {
                userId: participant,
                nickname: `사용자${participant}`,
                profileImage: null
            };
        } else if (typeof participant === 'object' && participant !== null) {
            // 참가자가 객체인 경우
            return {
                userId: participant.userId || participant.id || participant.user_id || `user${index}`,
                nickname: participant.nickname || participant.name || participant.userName || participant.username || `사용자${participant.userId || participant.id || index}`,
                profileImage: participant.profileImage || participant.profile_image || participant.avatar || participant.image
            };
        }
        return {
            userId: `unknown${index}`,
            nickname: '알 수 없음',
            profileImage: null
        };
    });
    
    console.log('변환된 참가자:', transformedParticipants);
    return transformedParticipants;
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
                console.log('403 Forbidden - 사용자 권한 없음');
                console.log('전송된 userId:', userId);
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw server response:', data);
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const transformedData = data.map((room, index) => {
            console.log(`원본 채팅방 데이터 ${index + 1}:`, room);
            
            const transformed = {
                id: room.id || room.chatRoomId || room.roomId || `room_${index}`,
                
                // 제목 처리 - 다양한 필드명 대응
                title: room.title || room.accompanyTitle || room.roomName || room.name || '제목 없음',
                
                // 최근 메시지 처리 - 다양한 필드명 대응
                latestMessage: room.latestMessage || room.lastMessage || room.recentMessage || room.message || '메시지가 없습니다',
                
                // 참가자 정보 처리
                participants: transformParticipants(room),
                
                // 🔧 시간 처리 - UTC → 한국시간 변환 적용
                createdAt: formatChatTimestamp(
                    room.lastMessageTime || 
                    room.updatedAt || 
                    room.lastUpdated || 
                    room.createdAt || 
                    room.timestamp ||
                    new Date().toISOString()
                ),
                
                // 읽지 않은 메시지 수
                unreadCount: room.unreadCount || room.unread || room.newMessageCount || 0,
                
                // 추가 정보
                location: room.location || room.place || '위치 미정',
                maxParticipants: room.maxParticipants || room.maxRecruit || room.maxMembers || 0,
                
                // 원본 데이터도 보존 (디버깅용)
                _originalData: room
            };
            
            console.log(`변환된 채팅방 데이터 ${index + 1}:`, transformed);
            return transformed;
        });
        
        console.log('전체 변환된 데이터:', transformedData);
        return transformedData;
        
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
        console.log('메시지 조회 API 호출:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const messagesData = await response.json();
            console.log('메시지 데이터:', messagesData);
            return messagesData;
        } else {
            const errorText = await response.text();
            console.error('API 에러 응답:', errorText);
            throw new Error(`메시지 조회 실패: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('메시지 조회 오류:', error);
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
            console.log('메시지 전송 성공:', result);
            return result;
        } else {
            const errorText = await response.text();
            console.error('API 에러 응답:', errorText);
            throw new Error(`메시지 전송 실패: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('메시지 전송 오류:', error);
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

// 🔧 기존 메시지 불러오기 (UTC → 한국시간 변환 적용)
export const fetchMessages = async (roomId, currentUserId) => {
    try {
        const url = `${API_URL}/api/accompany/chatroom/${roomId}/messages`;
        console.log('메시지 조회 API 호출:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const messagesData = await response.json();
            console.log('메시지 데이터:', messagesData);
            
            // 백엔드 응답을 프론트엔드 형식으로 변환
            const transformedMessages = messagesData.map(msg => ({
                id: msg.id || msg.roomId + '_' + msg.sendTime,
                user: {
                    name: msg.senderNickname || `사용자${msg.senderId}`,
                    isSelf: String(msg.senderId) === String(currentUserId),
                },
                text: msg.content,
                time: formatMessageTime(msg.sendTime), // 🔧 UTC → 한국시간 변환 적용
                sendTime: msg.sendTime
            }));
            
            // 시간순 정렬 (UTC 시간을 기준으로 정렬)
            transformedMessages.sort((a, b) => {
                const dateA = dayjs.utc(a.sendTime).tz('Asia/Seoul');
                const dateB = dayjs.utc(b.sendTime).tz('Asia/Seoul');
                return dateA.isBefore(dateB) ? -1 : 1;
            });
            
            return transformedMessages;
        } else {
            const errorText = await response.text();
            console.error('API 에러 응답:', errorText);
            throw new Error(`메시지 조회 실패: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('메시지 조회 오류:', error);
        throw error;
    }
};

// 동행 게시물 정보 조회
export const getAccompanyPostInfo = async (accompanyId, currentUserId) => {
    try {
        const url = `${API_URL}/api/accompany/AccompanyPost?postId=${accompanyId}&userId=${currentUserId}`;
        console.log('동행 게시물 API 호출:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('응답 상태:', response.status, response.statusText);

        if (response.ok) {
            const backendData = await response.json();
            console.log('백엔드 원본 데이터:', backendData);
            
            const transformedData = transformAccompanyDetailForChat(backendData);
            
            console.log('변환된 데이터:', transformedData);
            return transformedData;
            
        } else {
            const errorText = await response.text();
            console.error('API 오류 응답:', errorText);
            throw new Error(`동행 정보 조회 실패: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('동행 정보 조회 오류:', error);
        throw error;
    }
};

// transformAccompanyDetail 채팅용
const transformAccompanyDetailForChat = (backendData) => {
    if (!backendData) return null;

    console.log('데이터 변환 시작:', backendData);

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

    console.log('변환 완료:', transformed);
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

// 디버깅용 로그 추가 함수
export const debugChatRoomData = (data) => {
    console.log('=== 채팅방 데이터 디버깅 ===');
    console.log('전체 데이터:', data);
    
    if (Array.isArray(data)) {
        data.forEach((room, index) => {
            console.log(`채팅방 ${index + 1}:`, {
                id: room.id,
                title: room.title,
                participantCount: room.participants?.length || 0,
                participants: room.participants,
                latestMessage: room.latestMessage,
                createdAt: room.createdAt,
                rawData: room._originalData
            });
        });
    }
    console.log('=== 디버깅 끝 ===');
};

// 메시지 읽음 처리 API 호출 함수
export const markMessagesAsRead = async (roomId, userId) => {
    try {
        const url = `${API_URL}/api/accompany/chatroom/${roomId}/read?userId=${userId}`;
        const response = await fetch(url, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to mark messages as read');
        }
        console.log(`Chatroom ${roomId} marked as read for user ${userId}`);
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
};