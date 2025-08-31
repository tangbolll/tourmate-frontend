import { ActivityIndicator , Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";



// API 기본 URL을 가져오는 헬퍼 함수
export const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080';
        }
        if (Platform.OS === 'web') {
            return 'http://localhost:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};

const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// ==================== 여행(MyTour) 관련 API ====================

// 나의 여행 목록 조회
export const fetchMyTours = async (userId) => {
    const url = `${getBaseURL()}/api/myTour/list?userId=${userId}`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
};

// 즐겨찾기 토글
export const toggleTourFavorite = async (tourId, userId) => {
    const url = `${getBaseURL()}/api/myTour/${tourId}/favorite?userId=${userId}`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, { method: 'POST', headers });

        // 1. 서버가 성공 신호(200번대)를 보내면, 본문의 boolean 값을 파싱하여 반환합니다.
        if (response.ok) {
            const data = await response.json();
            return data.isFavorite; // 객체에서 boolean 값 추출하여 반환
        }
        
        // 2. 만약 성공이 아니라면 (400, 500번대 에러), 
        //    서버가 보낸 에러 메시지를 읽어서 원인을 명확하게 알려줍니다.
        const errorText = await response.text();
        throw new Error(errorText || `서버 에러: ${response.status}`);

    } catch (error) {
        console.error('즐겨찾기 토글 API 상세 에러:', error.message || error);
        throw error;    
    }
};


// 여러 여행 삭제 (배치)
export const deleteMyTours = async (tourIds) => {
    try {
        const headers = await getAuthHeaders();
        const results = await Promise.allSettled(
            tourIds.map(tourId =>
                fetch(`${getBaseURL()}/api/myTour/${tourId}`, { method: 'DELETE', headers })
                    .then(r => r.ok ? `여행 삭제 성공 (ID: ${tourId})`
                        : r.text().then(tx => { throw new Error(tx); }))
            )
        );
        if (!results.every(r => r.status === 'fulfilled')) throw new Error('일부 여행 삭제에 실패했습니다.');
        return true;
    } catch (error) {
        console.error('여행 삭제 에러:', error);
        throw error;
    }
};

// 새로운 여행 생성
export const createTour = async (tourData) => {
    const url = `${getBaseURL()}/api/myTour/create`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(tourData),
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('여행 생성 에러:', error);
        throw error;
    }
};

// 여행 일정 수정
export const updateTour = async (tourId, tourData) => {
    const url = `${getBaseURL()}/api/myTour/${tourId}`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(tourData),
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('여행 수정 에러:', error);
        throw error;
    }
};

// 여행 상세 정보 조회
export const getTourDetails = async (tourId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${getBaseURL()}/api/myTour/${tourId}`, { headers });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('여행 상세 정보 조회 에러:', error);
        throw error;
    }
};

// 닉네임으로 유저를 검색하는 API 함수
export const searchUsers = async (nickname) => {
    if (!nickname || nickname.trim().length < 2) {
        return []; // 검색어가 2글자 미만이면 요청하지 않음
    }
    try {
        console.log("검색 API 호출:", `${getBaseURL()}/api/user/search?nickname=${nickname}`);
        const response = await axios.get(`${getBaseURL()}/api/user/search?nickname=${encodeURIComponent(nickname)}`);
        return response.data;
    } catch (error) {
        console.error('Error searching users:', error);
        return []; // 에러 발생 시 빈 배열 반환
    }
};

// ==================== 여행 스케줄(TravelSchedule) 관련 API ====================

// 스케줄 전체 조회 by 여행
export const getAllSchedulesByTravel = async (travelId) => {
    const url = `${getBaseURL()}/api/travelSchedule/travel/${travelId}`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('전체 여행 스케줄 조회 에러:', error);
        throw error;
    }
};

// 스케줄 생성
export const createTravelSchedule = async (scheduleData) => {
    const url = `${getBaseURL()}/api/travelSchedule/create`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(scheduleData),
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('여행 스케줄 생성 에러:', error);
        throw error;
    }
};

// 스케줄 상세조회
export const getTravelScheduleDetails = async (scheduleId) => {
    const url = `${getBaseURL()}/api/travelSchedule/${scheduleId}`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('여행 스케줄 상세 조회 에러:', error);
        throw error;
    }
};

// 스케줄 삭제(단일)
export const deleteTravelSchedule = async (scheduleId) => {
    const url = `${getBaseURL()}/api/travelSchedule/${scheduleId}`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, { method: 'DELETE', headers });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[deleteTravelSchedule] API Error: Status ${response.status}, ${response.statusText}, Body: ${errorText}`);
            throw new Error(`일정 삭제 실패: ${response.status} ${response.statusText} - ${errorText}`);
        }
        console.log(`[deleteTravelSchedule] API Success: Status ${response.status}, ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('여행 스케줄 삭제 에러:', error);
        throw error;
    }
};

// 스케줄 수정
export const updateTravelSchedule = async (scheduleId, scheduleData) => {
    const url = `${getBaseURL()}/api/travelSchedule/${scheduleId}`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(scheduleData),
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('여행 스케줄 수정 에러:', error);
        throw error;
    }
};

// 날짜별 스케줄 조회
export const getSchedulesByDate = async (travelId, date) => {
    const url = `${getBaseURL()}/api/travelSchedule/scheduleByDate?travelId=${travelId}&date=${date}`;
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error('날짜별 여행 스케줄 조회 에러:', error);
        throw error;
    }
};

// 여러 스케줄 삭제 (배치)
export const deleteTravelSchedules = async (scheduleIds) => {
    try {
        const headers = await getAuthHeaders();
        const results = await Promise.allSettled(
            scheduleIds.map(scheduleId =>
                fetch(`${getBaseURL()}/api/travelSchedule/${scheduleId}`, { method: 'DELETE', headers })
                    .then(r => r.ok ? `여행 스케줄 삭제 성공 (ID: ${scheduleId})`
                        : r.text().then(tx => { throw new Error(tx); }))
            )
        );
        if (!results.every(r => r.status === 'fulfilled')) throw new Error('일부 여행 스케줄 삭제에 실패했습니다.');
        return true;
    } catch (error) {
        console.error('여행 스케줄 배치 삭제 에러:', error);
        throw error;
    }
};
