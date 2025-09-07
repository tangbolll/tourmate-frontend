import { Alert } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { API_URL } from './apiConfig';

// 백엔드 여행 데이터를 프론트엔드 형식으로 변환하는 함수
export const transformTourData = (tourData) => {
    if (!tourData || tourData.length === 0) return [];

    console.log('🔍 원본 백엔드 여행 데이터:', tourData);
    
    return tourData.map((item, index) => {
        const transformedId = item.id?.toString() || Math.random().toString();
        
        console.log(`🔄 여행 변환 ${index}: id=${item.id}, title=${item.title}`);
        
        // 날짜 포맷팅
        let dateRange = '날짜 미정';
        if (item.startDate && item.endDate) {
            const startFormatted = dayjs(item.startDate).locale('ko').format('YYYY.M.D');
            const endFormatted = dayjs(item.endDate).locale('ko').format('M.D');
            dateRange = `${startFormatted} ~ ${endFormatted}`;
        } else if (item.startDate) {
            dateRange = dayjs(item.startDate).locale('ko').format('YYYY.M.D') + ' ~';
        }
        
        return {
            id: transformedId,
            travelId: item.id, 
            title: item.title || '여행 제목 없음',
            startDate: item.startDate,
            endDate: item.endDate,
            dateRange: dateRange,
            dayCount: item.dayCount,
            nightCount: item.nightCount,
            periodType: item.periodType,
            isFavorite: item.isFavorite,
            // 멤버 정보는 아직 API가 없으므로 빈 배열
            members: item.members || []
        };
    });
};

// 백엔드 일정 데이터를 프론트엔드 형식으로 변환하는 함수
export const transformScheduleData = (scheduleData) => {
    if (!scheduleData || scheduleData.length === 0) return [];    
    
    return scheduleData.map((item, index) => {
        // time_slot 파싱 (예: "07:00 ~ 08:00")
        let startHour = 0;
        let endHour = 0;
        let timeDisplay = '시간 미정';
        
        if (item.timeSlot) {
            
            if (item.timeSlot.includes('~')) {
                // "07:00 ~ 08:00" 형식
                const [startTime, endTime] = item.timeSlot.split('~').map(t => t.trim());
                startHour = parseInt(startTime.split(':')[0]) || 0;
                endHour = parseInt(endTime.split(':')[0]) || 0;
                timeDisplay = `${startTime} - ${endTime}`;

            } else if (item.timeSlot.includes('-')) {
                // "07:00-08:00" 형식 (혹시 모를 경우)
                const [startTime, endTime] = item.timeSlot.split('-').map(t => t.trim());
                startHour = parseInt(startTime.split(':')[0]) || 0;
                endHour = parseInt(endTime.split(':')[0]) || 0;
                timeDisplay = `${startTime} - ${endTime}`;

            } else {
                // 단일 시간인 경우 (예: "09:00")
                startHour = parseInt(item.timeSlot.split(':')[0]) || 0;
                endHour = startHour + 1; // 1시간 기본 설정
                timeDisplay = item.timeSlot;

            }
        } else {
            console.log('❌ timeSlot이 없습니다');
        }

        // 카테고리 매핑 (정확한 4개 태그만)
        const categoryMap = {
            '숙소': '숙소',
            '식사': '식사', 
            '관광': '관광',
            '휴식': '휴식'
        };
        
        const category = categoryMap[item.tag] || '기타';
        

        
        return {
            id: item.id || index + 1,
            title: item.title || item.attributeTitle || '일정 없음',
            time: timeDisplay,
            category: category,
            startHour: startHour,
            endHour: endHour,
            location: item.location,
            memo: item.memo,
            tip: item.tip,
            latitude: item.latitude,
            longitude: item.longitude,
            stayDuration: item.stayDuration,
            date: item.date,
            tag: item.tag
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
        console.warn(`⚠️ ${apiName} 타임아웃 발생`);
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
                if (error.name === 'AbortError') {
                    throw new Error(`여행 API 서버 응답 시간이 초과되었습니다.`);
                }
                throw error;
            }

            console.warn(`⚠️ 시도 ${attempt} 실패, ${1000 * attempt}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// 1. 내 여행 목록 조회 (간단 정보)
export const getMyToursBriefApi = async (userId) => {
    const url = `${API_URL}/api/accompany/my-tours/brief?userId=${userId}`;
    console.log('🌐 내 여행 목록 조회 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();
        return transformTourData(data);
    } catch (error) {
        handleApiError(error, '여행 목록 조회');
        throw error;
    }
};

// 2. 여행 일정 상세 조회
export const getTourScheduleDetailApi = async (travelId) => {
    const url = `${API_URL}/api/accompany/schedule-detail/${travelId}`;
    console.log('🌐 여행 일정 상세 조회 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();
        return transformScheduleData(data);
    } catch (error) {
        handleApiError(error, '여행 일정 조회');
        throw error;
    }
};

// 3. 현재 진행중인 여행 확인 함수
export const getCurrentTourStatus = (tourList) => {
    if (!tourList || tourList.length === 0) {
        return { status: 'none', currentTour: null, daysLeft: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ongoingTour = tourList.find(tour => {
        if (!tour.startDate || !tour.endDate) return false;
        
        // 로컬 시간대로 강제 변환
        const startDate = new Date(tour.startDate + 'T00:00:00');
        const endDate = new Date(tour.endDate + 'T23:59:59');
        
        return today >= startDate && today <= endDate;
    });

    if (ongoingTour) {
        return { status: 'ongoing', currentTour: ongoingTour, daysLeft: 0 };
    }

    const upcomingTour = tourList.find(tour => {
        if (!tour.startDate) return false;
        
        // 로컬 시간대로 강제 변환
        const startDate = new Date(tour.startDate + 'T00:00:00');
        
        const timeDiff = startDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return daysDiff > 0 && daysDiff <= 3;
    });

    if (upcomingTour) {
        const startDate = new Date(upcomingTour.startDate + 'T00:00:00');
        const timeDiff = startDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return { status: 'upcoming', currentTour: upcomingTour, daysLeft };
    }

    return { status: 'none', currentTour: null, daysLeft: 0 };
};

// hometourapi.js에 추가
export const convertUTCToLocal = (utcDateString) => {
    if (!utcDateString) return null;
    
    // UTC 문자열을 로컬 시간대로 강제 변환
    const cleanedDateString = utcDateString.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '');
    return new Date(cleanedDateString);
};