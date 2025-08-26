import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API 베이스 URL 설정
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

// API 에러 처리 공통 함수
const handleApiError = (error, operation) => {
    console.error(`❌ ${operation} 실패:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
    });
    
    if (error.response?.status === 404) {
        throw new Error('요청한 데이터를 찾을 수 없습니다.');
    } else if (error.response?.status === 403) {
        throw new Error('권한이 없습니다.');
    } else if (error.response?.status === 400) {
        throw new Error(error.response?.data || '잘못된 요청입니다.');
    } else if (error.response?.status >= 500) {
        throw new Error('서버 오류가 발생했습니다.');
    } else {
        throw new Error('네트워크 오류가 발생했습니다.');
    }
};

// ✅ 동행 신청 수락 API
export const acceptApplicationApi = async (accompanyId, applicantId) => {
    const numericAccompanyId = Number(accompanyId);
    const numericApplicantId = Number(applicantId);
    
    if (isNaN(numericAccompanyId) || isNaN(numericApplicantId)) {
        throw new Error('유효하지 않은 ID입니다.');
    }

    console.log(`🔍 acceptApplicationApi 호출: accompanyId=${numericAccompanyId}, applicantId=${numericApplicantId}`);

    try {
        const url = `${API_URL}/api/accompany/${numericAccompanyId}/accept/${numericApplicantId}`;
        console.log(`🌐 API 호출 URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || '신청 수락에 실패했습니다.');
        }

        const result = await response.text();
        console.log(`✅ acceptApplicationApi 성공:`, result);
        
        return {
            success: true,
            message: result,
            accompanyId: numericAccompanyId,
            applicantId: numericApplicantId
        };

    } catch (error) {
        console.error(`❌ acceptApplicationApi 에러:`, error);
        handleApiError(error, '신청 수락');
        throw error;
    }
};

// ✅ 동행 신청 거절 API
export const rejectApplicationApi = async (accompanyId, applicantId) => {
    const numericAccompanyId = Number(accompanyId);
    const numericApplicantId = Number(applicantId);
    
    if (isNaN(numericAccompanyId) || isNaN(numericApplicantId)) {
        throw new Error('유효하지 않은 ID입니다.');
    }

    console.log(`🔍 rejectApplicationApi 호출: accompanyId=${numericAccompanyId}, applicantId=${numericApplicantId}`);

    try {
        const url = `${API_URL}/api/accompany/${numericAccompanyId}/reject/${numericApplicantId}`;
        console.log(`🌐 API 호출 URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || '신청 거절에 실패했습니다.');
        }

        const result = await response.text();
        console.log(`✅ rejectApplicationApi 성공:`, result);
        
        return {
            success: true,
            message: result,
            accompanyId: numericAccompanyId,
            applicantId: numericApplicantId
        };

    } catch (error) {
        console.error(`❌ rejectApplicationApi 에러:`, error);
        handleApiError(error, '신청 거절');
        throw error;
    }
};

// ✅ 동행 멤버 내보내기 API
export const removeParticipantApi = async (accompanyId, participantId) => {
    const numericAccompanyId = Number(accompanyId);
    const numericParticipantId = Number(participantId);
    
    if (isNaN(numericAccompanyId) || isNaN(numericParticipantId)) {
        throw new Error('유효하지 않은 ID입니다.');
    }

    console.log(`🔍 removeParticipantApi 호출: accompanyId=${numericAccompanyId}, participantId=${numericParticipantId}`);

    try {
        const url = `${API_URL}/api/accompany/${numericAccompanyId}/remove-participant/${numericParticipantId}`;
        console.log(`🌐 API 호출 URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || '멤버 내보내기에 실패했습니다.');
        }

        const result = await response.text();
        console.log(`✅ removeParticipantApi 성공:`, result);
        
        return {
            success: true,
            message: result,
            accompanyId: numericAccompanyId,
            participantId: numericParticipantId
        };

    } catch (error) {
        console.error(`❌ removeParticipantApi 에러:`, error);
        handleApiError(error, '멤버 내보내기');
        throw error;
    }
};

//  동행 마감 API
export const closeAccompanyApi = async (accompanyId) => {
    const numericAccompanyId = Number(accompanyId);
    
    if (isNaN(numericAccompanyId)) {
        throw new Error('유효하지 않은 동행 ID입니다.');
    }

    console.log(`🔍 closeAccompanyApi 호출: accompanyId=${numericAccompanyId}`);

    try {
        const url = `${API_URL}/api/accompany/${numericAccompanyId}/close`;
        console.log(`🌐 API 호출 URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || '동행 마감에 실패했습니다.');
        }

        const result = await response.text();
        console.log(`✅ closeAccompanyApi 성공:`, result);
        
        return {
            success: true,
            message: result,
            accompanyId: numericAccompanyId
        };

    } catch (error) {
        console.error(`❌ closeAccompanyApi 에러:`, error);
        handleApiError(error, '동행 마감');
        throw error;
    }
};

//  동행 관리 정보 조회 API (신청자 목록 + 현재 멤버 목록)
export const getAccompanyManagementDataApi = async (accompanyId, hostId) => {
    const numericAccompanyId = Number(accompanyId);
    const numericHostId = Number(hostId);
    
    if (isNaN(numericAccompanyId) || isNaN(numericHostId)) {
        throw new Error('유효하지 않은 ID입니다.');
    }

    console.log(`🔍 getAccompanyManagementDataApi 호출: accompanyId=${numericAccompanyId}, hostId=${numericHostId}`);

    try {
        // 실제 백엔드에 관리 데이터 조회 API가 있다면 사용
        // 현재는 기존 동행 상세 조회 API를 사용한다고 가정
        const url = `${API_URL}/api/accompany/${numericAccompanyId}?userId=${numericHostId}`;
        console.log(`🌐 API 호출 URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || '동행 관리 데이터 조회에 실패했습니다.');
        }

        const data = await response.json();
        console.log(`✅ getAccompanyManagementDataApi 성공:`, data);
        
        // 백엔드 응답을 프론트엔드에서 사용할 형태로 변환
        return {
            accompanyInfo: data,
            applicants: data.applicants || [],
            participants: data.participants || [],
            applications: data.applications || []
        };

    } catch (error) {
        console.error(`❌ getAccompanyManagementDataApi 에러:`, error);
        handleApiError(error, '동행 관리 데이터 조회');
        throw error;
    }
};