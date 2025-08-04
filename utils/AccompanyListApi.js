import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';

// 기본 API URL을 가져오는 함수 (환경 설정에 따라)
const getBaseURL = () => {
    if (__DEV__) { // 개발 환경
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080'; // 안드로이드 에뮬레이터는 '10.0.2.2'를 로컬호스트로 사용
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV || 'http://localhost:8080';
    } else { // 운영(배포) 환경
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD || 'YOUR_PRODUCTION_API_URL';
    }
};

const API_URL = getBaseURL();

// 백엔드 데이터를 프론트엔드 형식으로 변환하는 함수
export const transformAccompanyData = (accompanyData) => {
    if (!accompanyData) return [];

    console.log('🔍 원본 백엔드 데이터 전체:', accompanyData);
    console.log('🔍 배열 길이:', accompanyData.length);
    
    // 각 아이템의 id를 확인
    accompanyData.forEach((item, index) => {
        console.log(`🔍 아이템 ${index}: id=${item.id} (타입: ${typeof item.id}), title=${item.title}`);
    });
    
    return accompanyData.map((item, index) => {
        // id 변환 과정 상세 로그
        const originalId = item.id;
        const transformedId = item.id?.toString() || Math.random().toString();
        
        console.log(`🔄 변환 ${index}: 원본 id=${originalId} → 변환된 id=${transformedId}`);
        
        if (!originalId) {
            console.error(`❌ 경고! 아이템 ${index}의 id가 없습니다:`, item);
        }
        
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
        };
    });
};

// API 에러 처리 공통 함수
export const handleApiError = (error, apiName = 'API') => {
    console.error(`❌ ${apiName} 오류:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        Alert.alert(
            '네트워크 연결 오류',
            '서버에 연결할 수 없습니다.\n\n확인사항:\n1. 서버가 실행 중인지 확인\n2. IP 주소가 올바른지 확인\n3. 포트 번호가 맞는지 확인'
        );
    } else if (error.name === 'AbortError' || error.message.includes('시간이 초과')) {
        // 타임아웃 에러는 Alert를 띄우지 않고 콘솔 로그만
        console.warn(`⚠️ ${apiName} 타임아웃 발생 (재시도 로직으로 처리됨)`);
    } else {
        Alert.alert('오류', `${apiName} 요청 중 예상치 못한 오류가 발생했습니다: ${error.message}`);
    }
};

// 재시도 로직이 포함된 fetch 함수
const fetchWithRetry = async (url, options = {}, maxRetries = 2, timeoutMs = 15000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            console.log(`🔄 API 호출 시도 ${attempt}/${maxRetries}: ${url}`);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
            }

            console.log(`✅ API 호출 성공 (시도 ${attempt}/${maxRetries})`);
            return response;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (attempt === maxRetries) {
                // 마지막 시도에서도 실패한 경우
                if (error.name === 'AbortError') {
                    throw new Error(`${url.includes('my-applications') ? '신청한 동행 목록' : 
                                     url.includes('/my/') ? '내가 만든 동행' : 
                                     '전체 피드'} API 서버 응답 시간이 초과되었습니다.`);
                }
                throw error;
            }

            // 재시도 전 잠시 대기
            console.warn(`⚠️ 시도 ${attempt} 실패, ${1000 * attempt}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// 1. 전체 피드 데이터 가져오기
export const fetchAccompanyFeedApi = async (currentUserId) => {
    const url = `${API_URL}/api/accompany/home?id=${currentUserId}`;
    console.log('🌐 전체 피드 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();
        return transformAccompanyData(data.feed);
    } catch (error) {
        throw error;
    }
};

// 2. 내가 만든 동행 데이터 가져오기
export const fetchMyCreatedAccompanyApi = async (currentUserId) => {
    const url = `${API_URL}/api/accompany/my/${currentUserId}`;
    console.log('🌐 내가 만든 동행 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();
        return transformAccompanyData(data);
    } catch (error) {
        throw error;
    }
};

// 3. 신청한 동행 목록 데이터 가져오기
export const fetchMyAppliedAccompanyApi = async (currentUserId) => {
    const url = `${API_URL}/api/accompany/my-applications?id=${currentUserId}`;
    console.log('🌐 신청한 동행 목록 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {}, 3, 20000); // 신청한 동행은 3번 재시도, 20초 타임아웃
        const data = await response.json();
        return transformAccompanyData(data);
    } catch (error) {
        throw error;
    }
};

// 4. 좋아요 추가/취소 API
export const toggleLikeApi = async (accompanyId, userId) => {
    // accompanyId를 명시적으로 Number 타입으로 변환
    const numericAccompanyId = Number(accompanyId);
    
    if (isNaN(numericAccompanyId)) {
        console.error('❌ 유효하지 않은 accompanyId가 전달되었습니다:', accompanyId);
        throw new Error('Invalid accompanyId provided.');
    }

    try {
        const response = await axios.post(`${API_URL}/api/accompany/${numericAccompanyId}/like`, null, {
            params: {
                id: userId // 백엔드 @RequestParam id에 맞춤
            }
        });
        return response.data;
    } catch (error) {
        handleApiError(error, '좋아요 토글');
        throw error;
    }
};

// 5. 좋아요 상태 조회 API
export const getLikeStatusApi = async (accompanyId, userId) => {
    // accompanyId를 명시적으로 Number 타입으로 변환
    const numericAccompanyId = Number(accompanyId);
    
    if (isNaN(numericAccompanyId)) {
        console.error('❌ 유효하지 않은 accompanyId가 전달되었습니다:', accompanyId);
        return { isLiked: false, likeCount: 0 };
    }
    
    console.log(`🔍 파라미터 확인: accompanyId=${numericAccompanyId} (타입: ${typeof numericAccompanyId}), userId=${userId} (타입: ${typeof userId})`);
    try {
        const response = await axios.get(`${API_URL}/api/accompany/${numericAccompanyId}/like/status`, {
            params: {
                id: userId
            }
        });
        return response.data; // { isLiked, likeCount }
    } catch (error) {
        handleApiError(error, '좋아요 상태 조회');
        // 오류 발생 시 false 반환
        return { isLiked: false, likeCount: 0 };
    }
};

// 6. 여러 동행 포스트의 좋아요 상태를 한 번에 조회
export const getMultipleAccompanyLikesApi = async (accompanyIds, userId) => {
    console.log('🔍 getMultipleAccompanyLikesApi 호출됨');
    
    // undefined나 null 필터링하고 Number 타입으로 변환
    const validAccompanyIds = accompanyIds
        .filter(id => id !== undefined && id !== null && id !== '')
        .map(id => Number(id));
        
    console.log('🔍 유효한 accompanyIds:', validAccompanyIds);
    console.log('🔍 accompanyIds 타입들:', validAccompanyIds.map(id => `${id} (${typeof id})`));
    
    if (validAccompanyIds.length === 0) {
        console.warn('⚠️ 유효한 accompanyId가 없어서 빈 객체 반환');
        return {};
    }
    
    const likeStatusPromises = validAccompanyIds.map(accompanyId =>
        getLikeStatusApi(accompanyId, userId)
    );
    const results = await Promise.all(likeStatusPromises);
    const likedPostsMap = {};
    validAccompanyIds.forEach((accompanyId, index) => {
        likedPostsMap[accompanyId] = results[index].isLiked;
    });
    
    console.log('🔍 최종 likedPostsMap:', likedPostsMap);
    return likedPostsMap;
};