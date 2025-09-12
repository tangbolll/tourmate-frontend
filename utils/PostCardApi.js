import { Alert } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './apiConfig';

// ============================================================================
// # 섹션 1: 유틸리티 함수
// ============================================================================

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
            folderId: item.id, // 실제 백엔드 ID
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
    
    // error.message가 유효한 문자열인지 확인
    if (typeof error.message === 'string') {
        if (error.message.includes('Network request failed')) {
            Alert.alert(
                '네트워크 연결 오류',
                '서버에 연결할 수 없습니다.\n\n확인사항:\n1. 서버가 실행 중인지 확인\n2. IP 주소가 올바른지 확인\n3. 포트 번호가 맞는지 확인'
            );
        } else if (error.message.includes('시간이 초과')) {
            // 타임아웃 에러는 Alert를 띄우지 않고 콘솔 로그만
            console.warn(`⚠️ ${apiName} 타임아웃 발생 (재시도 로직으로 처리됨)`);
        } else {
            Alert.alert('오류', `${apiName} 요청 중 예상치 못한 오류가 발생했습니다: ${error.message}`);
        }
    } else {
        // error.message가 문자열이 아닌 경우를 대비
        Alert.alert('오류', `${apiName} 요청 중 알 수 없는 오류가 발생했습니다.`);
    }
};

// 재시도 로직이 포함된 fetch 함수 (JSON용)
const fetchWithRetry = async (url, options = {}, maxRetries = 2, timeoutMs = 15000) => {
    // 💡 AsyncStorage에서 토큰 가져오기
    const token = await AsyncStorage.getItem('jwtToken'); 
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    
    // 토큰이 존재하면 헤더에 추가
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const mergedOptions = {
        ...options,
        headers,
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            console.log(`🔄 API 호출 시도 ${attempt}/${maxRetries}: ${url}`);
            
            const response = await fetch(url, {
                ...mergedOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                // 403 에러일 경우 추가 로그 출력
                if (response.status === 403) {
                    console.error("❌ 403 Forbidden: 인증 토큰이 없거나 유효하지 않습니다.");
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
            }

            console.log(`✅ API 호출 성공 (시도 ${attempt}/${maxRetries})`);
            return response;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (attempt === maxRetries) {
                if (error.name === 'AbortError') {
                    throw new Error(`엽서 API 서버 응답 시간이 초과되었습니다.`);
                }
                throw error;
            }

            console.warn(`⚠️ 시도 ${attempt} 실패, ${1000 * attempt}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// 재시도 로직이 포함된 fetch 함수 (FormData용)
const fetchWithRetryMultipart = async (url, options = {}, maxRetries = 2, timeoutMs = 15000) => {
    // 💡 AsyncStorage에서 토큰 가져오기
    const token = await AsyncStorage.getItem('jwtToken'); 
    
    const headers = {
        'Content-Type': 'multipart/form-data',
        ...(options.headers || {}),
    };
    
    // 토큰이 존재하면 헤더에 추가
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // FormData의 경우 Content-Type을 설정하지 않음 (브라우저가 자동 설정)

    const mergedOptions = {
        ...options,
        headers,
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            console.log(`🔄 Multipart API 호출 시도 ${attempt}/${maxRetries}: ${url}`);
            
            // ⭐⭐⭐ 디버깅을 위해 FormData 내용을 로깅합니다. ⭐⭐⭐
            if (mergedOptions.body instanceof FormData) {
                console.log('📦 전송될 FormData 내용:');
                for (let pair of mergedOptions.body.entries()) {
                    console.log(` -> ${pair[0]}:`, typeof pair[1] === 'string' ? pair[1].substring(0, 50) + '...' : 'File Object');
                }
            }

            const response = await fetch(url, {
                ...mergedOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                // 403 에러일 경우 추가 로그 출력
                if (response.status === 403) {
                    console.error("❌ 403 Forbidden: 인증 토큰이 없거나 유효하지 않습니다.");
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
            }

            console.log(`✅ Multipart API 호출 성공 (시도 ${attempt}/${maxRetries})`);
            return response;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (attempt === maxRetries) {
                if (error.name === 'AbortError') {
                    throw new Error(`엽서 API 서버 응답 시간이 초과되었습니다.`);
                }
                throw error;
            }

            console.warn(`⚠️ 시도 ${attempt} 실패, ${1000 * attempt}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// JWT 토큰 확인 함수 (디버깅용)
export const checkToken = async () => {
    try {
        const token = await AsyncStorage.getItem('jwtToken');
        const userId = await AsyncStorage.getItem('userId');
        console.log('🔑 저장된 토큰:', token ? '존재함' : '없음');
        console.log('🔑 저장된 userId:', userId);
        if (token) {
            console.log('🔑 토큰 앞 20자:', token.substring(0, 20) + '...');
        }
        return { token, userId };
    } catch (error) {
        console.error('❌ 토큰 조회 실패:', error);
        return { token: null, userId: null };
    }
};

// 서버 연결 테스트 함수
export const testServerConnection = async () => {
    try {
        console.log('🔍 서버 연결 테스트 중...');
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log('✅ 서버 연결 성공:', response.status);
        return true;
    } catch (error) {
        console.error('❌ 서버 연결 실패:', error);
        return false;
    }
};

// ============================================================================
// # 섹션 2: 폴더 관련 API
// ============================================================================

// 1. 사용자 폴더 목록 조회
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

// 💡 새로운 함수 추가: 폴더 목록을 가져온 후, 각 폴더의 엽서 목록까지 가져와서 병합
export const getFoldersWithPostcardsApi = async (userEmail) => {
    console.log('🌐 폴더 및 엽서 데이터 일괄 조회 API 호출');
    try {
        // 1단계: 모든 폴더 목록 불러오기
        const rawFolders = await getFoldersByUserApi(userEmail);
        const folders = transformFolderData(rawFolders);

        // 2단계: 각 폴더의 엽서 목록을 비동기적으로 동시에 불러오기
        const fetchPostcardsPromises = folders.map(async (folder) => {
            try {
                const postcards = await getPostcardsByFolderApi(folder.folderId);
                return { ...folder, postcards: transformPostcardData(postcards) };
            } catch (error) {
                // 특정 폴더의 엽서 조회에 실패해도 나머지 작업은 계속 진행
                console.error(`❌ 폴더 ${folder.folderId}의 엽서 목록 조회 실패:`, error);
                return { ...folder, postcards: [] }; // 빈 배열로 처리
            }
        });
        
        // 모든 Promise가 완료될 때까지 기다림
        const foldersWithPostcards = await Promise.all(fetchPostcardsPromises);
        console.log('✅ 모든 폴더와 엽서 데이터 병합 완료:', foldersWithPostcards);

        return foldersWithPostcards;

    } catch (error) {
        // 폴더 목록 조회 자체에 실패한 경우
        handleApiError(error, '폴더 및 엽서 데이터 조회');
        throw error;
    }
};


// 2. 새 폴더 생성과 함께 엽서 생성 - FormData로 수정
export const createPostcardWithNewFolderApi = async (folderData, postcardData, imageFile = null) => {
    const url = `${API_URL}/api/postcards/folders`;
    console.log('🌐 새 폴더에 엽서 생성 API 호출:', url);
    console.log('📁 폴더 데이터:', folderData);
    console.log('📮 엽서 데이터:', postcardData);
    console.log('🖼️ 이미지 파일:', imageFile ? '있음' : '없음', imageFile);

    await checkToken(); // 토큰 확인 (디버깅용)

    try {
        const formData = new FormData();
        
        formData.append('folderData', JSON.stringify(folderData));
        formData.append('postcardData', JSON.stringify(postcardData));
        
        // ⭐ 핵심 수정: 이미지를 Blob으로 변환하여 추가 ⭐
        if (imageFile) {
            const fileName = imageFile.uri.split('/').pop();
            const fileType = imageFile.type; 
            const response = await fetch(imageFile.uri);
            const blob = await response.blob();
            formData.append('image', blob, fileName);
        }

        const response = await fetchWithRetryMultipart(url, {
            method: 'POST',
            body: formData,
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 3. 폴더 수정
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

// 4. 폴더 삭제
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

// ============================================================================
// # 섹션 3: 엽서 관련 API
// ============================================================================

// 5. 기존 폴더에 엽서 생성 - FormData로 수정
export const createPostcardInExistingFolderApi = async (folderId, postcardData, imageFile = null) => {
    const url = `${API_URL}/api/postcards/folders/${folderId}`;

    try {
        const formData = new FormData();
        formData.append('postcardData', JSON.stringify(postcardData));
        
        if (imageFile) {
            const fileName = imageFile.uri.split('/').pop();
            const fileType = imageFile.type || 'image/jpeg';
            
            formData.append('image', {
                uri: imageFile.uri,
                name: fileName,
                type: fileType,
            });
        }
        
        const response = await fetchWithRetryMultipart(url, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        
        // API 응답 로그 확인
        console.log('✅ createPostcardInExistingFolderApi 응답:', result);
        console.log('새로 생성된 엽서 ID:', result.postcardId);
        
        return result;
    } catch (error) {
        throw error;
    }
};

// 6. 폴더별 엽서 목록 조회
export const getPostcardsByFolderApi = async (folderId) => {
    const url = `${API_URL}/api/postcards/folders/${folderId}/postcards`;
    console.log('🌐 폴더별 엽서 목록 조회 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        console.log('✅ 폴더별 엽서 목록 조회 성공:', response);
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 7. 엽서 불러오기 (ID로)
export const getPostcardByIdApi = async (postcardId) => {
    const url = `${API_URL}/api/postcards/${postcardId}`;
    console.log('🌐 엽서 상세 조회 API 호출:', url);

    try {
        const response = await fetchWithRetry(url);
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 8. 엽서 수정 - FormData로 수정
export const updatePostcardApi = async (postcardId, postcardData, imageFile = null) => {
    const url = `${API_URL}/api/postcards/${postcardId}`;
    try {
        const formData = new FormData();
        
        formData.append('postcardData', JSON.stringify(postcardData));
        
        if (imageFile) {
            const fileName = imageFile.uri.split('/').pop();
            const fileType = imageFile.type || 'image/jpeg';
            const response = await fetch(imageFile.uri);
            const blob = await response.blob();
            
            // ⭐ 이 부분을 수정합니다.
            formData.append('image', {
                uri: imageFile.uri,
                name: fileName,
                type: fileType,
            });
        }

        const response = await fetchWithRetryMultipart(url, {
            method: 'PUT',
            body: formData,
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 9. 엽서 삭제
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

// ============================================================================
// # 섹션 4: 엽서 상호작용 및 공개범위 API
// ============================================================================

// 10. 엽서 스크랩
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

// 11. 엽서 스크랩 취소
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

// 12. 사용자가 스크랩한 엽서 목록 조회
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

// 13. 엽서 좋아요
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

// 14. 엽서 좋아요 취소
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

// 좋아요한 엽서 목록
export const getUserLikedPostcardsApi = async (userId) => {
    const url = `${API_URL}/api/postcards/users/${userId}/liked`;
    console.log('🌐 사용자가 좋아요한 엽서 목록 조회 API 호출:', url);
    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();
        return { success: true, data: data };
    } catch (error) {
        console.error('사용자가 좋아요한 엽서 목록 조회 실패:', error);
        return { success: false, error: error.message, data: [] };
    }
};

// ⭐ 수정: 함수 이름과 엔드포인트가 백엔드와 일치하도록 변경
// 엽서 공개범위 토글
export const togglePostcardPublicScopeApi = async (postcardId) => {
    const url = `${API_URL}/api/postcards/${postcardId}/toggle-public`;
    console.log('🌐 엽서 공개범위 토글 API 호출:', url);

    try {
        const response = await fetchWithRetry(url, {
            method: 'POST',
        });
        
        // 204 No Content 응답일 경우 (공개 해제)
        if (response.status === 204) {
            return { isPublic: false };
        }
        
        // 200 OK 응답일 경우 (공개 설정)
        const data = await response.json();
        return { isPublic: true, data };
    } catch (error) {
        throw error;
    }
};

// 엽서 공개 상세정보 업데이트
export const updatePostcardPublicDetailsApi = async (postcardId, publicDetails) => {
    const url = `${API_URL}/api/postcards/${postcardId}/update-public-details`;
    console.log('🌐 엽서 공개 상세정보 업데이트 API 호출:', url);
    console.log('📄 요청 데이터:', publicDetails);

    try {
        const response = await fetchWithRetry(url, {
            method: 'POST', // PUT -> POST로 변경
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(publicDetails),
        });
        
        // 백엔드에서 200 OK를 반환하므로, JSON을 파싱하지 않고 성공 여부만 반환합니다.
        if (response.ok) {
            return { success: true };
        } else {
            const errorText = await response.text();
            throw new Error(`API 오류: ${response.status} ${response.statusText} - ${errorText}`);
        }
    } catch (error) {
        throw error;
    }
};

// 16. 즐겨찾기 엽서 목록 조회
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
