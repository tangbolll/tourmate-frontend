import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

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

    return accompanyData.map(item => ({
        id: item.id?.toString() || Math.random().toString(),
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
    }));
};

// API 에러 처리 공통 함수
export const handleApiError = (error, apiName = 'API') => {
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        Alert.alert(
            '네트워크 연결 오류',
            '서버에 연결할 수 없습니다.\n\n확인사항:\n1. 서버가 실행 중인지 확인\n2. IP 주소가 올바른지 확인\n3. 포트 번호가 맞는지 확인'
        );
    } else if (error.name === 'AbortError') {
        Alert.alert('타임아웃', `${apiName} 서버 응답 시간이 초과되었습니다.`);
    } else {
        Alert.alert('오류', `${apiName} 요청 중 예상치 못한 오류가 발생했습니다: ${error.message}`);
    }
};

// 1. 전체 피드 데이터 가져오기
export const fetchAccompanyFeedApi = async (currentUserId) => {
    const url = `${API_URL}/api/accompany/home?id=${currentUserId}`;
    console.log('🌐 전체 피드 API 호출:', url);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText || errorText}`);
        }
        const data = await response.json();
        return transformAccompanyData(data.feed);
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('전체 피드 API 서버 응답 시간이 초과되었습니다.');
        }
        throw error;
    }
};

// 2. 내가 만든 동행 데이터 가져오기
export const fetchMyCreatedAccompanyApi = async (currentUserId) => {
    const url = `${API_URL}/api/accompany/my/${currentUserId}`;
    console.log('🌐 내가 만든 동행 API 호출:', url);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch my created posts: ${response.status} ${response.statusText || errorText}`);
        }
        const data = await response.json();
        return transformAccompanyData(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('내가 만든 동행 API 서버 응답 시간이 초과되었습니다.');
        }
        throw error;
    }
};

// 3. 신청한 동행 목록 데이터 가져오기
export const fetchMyAppliedAccompanyApi = async (currentUserId) => {
    const url = `${API_URL}/api/accompany/my-applications?id=${currentUserId}`;
    console.log('🌐 신청한 동행 목록 API 호출:', url);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch applied posts: ${response.status} ${response.statusText || errorText}`);
        }
        const data = await response.json();
        return transformAccompanyData(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('신청한 동행 목록 API 서버 응답 시간이 초과되었습니다.');
        }
        throw error;
    }
};