import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';

// 기본 API URL을 가져오는 함수
const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV || 'http://localhost:8080';
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD || 'YOUR_PRODUCTION_API_URL';
    }
};

const API_URL = getBaseURL();

// 신고 API 함수
export const submitReportApi = async (postcardId, reportData) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/accompany/postcards/${postcardId}/report`,
            {
                reason: reportData.reason,
                customReason: reportData.customReason,
                timestamp: reportData.timestamp
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 필요한 경우 인증 토큰 추가
                    // 'Authorization': `Bearer ${token}`,
                },
                timeout: 10000, // 10초 타임아웃
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('신고 API 오류:', error);
        
        let errorMessage = '신고 처리 중 오류가 발생했습니다.';
        
        if (error.response) {
            // 서버 응답이 있는 경우
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 400:
                    errorMessage = '잘못된 요청입니다. 입력 정보를 확인해주세요.';
                    break;
                case 401:
                    errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
                    break;
                case 403:
                    errorMessage = '신고 권한이 없습니다.';
                    break;
                case 404:
                    errorMessage = '해당 게시물을 찾을 수 없습니다.';
                    break;
                case 409:
                    errorMessage = '이미 신고한 게시물입니다.';
                    break;
                case 500:
                    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                    break;
                default:
                    errorMessage = data?.message || errorMessage;
            }
        } else if (error.request) {
            // 네트워크 오류
            errorMessage = '네트워크 연결을 확인해주세요.';
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

// 엽서 피드 가져오기 API
export const fetchPostcardFeedApi = async (page = 0, size = 20) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/accompany/postcards/feed`,
            {
                params: {
                    page,
                    size
                },
                headers: {
                    'Content-Type': 'application/json',
                    // 필요한 경우 인증 토큰 추가
                    // 'Authorization': `Bearer ${token}`,
                },
                timeout: 10000, // 10초 타임아웃
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('엽서 피드 API 오류:', error);
        
        let errorMessage = '엽서 목록을 불러오는 중 오류가 발생했습니다.';
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 400:
                    errorMessage = '잘못된 요청입니다. 페이지 정보를 확인해주세요.';
                    break;
                case 401:
                    errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
                    break;
                case 403:
                    errorMessage = '접근 권한이 없습니다.';
                    break;
                case 500:
                    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                    break;
                default:
                    errorMessage = data?.message || errorMessage;
            }
        } else if (error.request) {
            errorMessage = '네트워크 연결을 확인해주세요.';
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

// 좋아요 API (추후 구현)
export const likePostcardApi = async (postcardId) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/postcards/${postcardId}/like`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`,
                },
                timeout: 5000,
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('좋아요 API 오류:', error);
        return {
            success: false,
            error: '좋아요 처리 중 오류가 발생했습니다.'
        };
    }
};

// 북마크 API (추후 구현)
export const bookmarkPostcardApi = async (postcardId) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/postcards/${postcardId}/scrap`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`,
                },
                timeout: 5000,
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('북마크 API 오류:', error);
        return {
            success: false,
            error: '북마크 처리 중 오류가 발생했습니다.'
        };
    }
};