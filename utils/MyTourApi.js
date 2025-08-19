import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API 기본 URL을 가져오는 헬퍼 함수
export const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};

// 나의 여행 목록을 가져오는 API 함수
export const fetchMyTours = async (userId) => {
    const url = `${getBaseURL()}/api/myTour/list?userId=${userId}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
        
        const data = await response.json();
        console.log("✅ 서버 응답:", data);
        
        // 배열 보장
        return Array.isArray(data) ? data : [data];
        
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
};

// 즐겨찾기 토글 API 함수
export const toggleTourFavorite = async (tourId, userId) => {
    const url = `${getBaseURL()}/api/myTour/${tourId}/favorite?userId=${userId}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('즐겨찾기 업데이트 실패');
        }
        
        console.log('✅ 즐겨찾기 토글 완료:', tourId);
        return true;
        
    } catch (error) {
        console.error('즐겨찾기 토글 에러:', error);
        throw error;
    }
};