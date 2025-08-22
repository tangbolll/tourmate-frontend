import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';

// 🔥 최적화: axios 인스턴스 생성 및 인터셉터 설정
const api = axios.create({
    baseURL: (() => {
        if (__DEV__) {
            return Platform.OS === 'android' ? 'http://10.0.2.2:8080' : Constants.expoConfig?.extra?.API_BASE_URL_DEV || 'http://localhost:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD || 'YOUR_PRODUCTION_API_URL';
    })(),
    timeout: 20000, // 기본 타임아웃 20초
});

// 🔥 최적화: 요청 인터셉터 - 디버그 로깅
api.interceptors.request.use(
    config => {
        if (__DEV__) {
            console.log(`🌐 API 요청 시작: ${config.method.toUpperCase()} ${config.url}`);
            if (config.params) console.log('🔍 요청 파라미터:', config.params);
            if (config.data) console.log('🔍 요청 데이터:', config.data);
        }
        return config;
    },
    error => Promise.reject(error)
);

// 🔥 최적화: 응답 인터셉터 - 디버그 로깅 및 에러 핸들링
api.interceptors.response.use(
    response => {
        if (__DEV__) {
            console.log(`✅ API 응답 성공: ${response.config.method.toUpperCase()} ${response.config.url}`);
            console.log('🔍 응답 상태:', response.status);
            console.log('🔍 응답 데이터:', response.data);
        }
        return response;
    },
    error => {
        if (__DEV__) {
            console.error(`❌ API 요청 실패: ${error.config?.url}`, {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
        }
        
        // 특정 에러 코드에 대한 사용자 알림
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            Alert.alert('네트워크 오류', '서버 응답 시간이 초과되었습니다.');
        } else if (error.response?.status === 404) {
            console.warn('⚠️ 리소스를 찾을 수 없습니다 (404)');
        } else if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
            Alert.alert(
                '네트워크 연결 오류',
                '서버에 연결할 수 없습니다.\n\n확인사항:\n1. 서버가 실행 중인지 확인\n2. IP 주소가 올바른지 확인\n3. 포트 번호가 맞는지 확인'
            );
        } else {
            Alert.alert('오류', `요청 중 예상치 못한 오류가 발생했습니다: ${error.message}`);
        }

        return Promise.reject(error);
    }
);

// 백엔드 데이터를 프론트엔드 형식으로 변환하는 함수
// 🔥 최적화: 불필요한 디버그 로그 제거
export const transformAccompanyData = (accompanyData) => {
    if (!accompanyData || !Array.isArray(accompanyData)) return [];

    return accompanyData.map((item) => {
        const transformedId = item.id?.toString() || Math.random().toString();
        
        return {
            id: transformedId,
            title: item.title || '제목 없음',
            location: item.location || '위치 미정',
            description: item.intro || '',
            meetingPoint: item.meetPlace || '',
            participants: item.currentParticipants || 0,
            maxParticipants: item.maxRecruit || 0,
            imageUrl: item.images?.length > 0 ? item.images[0] : null,
            tags: [
                item.gender === 'ALL' ? '성별무관' : item.gender,
                ...(item.category || []),
                ...(item.ageGroup || []),
                ...(item.tag || []),
            ].filter(Boolean),
            date: item.tripStartDate && item.tripEndDate ?
                `${dayjs(item.tripStartDate).locale('ko').format('MM.DD')} ~ ${dayjs(item.tripEndDate).locale('ko').format('MM.DD')}` :
                '날짜 미정',
            hostId: item.userId || null,
            status: item.status || '상태 미정',
            likeCount: item.likeCount || 0,
            userApplicationStatus: item.userApplicationStatus || null,
        };
    });
};

// 1. 전체 피드 데이터 가져오기
export const fetchAccompanyFeedApi = async (currentUserId) => {
    try {
        const response = await api.get('/api/accompany/home', {
            params: { id: currentUserId },
        });
        return transformAccompanyData(response.data.feed);
    } catch (error) {
        throw error;
    }
};

// 2. 내가 만든 동행 데이터 가져오기
export const fetchMyCreatedAccompanyApi = async (currentUserId) => {
    try {
        const response = await api.get(`/api/accompany/my/${currentUserId}`);
        return transformAccompanyData(response.data);
    } catch (error) {
        throw error;
    }
};

// 3. 신청한 동행 목록 데이터 가져오기
export const fetchMyAppliedAccompanyApi = async (currentUserId) => {
    try {
        // 🔥 최적화: 타임아웃 재정의
        const response = await api.get('/api/accompany/my-applications', {
            params: { id: currentUserId },
            timeout: 20000,
        });
        return transformAccompanyData(response.data);
    } catch (error) {
        throw error;
    }
};

// 4. 좋아요 추가/취소 API
// 🔥 최적화: 간결한 로직으로 변경
export const toggleLikeApi = async (accompanyId, userId) => {
    const numericAccompanyId = Number(accompanyId);
    if (isNaN(numericAccompanyId)) {
        throw new Error('Invalid accompanyId provided.');
    }

    try {
        const response = await api.post(`/api/accompany/${numericAccompanyId}/like`, null, {
            params: { id: userId },
        });
        
        return {
            isLiked: Boolean(response.data.liked),
            likeCount: Number(response.data.likeCount) || 0,
        };
    } catch (error) {
        throw error;
    }
};

// 5. 좋아요 상태 조회 API
// 🔥 최적화: 간결한 로직으로 변경
export const getLikeStatusApi = async (accompanyId, userId) => {
    const numericAccompanyId = Number(accompanyId);
    if (isNaN(numericAccompanyId)) {
        console.error('❌ 유효하지 않은 accompanyId가 전달되었습니다:', accompanyId);
        return { isLiked: false, likeCount: 0 };
    }

    try {
        const response = await api.get(`/api/accompany/${numericAccompanyId}/like/status`, {
            params: { id: userId },
        });
        
        return {
            isLiked: response.data.liked,
            likeCount: response.data.likeCount,
        };
    } catch (error) {
        // 404 에러인 경우 예외적으로 처리
        if (error.response?.status === 404) {
            return { isLiked: false, likeCount: 0 };
        }
        throw error;
    }
};

// 6. 여러 동행 포스트의 좋아요 상태를 한 번에 조회
// 🔥 최적화: Promise.all을 명시적으로 사용하여 병렬 처리
export const getMultipleAccompanyLikesApi = async (accompanyIds, userId) => {
    const validAccompanyIds = accompanyIds
        .filter(id => id !== undefined && id !== null && id !== '')
        .map(id => Number(id));
        
    if (validAccompanyIds.length === 0) {
        return {};
    }
    
    try {
        const likeStatusPromises = validAccompanyIds.map(async (accompanyId) => {
            const result = await getLikeStatusApi(accompanyId, userId);
            return { accompanyId, ...result };
        });
        
        const results = await Promise.all(likeStatusPromises);
        
        const likedPostsMap = {};
        results.forEach(({ accompanyId, isLiked }) => {
            likedPostsMap[accompanyId] = isLiked;
        });
        
        return likedPostsMap;
    } catch (error) {
        // 모든 에러는 인터셉터에서 처리되므로, 여기서는 단순히 에러를 던지거나 빈 객체 반환
        return {}; 
    }
};