import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 최적화: axios 인스턴스 생성 및 인터셉터 설정
const api = axios.create({
    baseURL: (() => {
        let baseUrl;
        if (__DEV__) {
            baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : Constants.expoConfig?.extra?.API_BASE_URL_DEV || 'http://localhost:8080';
        }
        else {
            baseUrl = Constants.expoConfig?.extra?.API_BASE_URL_PROD || 'YOUR_PRODUCTION_API_URL';
        }
        console.log('Axios baseURL:', baseUrl);
        return baseUrl;
    })(),
    timeout: 20000, // 기본 타임아웃 20초
});

// 🔥 최적화: 요청 인터셉터 - 디버그 로깅 및 인증 토큰 추가
api.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (__DEV__) {
            console.log(`🌐 API 요청 시작: ${config.method.toUpperCase()} ${config.url}`);
            if (config.params) console.log('🔍 요청 파라미터:', config.params);
            if (config.data) console.log('🔍 요청 데이터:', config.data);
            console.log('🔍 요청 헤더:', config.headers);
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
        // 🔥 'images' 배열을 사용하여 'mainImageUrl'을 설정합니다.
        const mainImageUrl = item.mainImageUrl || (item.images && item.images.length > 0 ? item.images[0] : null);
        console.log('Accompany Image URL:', mainImageUrl);

        return {
            id: transformedId,
            title: item.title || '제목 없음',
            location: item.location || '위치 미정',
            description: item.intro || '',
            meetingPoint: item.meetPlace || '',
            currentParticipants: item.currentParticipants || item.member?.length || 0,
            maxRecruit: item.maxRecruit || 0,
            //mainImageUrl: item.images && item.images.length > 0 ? item.images[0] : null,
            mainImageUrl: mainImageUrl, // ✨ 수정된 변수 사용
            tags: [
                item.gender === 'ALL' ? '성별무관' : item.gender,
                ...(item.category || []),
                ...(item.ageGroup || []),
                ...(item.tag || []),
            ].filter(Boolean),
            
            tripStartDate: item.tripStartDate, 
            tripEndDate: item.tripEndDate,
            hostId: item.userId || null,
            status: item.accompanyStatus || '상태 미정',
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
        return response.data; // Changed this line
    } catch (error) {
        throw error;
    }
};

// 2. 내가 만든 동행 데이터 가져오기
export const fetchMyCreatedAccompanyApi = async (currentUserId) => {
    try {
        const response = await api.get(`/api/accompany/my/${currentUserId}`);
        // 🔥 API 응답 원본 데이터를 직접 확인
        console.log('API 응답 원본 데이터:', response.data); 
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
// 🚀 최적화된 일괄 좋아요 상태 조회 API
export const getMultipleAccompanyLikesApi = async (accompanyIds, userId) => {
    const validAccompanyIds = accompanyIds
        .filter(id => id !== undefined && id !== null && id !== '')
        .map(id => Number(id))
        .filter(id => !isNaN(id));
        
    if (validAccompanyIds.length === 0) {
        return {};
    }
    
    try {
        // 🔥 핵심 개선: 하나의 POST 요청으로 모든 좋아요 상태 조회
        const response = await api.post('/api/accompany/likes/batch', {
            accompanyIds: validAccompanyIds,
            userId: userId
        }, {
            timeout: 60000, // 타임아웃 단축
            headers: {
                'Content-Type': 'application/json'
            }})
        
        // 백엔드에서 { accompanyId: boolean } 형태로 반환된다고 가정
        return response.data || {};
        
    } catch (error) {
        console.error('❌ 일괄 좋아요 상태 조회 실패, 개별 조회로 폴백:', error);
        
        // 🔄 폴백: 배치 API 실패 시 개별 조회 (최대 10개까지만)
        return await getMultipleAccompanyLikesFallback(
            validAccompanyIds.slice(0, 10), 
            userId
        );
    }
};

// 🔄 폴백 함수: 배치 크기 제한 + 청크 처리
const getMultipleAccompanyLikesFallback = async (accompanyIds, userId) => {
    const CHUNK_SIZE = 5; // 한 번에 5개씩 처리
    const chunks = [];
    
    for (let i = 0; i < accompanyIds.length; i += CHUNK_SIZE) {
        chunks.push(accompanyIds.slice(i, i + CHUNK_SIZE));
    }
    
    const likedPostsMap = {};
    
    // 청크별로 순차 처리 (서버 부하 방지)
    for (const chunk of chunks) {
        try {
            const promises = chunk.map(async (accompanyId) => {
                try {
                    const result = await getLikeStatusApi(accompanyId, userId);
                    return { accompanyId, ...result };
                } catch (error) {
                    console.warn(`⚠️ 개별 좋아요 조회 실패 (ID: ${accompanyId}):`, error);
                    return { accompanyId, isLiked: false, likeCount: 0 };
                }
            });
            
            const results = await Promise.all(promises);
            
            results.forEach(({ accompanyId, isLiked }) => {
                likedPostsMap[accompanyId] = isLiked;
            });
            
            // 청크 간 딜레이 (서버 부하 방지)
            if (chunks.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
        } catch (error) {
            console.error('❌ 청크 처리 실패:', error);
        }
    }
    
    return likedPostsMap;
};

// 🚀 찜한 포스트만 직접 가져오는 최적화된 API (정렬 옵션 추가)
export const fetchLikedAccompanyPostsApi = async (userId, sortKey = 'saved') => {
    try {
        const response = await api.get('/api/accompany/liked', {
            params: { 
                userId: userId,
                sortKey: sortKey 
            },
            timeout: 15000,
        });
        
        return transformAccompanyData(response.data);
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('ℹ️ 찜한 포스트 API가 아직 구현되지 않음, 기존 방식 사용');
            return null; // 기존 방식으로 폴백
        }
        throw error;
    }
};

// 🔥 캐싱이 적용된 피드 조회 (메모리 캐시)
const feedCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export const fetchAccompanyFeedWithCacheApi = async (currentUserId) => {
    const cacheKey = `feed_${currentUserId}`;
    const cached = feedCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 캐시에서 피드 데이터 반환');
        return cached.data;
    }
    
    try {
        const response = await api.get('/api/accompany/home', {
            params: { id: currentUserId },
            timeout: 15000,
        });
        
        const transformedData = transformAccompanyData(response.data.feed);
        
        // 캐시 저장
        feedCache.set(cacheKey, {
            data: transformedData,
            timestamp: Date.now()
        });
        
        return transformedData;
    } catch (error) {
        // 캐시된 데이터가 있으면 반환 (오프라인 지원)
        if (cached) {
            console.log('⚠️ API 실패, 캐시된 데이터 반환');
            return cached.data;
        }
        throw error;
    }
};

// 🧹 캐시 클리어 함수
export const clearFeedCache = () => {
    feedCache.clear();
    console.log('🧹 피드 캐시 클리어됨');
};

export const handleApiError = (error, context = '작업') => {
    console.error(`❌ API 오류 발생 (${context}):`, error);

    let errorMessage = '오류가 발생했습니다. 다시 시도해주세요.';

    if (error.response) {
        // 서버가 상태 코드로 응답한 경우
        const { status, data } = error.response;
        errorMessage = `서버 오류 (코드: ${status}): ${data.message || '알 수 없는 오류'}`;
        if (status === 404) {
            errorMessage = `${context}을(를) 찾을 수 없습니다.`;
        }
    } else if (error.request) {
        // 요청은 이루어졌으나 응답을 받지 못한 경우
        errorMessage = '서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.';
    } else {
        // 요청 설정 중 오류가 발생한 경우
        errorMessage = `요청 중 오류 발생: ${error.message}`;
    }

    Alert.alert(`${context} 실패`, errorMessage);
};


//  새로운 함수: 찜한 포스트를 원본 데이터로 반환 (AccompanyList와 동일)
export const fetchLikedAccompanyPostsRawApi = async (userId, sortKey = 'saved') => {
    try {
        const response = await api.get('/api/accompany/liked', {
            params: { 
                userId: userId,
                sortKey: sortKey 
            },
            timeout: 15000,
        });
        
        // 🔥 핵심: 원본 데이터 그대로 반환 (transformAccompanyData 적용 안 함)
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('ℹ️ 찜한 포스트 API가 아직 구현되지 않음, 기존 방식 사용');
            return null; // 기존 방식으로 폴백
        }
        throw error;
    }
};

// 🔥 새로운 함수: 캐시된 피드를 원본 데이터로 반환 (AccompanyList와 동일)
export const fetchAccompanyFeedRawWithCacheApi = async (currentUserId) => {
    const cacheKey = `feed_raw_${currentUserId}`;
    const cached = feedCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 캐시에서 원본 피드 데이터 반환');
        return cached.data;
    }
    
    try {
        const response = await api.get('/api/accompany/home', {
            params: { id: currentUserId },
            timeout: 15000,
        });
        
        // 🔥 핵심: 원본 데이터 그대로 반환 (transformAccompanyData 적용 안 함)
        const rawData = response.data.feed || response.data;
        
        // 캐시 저장
        feedCache.set(cacheKey, {
            data: rawData,
            timestamp: Date.now()
        });
        
        return rawData;
    } catch (error) {
        // 캐시된 데이터가 있으면 반환 (오프라인 지원)
        if (cached) {
            console.log('⚠️ API 실패, 캐시된 원본 데이터 반환');
            return cached.data;
        }
        throw error;
    }
};
