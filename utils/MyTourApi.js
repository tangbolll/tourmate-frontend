import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { currentUserId } from '../constants/testUserId';

// API 기본 URL을 가져오는 헬퍼 함수
export const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};

// ==================== 여행(MyTour) 관련 API ====================

// 나의 여행 목록을 가져오는 API 함수
export const fetchMyTours = async (userId) => {
    const url = `${getBaseURL()}/api/myTour/list?userId=${userId}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`데이터를 불러오는 데 실패했습니다. 오류: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log("✅ 서버 응답:", data);
        
        // 백엔드에서 배열을 반환하므로, 그대로 사용합니다.
        return data;
        
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
            const errorText = await response.text();
            throw new Error(`즐겨찾기 업데이트 실패. 오류: ${response.status} ${errorText}`);
        }
        
        console.log('✅ 즐겨찾기 토글 완료:', tourId);
        return true;
        
    } catch (error) {
        console.error('즐겨찾기 토글 에러:', error);
        throw error;
    }
};

// ✅ 여러 여행 삭제 API 함수
export const deleteMyTours = async (tourIds) => {
    try {
        const deletePromises = tourIds.map(tourId => {
            const url = `${getBaseURL()}/api/myTour/${tourId}`;
            return fetch(url, {
                method: 'DELETE',
            }).then(response => {
                if (!response.ok) {
                    return response.text().then(errorText => {
                        throw new Error(`여행 삭제 실패 (ID: ${tourId}). 오류: ${response.status} ${errorText}`);
                    });
                }
                return `여행 삭제 성공 (ID: ${tourId})`;
            });
        });
        
        const results = await Promise.allSettled(deletePromises);
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                console.log(`✅ ${result.value}`);
            } else {
                console.error(`❌ ${result.reason}`);
            }
        });

        // 모든 삭제 요청이 성공했는지 확인
        const allSuccessful = results.every(result => result.status === 'fulfilled');
        if (!allSuccessful) {
            throw new Error('일부 여행 삭제에 실패했습니다.');
        }

        return true;
        
    } catch (error) {
        console.error('여행 삭제 에러:', error);
        throw error;
    }
};

// ✅ 새로운 여행 일정 생성 API 함수
export const createTour = async (tourData) => {
    const url = `${getBaseURL()}/api/myTour/create`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tourData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`여행 생성 실패. 오류: ${response.status} ${errorText}`);
        }
        
        const newTour = await response.json();
        console.log('✅ 여행 생성 완료:', newTour);
        return newTour;

    } catch (error) {
        console.error('여행 생성 에러:', error);
        throw error;
    }
};

// ✅ 여행 일정 수정 API 함수
export const updateTour = async (tourId, tourData) => {

    // 기존 updateTour 호출
    const url = `${getBaseURL()}/api/myTour/${tourId}`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tourData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`여행 수정 실패. 오류: ${response.status} ${errorText}`);
        }

        const updatedTour = await response.json();
        console.log('✅ 여행 수정 완료:', updatedTour);
        return updatedTour;

    } catch (error) {
        console.error('여행 수정 에러:', error);
        throw error;
    }
};


// ✅ 여행 상세 정보 조회 API 함수 - 경로 수정
export const getTourDetails = async (tourId) => {
    try {
        // 경로를 다른 API들과 일치하게 수정
        const response = await fetch(`${getBaseURL()}/api/myTour/${tourId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`여행 상세 정보를 불러오는데 실패했습니다. 오류: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        console.log('✅ 여행 상세 정보 조회 성공:', data);
        return data;
    } catch (error) {
        console.error('여행 상세 정보 조회 중 오류 발생:', error);
        throw error;
    }
};

// ==================== 여행 스케줄(TravelSchedule) 관련 API ====================

// ✅ 여행 스케줄 생성 API 함수
export const createTravelSchedule = async (scheduleData) => {
    const url = `${getBaseURL()}/api/travelSchedule/create`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scheduleData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`여행 스케줄 생성 실패. 오류: ${response.status} ${errorText}`);
        }
        
        const newSchedule = await response.json();
        console.log('✅ 여행 스케줄 생성 완료:', newSchedule);
        return newSchedule;

    } catch (error) {
        console.error('여행 스케줄 생성 에러:', error);
        throw error;
    }
};

// ✅ 여행 스케줄 상세 조회 API 함수
export const getTravelScheduleDetails = async (scheduleId) => {
    const url = `${getBaseURL()}/api/travelSchedule/${scheduleId}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`여행 스케줄 상세 정보를 불러오는데 실패했습니다. 오류: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ 여행 스케줄 상세 정보 조회 성공:', data);
        return data;

    } catch (error) {
        console.error('여행 스케줄 상세 조회 에러:', error);
        throw error;
    }
};

// ✅ 여행 스케줄 삭제 API 함수
export const deleteTravelSchedule = async (scheduleId) => {
    const url = `${getBaseURL()}/api/travelSchedule/${scheduleId}`;
    
    try {
        const response = await fetch(url, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`여행 스케줄 삭제 실패. 오류: ${response.status} ${errorText}`);
        }
        
        console.log('✅ 여행 스케줄 삭제 완료:', scheduleId);
        return true;

    } catch (error) {
        console.error('여행 스케줄 삭제 에러:', error);
        throw error;
    }
};

// ✅ 여행 스케줄 수정 API 함수
export const updateTravelSchedule = async (scheduleId, scheduleData) => {
    const url = `${getBaseURL()}/api/travelSchedule/${scheduleId}`;
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scheduleData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`여행 스케줄 수정 실패. 오류: ${response.status} ${errorText}`);
        }
        
        const updatedSchedule = await response.json();
        console.log('✅ 여행 스케줄 수정 완료:', updatedSchedule);
        return updatedSchedule;

    } catch (error) {
        console.error('여행 스케줄 수정 에러:', error);
        throw error;
    }
};

// ✅ 날짜별 여행 스케줄 조회 API 함수
export const getSchedulesByDate = async (travelId, date) => {
    // date는 'YYYY-MM-DD' 형식의 문자열이어야 합니다
    const url = `${getBaseURL()}/api/travelSchedule/scheduleByDate?travelId=${travelId}&date=${date}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`날짜별 여행 스케줄을 불러오는데 실패했습니다. 오류: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ 날짜별 여행 스케줄 조회 성공:', data);
        return data;

    } catch (error) {
        console.error('날짜별 여행 스케줄 조회 에러:', error);
        throw error;
    }
};

// ✅ 여러 여행 스케줄 삭제 API 함수 (배치 삭제)
export const deleteTravelSchedules = async (scheduleIds) => {
    try {
        const deletePromises = scheduleIds.map(scheduleId => {
            const url = `${getBaseURL()}/api/travelSchedule/${scheduleId}`;
            return fetch(url, {
                method: 'DELETE',
            }).then(response => {
                if (!response.ok) {
                    return response.text().then(errorText => {
                        throw new Error(`여행 스케줄 삭제 실패 (ID: ${scheduleId}). 오류: ${response.status} ${errorText}`);
                    });
                }
                return `여행 스케줄 삭제 성공 (ID: ${scheduleId})`;
            });
        });
        
        const results = await Promise.allSettled(deletePromises);
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                console.log(`✅ ${result.value}`);
            } else {
                console.error(`❌ ${result.reason}`);
            }
        });

        // 모든 삭제 요청이 성공했는지 확인
        const allSuccessful = results.every(result => result.status === 'fulfilled');
        if (!allSuccessful) {
            throw new Error('일부 여행 스케줄 삭제에 실패했습니다.');
        }

        return true;
        
    } catch (error) {
        console.error('여행 스케줄 배치 삭제 에러:', error);
        throw error;
    }
};

// 즐겨찾기 토글 API 함수
export const handleBookmarkPress = async (event) => {
        console.log('handleBookmarkPress called', event.id); 
    try {
        const userId = currentUserId; // 로그인 유저 ID
        const response = await fetch(
            `${getBaseURL()}/api/myTour/${event.id}/favorite?userId=${userId}`,
            { method: 'POST' }
        );

        if (!response.ok) throw new Error('즐겨찾기 업데이트 실패');

        // 상태 업데이트
        if (onBookmarkUpdate) onBookmarkUpdate(event.id);

        console.log('✅ 즐겨찾기 토글 완료:', event.id);
    } catch (error) {
        console.error('Bookmark update error:', error);
    }
};