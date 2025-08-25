import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// 기본 API URL을 가져오는 함수 (환경 설정에 따라)
    const getBaseURL = () => {
    // 개발 모드일 때
    if (__DEV__) {
        if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8080';
        }
        if (Platform.OS === 'web') {
        return 'http://localhost:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } 
    // 배포(프로덕션) 모드일 때
    else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
    };
const API_URL = getBaseURL();

// 백엔드 폴더 데이터를 프론트엔드 형식으로 변환하는 함수
export const transformFolderData = (folderData) => {
    if (!folderData) return [];

    console.log('🔍 원본 백엔드 폴더 데이터 전체:', folderData);
    console.log('🔍 폴더 배열 길이:', folderData.length);
    
    return folderData.map((item, index) => {
        const originalId = item.id;
        const transformedId = item.id?.toString() || Math.random().toString();
        
        console.log(`🔄 폴더 변환 ${index}: 원본 id=${originalId} → 변환된 id=${transformedId}`);
        
        return {
            id: transformedId,
            folderId: item.id,
            title: item.title || '폴더명 없음',
            startDate: item.startDate ? dayjs(item.startDate).locale('ko').format('YYYY.MM.DD') : null,
            endDate: item.endDate ? dayjs(item.endDate).locale('ko').format('YYYY.MM.DD') : null,
            postcards: item.postcards || [],
            dateRange: item.startDate && item.endDate ? 
                `${dayjs(item.startDate).locale('ko').format('MM.DD')} ~ ${dayjs(item.endDate).locale('ko').format('MM.DD')}` : 
                '날짜 미정',
        };
    });
};

// 백엔드 엽서 데이터를 프론트엔드 형식으로 변환하는 함수
export const transformPostcardData = (postcardData) => {
    if (!postcardData) return [];

    console.log('🔍 원본 백엔드 엽서 데이터 전체:', postcardData);
    console.log('🔍 배열 길이:', postcardData.length);
    
    // 각 아이템의 id를 확인
    postcardData.forEach((item, index) => {
        console.log(`🔍 엽서 아이템 ${index}: id=${item.postcardId} (타입: ${typeof item.postcardId}), title=${item.title}`);
    });
    
    return postcardData.map((item, index) => {
        // id 변환 과정 상세 로그
        const originalId = item.postcardId;
        const transformedId = item.postcardId?.toString() || Math.random().toString();
        
        console.log(`🔄 엽서 변환 ${index}: 원본 id=${originalId} → 변환된 id=${transformedId}`);
        
        if (!originalId) {
            console.error(`❌ 경고! 엽서 아이템 ${index}의 id가 없습니다:`, item);
        }
        
        return {
            id: transformedId,
            postcardId: item.postcardId,
            title: item.title || '제목 없음',
            imageUrl: item.imageUrl || null,
            author: item.author || '작성자 미상',
            scrapCount: item.scrapCount || 0,
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
                    throw new Error(`엽서 API 서버 응답 시간이 초과되었습니다.`);
                }
                throw error;
            }

            // 재시도 전 잠시 대기
            console.warn(`⚠️ 시도 ${attempt} 실패, ${1000 * attempt}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// 1. 기존 폴더에 엽서 생성
export const createPostcardInExistingFolderApi = async (folderId, postcardData) => {
    const url = `${API_URL}/api/postcards/folders/${folderId}`;
    console.log('🌐 기존 폴더에 엽서 생성 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postcardData),
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 2. 새 폴더에 엽서 생성
export const createPostcardWithNewFolderApi = async (folderAndPostcardData) => {
    const url = `${API_URL}/api/postcards/folders`;
    console.log('🌐 새 폴더에 엽서 생성 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(folderAndPostcardData),
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 3. 폴더별 엽서 목록 조회
export const getPostcardsByFolderApi = async (folderId) => {
    const url = `${API_URL}/api/postcards/folders/${folderId}/postcards`;
    console.log('🌐 폴더별 엽서 목록 조회 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 4. 엽서 수정
export const updatePostcardApi = async (postcardId, updateData) => {
    const url = `${API_URL}/api/postcards/${postcardId}`;
    console.log('🌐 엽서 수정 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 5. 엽서 즐겨찾기 토글
export const toggleFavoritePostcardApi = async (postcardId) => {
    const url = `${API_URL}/api/postcards/${postcardId}/favorite`;
    console.log('🌐 엽서 즐겨찾기 토글 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'PATCH',
        });
        // 204 No Content 응답이므로 null 반환
        return null;
    } catch (error) {
        throw error;
    }
};

// 6. 엽서 삭제
export const deletePostcardApi = async (postcardId) => {
    const url = `${API_URL}/api/postcards/${postcardId}`;
    console.log('🌐 엽서 삭제 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'DELETE',
        });
        // 204 No Content 응답이므로 null 반환
        return null;
    } catch (error) {
        throw error;
    }
};

// 7. 즐겨찾기 엽서 목록 조회 (엽서보드)
export const getFavoritePostcardsApi = async (userEmail) => {
    const url = `${API_URL}/api/postcards/favorites?userEmail=${encodeURIComponent(userEmail)}`;
    console.log('🌐 즐겨찾기 엽서 목록 조회 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 8. 사용자 폴더 목록 조회
export const getFoldersByUserApi = async (userEmail) => {
    const url = `${API_URL}/api/postcards/folders?userEmail=${encodeURIComponent(userEmail)}`;
    console.log('🌐 사용자 폴더 목록 조회 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 9. 폴더 수정
export const updateFolderApi = async (folderId, folderData) => {
    const url = `${API_URL}/api/postcards/folders/${folderId}`;
    console.log('🌐 폴더 수정 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(folderData),
        });
        // 204 No Content 응답이므로 null 반환
        return null;
    } catch (error) {
        throw error;
    }
};

// 10. 폴더 삭제
export const deleteFolderApi = async (folderId) => {
    const url = `${API_URL}/api/postcards/folders/${folderId}`;
    console.log('🌐 폴더 삭제 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'DELETE',
        });
        // 204 No Content 응답이므로 null 반환
        return null;
    } catch (error) {
        throw error;
    }
};

// 11. 엽서 스크랩
export const scrapPostcardApi = async (postcardId, userId) => {
    const url = `${API_URL}/api/postcards/${postcardId}/scrap?userId=${userId}`;
    console.log('🌐 엽서 스크랩 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'POST',
        });
        // 204 No Content 응답이므로 null 반환
        return null;
    } catch (error) {
        throw error;
    }
};

// 12. 엽서 스크랩 취소
export const unscrapPostcardApi = async (postcardId, userId) => {
    const url = `${API_URL}/api/postcards/${postcardId}/scrap?userId=${userId}`;
    console.log('🌐 엽서 스크랩 취소 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'DELETE',
        });
        // 204 No Content 응답이므로 null 반환
        return null;
    } catch (error) {
        throw error;
    }
};

// 13. 사용자가 스크랩한 엽서 목록 조회
export const getScrappedPostcardsApi = async (userId) => {
    const url = `${API_URL}/api/postcards/users/${userId}/scrapped`;
    console.log('🌐 스크랩한 엽서 목록 조회 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 14. 엽서 좋아요
export const likePostcardApi = async (postcardId, userId) => {
    const url = `${API_URL}/api/postcards/${postcardId}/like?userId=${userId}`;
    console.log('🌐 엽서 좋아요 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'POST',
        });
        // 204 No Content 응답이므로 null 반환
        return null;
    } catch (error) {
        throw error;
    }
};

// 15. 엽서 좋아요 취소
export const unlikePostcardApi = async (postcardId, userId) => {
    const url = `${API_URL}/api/postcards/${postcardId}/like?userId=${userId}`;
    console.log('🌐 엽서 좋아요 취소 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'DELETE',
        });
        // 204 No Content 응답이므로 null 반환
        return null;
    } catch (error) {
        throw error;
    }
};



