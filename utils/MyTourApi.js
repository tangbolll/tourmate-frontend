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

export const getTourDetails = async (tourId) => {
    try {
        const response = await fetch(`${getBaseURL()}/myTour/${tourId}`);
        if (!response.ok) {
            throw new Error('여행 상세 정보를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        throw error;
    }
};