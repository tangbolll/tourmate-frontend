import { Alert } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './apiConfig';

// 사용자가 좋아요한 엽서 목록 가져오기 API
export const fetchUserLikedPostcardsApi = async (userId) => {
    if (!userId) {
        return {
            success: false,
            error: '사용자 ID가 필요합니다.'
        };
    }

    try {
        const response = await axios.get(
            `${API_URL}/api/postcards/users/${userId}/liked`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // 필요한 경우 인증 토큰 추가
                    // 'Authorization': `Bearer ${token}`,
                },
                timeout: 10000,
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('사용자 좋아요 목록 API 오류:', error);
        
        let errorMessage = '좋아요 목록을 불러오는 중 오류가 발생했습니다.';
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 400:
                    errorMessage = '잘못된 요청입니다. 사용자 ID를 확인해주세요.';
                    break;
                case 401:
                    errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
                    break;
                case 403:
                    errorMessage = '접근 권한이 없습니다.';
                    break;
                case 404:
                    errorMessage = '사용자를 찾을 수 없습니다.';
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

// 사용자가 스크랩한 엽서 목록 가져오기 API
export const fetchUserScrappedPostcardsApi = async (userId, sortBy = 'closestTrip') => { // 기본값 변경
    if (!userId) {
        return {
            success: false,
            error: '사용자 ID가 필요합니다.'
        };
    }

    try {
        const token = await AsyncStorage.getItem('authToken');
        
        const response = await axios.get(
            `${API_URL}/api/postcards/users/${userId}/scrapped`, // BASE_URL → API_URL 변경
            {
                params: {
                    sortBy
                },
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                timeout: 10000,
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('스크랩한 엽서 목록 조회 실패:', error);
        
        let errorMessage = '스크랩한 엽서 목록을 불러오는데 실패했습니다.';
        
        if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 401:
                    errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
                    break;
                case 403:
                    errorMessage = '접근 권한이 없습니다.';
                    break;
                case 404:
                    errorMessage = '사용자를 찾을 수 없습니다.';
                    break;
                case 500:
                    errorMessage = '서버 오류가 발생했습니다.';
                    break;
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

// 엽서 피드와 사용자 상호작용 정보를 함께 가져오는 통합 함수
export const fetchPostcardFeedWithUserInteractionsApi = async (page = 0, size = 20, userId = null) => {
    try {
        // 엽서 피드 가져오기
        const feedResult = await fetchPostcardFeedApi(page, size);
        
        if (!feedResult.success) {
            return feedResult;
        }

        let likedPostcards = [];
        let scrappedPostcards = [];

        // 사용자가 로그인한 경우에만 좋아요/스크랩 목록 가져오기
        if (userId) {
            const [likedResult, scrappedResult] = await Promise.all([
                fetchUserLikedPostcardsApi(userId),
                fetchUserScrappedPostcardsApi(userId)
            ]);

            // 에러가 있어도 피드는 보여주기 위해 계속 진행
            if (likedResult.success) {
                likedPostcards = likedResult.data || [];
            } else {
                console.warn('좋아요 목록 로드 실패:', likedResult.error);
            }

            if (scrappedResult.success) {
                scrappedPostcards = scrappedResult.data || [];
            } else {
                console.warn('스크랩 목록 로드 실패:', scrappedResult.error);
            }
        }

        // 좋아요/스크랩 정보를 Map으로 변환 (빠른 조회를 위해)
        const likedPostcardIds = new Set(likedPostcards.map(item => item.postcardId));
        const scrappedPostcardIds = new Set(scrappedPostcards.map(item => item.postcardId));

        // 엽서 데이터에 사용자 상호작용 정보 추가
        const enhancedContent = feedResult.data.content.map(postcard => ({
            ...postcard,
            isLiked: likedPostcardIds.has(postcard.postcardId),
            isScraped: scrappedPostcardIds.has(postcard.postcardId)
        }));

        return {
            success: true,
            data: {
                ...feedResult.data,
                content: enhancedContent
            }
        };

    } catch (error) {
        console.error('통합 피드 API 오류:', error);
        return {
            success: false,
            error: '피드를 불러오는 중 오류가 발생했습니다.'
        };
    }
};

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

// 좋아요 API - userId를 매개변수로 받음
export const likePostcardApi = async (postcardId, userId) => {
    if (!userId) {
        return {
            success: false,
            error: '사용자 정보가 필요합니다.'
        };
    }

    try {
        const response = await axios.post(
            `${API_URL}/api/postcards/${postcardId}/like`,
            {},
            {
                params: {
                    userId
                },
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
        
        let errorMessage = '좋아요 처리 중 오류가 발생했습니다.';
        
        if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 400:
                    errorMessage = '잘못된 요청입니다.';
                    break;
                case 401:
                    errorMessage = '인증이 필요합니다.';
                    break;
                case 403:
                    errorMessage = '이미 좋아요한 게시물입니다.';
                    break;
                case 404:
                    errorMessage = '해당 게시물을 찾을 수 없습니다.';
                    break;
                case 500:
                    errorMessage = '서버 오류가 발생했습니다.';
                    break;
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

// 좋아요 취소 API - userId를 매개변수로 받음
export const unlikePostcardApi = async (postcardId, userId) => {
    if (!userId) {
        return {
            success: false,
            error: '사용자 정보가 필요합니다.'
        };
    }

    try {
        const response = await axios.delete(
            `${API_URL}/api/postcards/${postcardId}/like`,
            {
                params: {
                    userId
                },
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
        console.error('좋아요 취소 API 오류:', error);
        
        let errorMessage = '좋아요 취소 처리 중 오류가 발생했습니다.';
        
        if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 400:
                    errorMessage = '잘못된 요청입니다.';
                    break;
                case 401:
                    errorMessage = '인증이 필요합니다.';
                    break;
                case 403:
                    errorMessage = '좋아요하지 않은 게시물입니다.';
                    break;
                case 404:
                    errorMessage = '해당 게시물을 찾을 수 없습니다.';
                    break;
                case 500:
                    errorMessage = '서버 오류가 발생했습니다.';
                    break;
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

// 스크랩 API - userId를 매개변수로 받음
export const scrapPostcardApi = async (postcardId, userId) => {
    if (!userId) {
        return {
            success: false,
            error: '사용자 정보가 필요합니다.'
        };
    }

    try {
        const response = await axios.post(
            `${API_URL}/api/postcards/${postcardId}/scrap`,
            {},
            {
                params: {
                    userId
                },
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
        console.error('스크랩 API 오류:', error);
        
        let errorMessage = '스크랩 처리 중 오류가 발생했습니다.';
        
        if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 400:
                    errorMessage = '잘못된 요청입니다.';
                    break;
                case 401:
                    errorMessage = '인증이 필요합니다.';
                    break;
                case 403:
                    errorMessage = '이미 스크랩한 게시물입니다.';
                    break;
                case 404:
                    errorMessage = '해당 게시물을 찾을 수 없습니다.';
                    break;
                case 500:
                    errorMessage = '서버 오류가 발생했습니다.';
                    break;
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

// 스크랩 취소 API - userId를 매개변수로 받음
export const unscrapPostcardApi = async (postcardId, userId) => {
    if (!userId) {
        return {
            success: false,
            error: '사용자 정보가 필요합니다.'
        };
    }

    try {
        const response = await axios.delete(
            `${API_URL}/api/postcards/${postcardId}/scrap`,
            {
                params: {
                    userId
                },
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
        console.error('스크랩 취소 API 오류:', error);
        
        let errorMessage = '스크랩 취소 처리 중 오류가 발생했습니다.';
        
        if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 400:
                    errorMessage = '잘못된 요청입니다.';
                    break;
                case 401:
                    errorMessage = '인증이 필요합니다.';
                    break;
                case 403:
                    errorMessage = '스크랩하지 않은 게시물입니다.';
                    break;
                case 404:
                    errorMessage = '해당 게시물을 찾을 수 없습니다.';
                    break;
                case 500:
                    errorMessage = '서버 오류가 발생했습니다.';
                    break;
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

// 통합 좋아요 토글 함수 - userId를 매개변수로 받음
export const toggleLikePostcard = async (postcardId, isCurrentlyLiked, userId) => {
    if (isCurrentlyLiked) {
        return await unlikePostcardApi(postcardId, userId);
    } else {
        return await likePostcardApi(postcardId, userId);
    }
};

// 통합 스크랩 토글 함수 - userId를 매개변수로 받음
export const toggleScrapPostcard = async (postcardId, isCurrentlyScraped, userId) => {
    if (isCurrentlyScraped) {
        return await unscrapPostcardApi(postcardId, userId);
    } else {
        return await scrapPostcardApi(postcardId, userId);
    }
};

// 기존 함수들 (하위 호환성을 위해 유지)
export const bookmarkPostcardApi = scrapPostcardApi;

// 엽서 상세 정보 가져오기 API (새로 추가)
export const fetchPostcardDetailApi = async (postcardId) => {
    if (!postcardId) {
        return {
            success: false,
            error: '엽서 ID가 필요합니다.'
        };
    }

    try {
        const response = await axios.get(
            `${API_URL}/api/accompany/postcards/${postcardId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('엽서 상세 정보 API 오류:', error);
        
        let errorMessage = '엽서 정보를 불러오는 중 오류가 발생했습니다.';
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 400:
                    errorMessage = '잘못된 요청입니다. 엽서 ID를 확인해주세요.';
                    break;
                case 401:
                    errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
                    break;
                case 403:
                    errorMessage = '접근 권한이 없습니다.';
                    break;
                case 404:
                    errorMessage = '엽서를 찾을 수 없습니다.';
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