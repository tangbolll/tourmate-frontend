import Constants from 'expo-constants';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// API 베이스 URL 설정
const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};
const API_URL = getBaseURL();

// 백엔드 데이터 포맷을 프론트엔드 형식으로 변환
const transformAccompanyDetail = (backendData) => {
    if (!backendData) return null;

    const getImageUrl = (item) => {
        if (item.images && item.images.length > 0) return item.images[0];
        if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls[0];
        if (item.imageUrl) return item.imageUrl;
        return '';
    };

    // 이미지 URL 배열을 가져오는 함수
    const getImageUrls = (item) => {
        if (item.images && item.images.length > 0) return item.images;
        if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls;
        if (item.imageUrl) return [item.imageUrl];
        return [];
    };

    return {
        id: backendData.id?.toString() || '1',
        title: backendData.title || '제목 없음',
        location: backendData.location || '위치 미정',
        createdAt: backendData.postDate ? dayjs(backendData.postDate).locale('ko').format('YYYY.MM.DD') : dayjs().locale('ko').format('YYYY.MM.DD'),
        imageUrl: getImageUrl(backendData),      // 첫 번째 이미지 (기존 호환성)
        imageUrls: getImageUrls(backendData),   // 모든 이미지 배열 추가
        views: backendData.views || 0,
        travelStartDate: backendData.tripStartDate ? dayjs(backendData.tripStartDate).locale('ko').format('YYYY.MM.DD') : '기간미정',
        travelEndDate: backendData.tripEndDate ? dayjs(backendData.tripEndDate).locale('ko').format('YYYY.MM.DD') : '',
        recruitStartDate: backendData.recStartDate ? dayjs(backendData.recStartDate).locale('ko').format('YYYY.MM.DD') : '기간미정',
        recruitEndDate: backendData.recEndDate ? dayjs(backendData.recEndDate).locale('ko').format('YYYY.MM.DD') : '',
        description: backendData.intro || '설명이 없습니다.',
        meetingPoint: backendData.meetPlace || '미정',
        member: backendData.participants?.map(p => p.userId?.toString()) || [],
        applymember: backendData.applicants?.map(a => a.userId?.toString()) || [],
        gender: backendData.gender === 'ALL' ? '남녀무관' : (backendData.gender || '미정'),
        ageRange: (backendData.ageGroup || []).map(age => age === "ALL" ? "누구나" : age),
        category: backendData.category || [],
        tags: backendData.tag || [],
        currentParticipants: backendData.participants?.length || 1,
        maxParticipants: backendData.maxRecruit || 0,
        createdBy: backendData.userId?.toString() || 'unknown',
        createdByName: backendData.host?.nickname || '알 수 없음',
        likes: backendData.likeCount || 0,
        isLiked: backendData.likedByCurrentUser || false,
        status: backendData.accompanyStatus || 'RECRUITING',  // 동행 상태: RECRUITING, COMPLETED, CLOSED
        userApplicationStatus: backendData.userApplicationStatus || null,  // 사용자 신청 상태:PENDING, ACCEPTED, REJECTED, CANCELLED
    };
};

// userApplicationStatus 기반으로 신청 여부 판단
const isUserApplied = (userApplicationStatus) => {
    return userApplicationStatus && ['PENDING', 'ACCEPTED'].includes(userApplicationStatus);
};

const formatTimeAgo = (dateString) => {
    const now = dayjs();
    const commentTime = dayjs(dateString);
    const diffMinutes = now.diff(commentTime, 'minute');
    const diffHours = now.diff(commentTime, 'hour');
    const diffDays = now.diff(commentTime, 'day');

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return commentTime.format('M월 D일');
};

// 동행 상세 정보를 가져오는 API 함수 - 개선된 버전
export const fetchAccompanyDetailApi = async (postId, userId) => {
    const url = `${API_URL}/api/accompany/AccompanyPost?postId=${postId}&userId=${userId}`;
    console.log('🌐 동행 상세 조회 API 호출:', url);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
    }

    const backendData = await response.json();
    console.log('📋 백엔드 원본 데이터:', backendData);

    // 좋아요 상태 조회
    const likeStatusResponse = await fetch(`${API_URL}/api/accompany/${postId}/like/status?id=${userId}`);
    if (likeStatusResponse.ok) {
        const likeData = await likeStatusResponse.json();
        backendData.likeCount = likeData.likeCount;
        backendData.likedByCurrentUser = likeData.isLiked;
    }

    // 사용자 신청 상태 조회 - 더 정확한 방법
    try {
        const applicationStatusResponse = await fetch(`${API_URL}/api/accompany/${postId}/application-status?userId=${userId}`);
        if (applicationStatusResponse.ok) {
            const applicationData = await applicationStatusResponse.json();
            backendData.userApplicationStatus = applicationData.status;
            console.log('📝 사용자 신청 상태:', applicationData);
        } else {
            // 대안: my-applications 엔드포인트 사용
            const myApplicationsResponse = await fetch(`${API_URL}/api/accompany/my-applications?id=${userId}`);
            if (myApplicationsResponse.ok) {
                const myApplications = await myApplicationsResponse.json();
                const currentApplication = myApplications.find(app => app.id?.toString() === postId);
                
                if (currentApplication) {
                    backendData.userApplicationStatus = currentApplication.userApplicationStatus || 'CANCELLED';
                    console.log('📝 사용자 신청 상태 (대안 방법):', currentApplication);
                } else {
                    backendData.userApplicationStatus = null;
                    console.log('📝 신청 내역 없음');
                }
            }
        }
    } catch (error) {
        console.warn('⚠️ 사용자 신청 상태 조회 실패:', error);
        backendData.userApplicationStatus = null;
    }

    const transformedData = transformAccompanyDetail(backendData);
    console.log('✅ 변환된 최종 데이터:', transformedData);
    
    return transformedData;
};

// 댓글 목록을 가져오는 API 함수
export const fetchCommentsApi = async (accompanyId) => {
    const url = `${API_URL}/api/accompany/${accompanyId}/comments`;
    console.log('🌐 댓글 조회 API 호출:', url);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch comments');
    }

    const commentsData = await response.json();
    return commentsData.map(comment => ({
        id: comment.id?.toString(),
        nickname: comment.authorName,
        time: comment.createdAt ? formatTimeAgo(comment.createdAt) : '방금 전',
        content: comment.content,
        profileImage: comment.authorProfileImage,
        isHost: comment.isAuthor,
        replies: comment.replies?.map(reply => ({
            id: reply.id?.toString(),
            nickname: reply.authorName,
            time: reply.createdAt ? formatTimeAgo(reply.createdAt) : '방금 전',
            content: reply.content,
            profileImage: reply.authorProfileImage,
            isHost: reply.isAuthor,
        })) || [],
    }));
};

// 댓글/답글을 저장하는 API 함수
export const saveCommentApi = async (postId, content, userId, parentCommentId = null) => {
    const url = `${API_URL}/api/accompany/${postId}/comments`;
    console.log('🌐 댓글 작성 API 호출:', url);

    const requestBody = {
        content: content.trim(),
        userId: parseInt(userId),
        ...(parentCommentId && { parentCommentId: parseInt(parentCommentId) })
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save comment: ${errorText}`);
    }

    const result = await response.json();
    return {
        id: result.id?.toString(),
        nickname: result.userNickname,
        time: result.createdAt ? formatTimeAgo(result.createdAt) : '방금 전',
        content: result.content,
        profileImage: null,
        isHost: result.isHostComment,
    };
};

// 좋아요 추가/취소 API - 디버깅 로그 추가
export const toggleLikeApi = async (accompanyId, userId) => {
    const numericAccompanyId = Number(accompanyId);
    
    if (isNaN(numericAccompanyId)) {
        console.error('❌ 유효하지 않은 accompanyId가 전달되었습니다:', accompanyId);
        throw new Error('Invalid accompanyId provided.');
    }

    console.log(`🔍 toggleLikeApi 호출: accompanyId=${numericAccompanyId}, userId=${userId}`);

    try {
        const url = `${API_URL}/api/accompany/${numericAccompanyId}/like`;
        console.log(`🌐 API 호출 URL: ${url}`);
        console.log(`🌐 API 호출 파라미터: id=${userId}`);
        
        const response = await axios.post(url, null, {
            params: {
                id: userId
            },
            timeout: 10000 // 10초 타임아웃 추가
        });
        
        console.log(`✅ toggleLikeApi 응답 성공:`, {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        
        console.log(`🔍 토글 응답 데이터 상세 분석:`, {
            liked: response.data.liked,
            liked_type: typeof response.data.liked,
            likeCount: response.data.likeCount,
            likeCount_type: typeof response.data.likeCount,
            전체_응답_키들: Object.keys(response.data)
        });
        
        // ✅ 백엔드 응답 필드명에 맞춰 변환하고 유효성 검사 추가
        const result = {
            isLiked: Boolean(response.data.liked), // Boolean으로 확실히 변환
            likeCount: Number(response.data.likeCount) || 0 // Number로 확실히 변환, fallback 0
        };
        
        console.log(`🔍 최종 반환값:`, {
            isLiked: result.isLiked,
            isLiked_type: typeof result.isLiked,
            likeCount: result.likeCount,
            likeCount_type: typeof result.likeCount
        });
        
        return result;
        
    } catch (error) {
        console.error(`❌ toggleLikeApi 에러 (ID: ${numericAccompanyId}):`, {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params
        });
        
        handleApiError(error, `좋아요 토글 (ID: ${numericAccompanyId})`);
        throw error;
    }
};

// 좋아요 상태 조회 API - 디버깅 로그 추가
export const getLikeStatusApi = async (accompanyId, userId) => {
    // accompanyId를 명시적으로 Number 타입으로 변환
    const numericAccompanyId = Number(accompanyId);
    
    if (isNaN(numericAccompanyId)) {
        console.error('❌ 유효하지 않은 accompanyId가 전달되었습니다:', accompanyId);
        return { isLiked: false, likeCount: 0 };
    }
    
    console.log(`🔍 getLikeStatusApi 호출: accompanyId=${numericAccompanyId}, userId=${userId}`);
    
    try {
        const url = `${API_URL}/api/accompany/${numericAccompanyId}/like/status`;
        console.log(`🌐 API 호출 URL: ${url}`);
        console.log(`🌐 API 호출 파라미터: id=${userId}`);
        
        const response = await axios.get(url, {
            params: {
                id: userId
            },
            timeout: 10000 // 10초 타임아웃 추가
        });
        
        console.log(`✅ getLikeStatusApi 응답 성공:`, response.data);
        console.log(`🔍 응답 데이터 타입 확인:`, {
            liked: typeof response.data.liked,
            likeCount: typeof response.data.likeCount,
            전체_응답: response.data
        });
        
        // ✅ 백엔드 응답 필드명에 맞춰 변환
        return {
            isLiked: response.data.liked, // liked → isLiked로 변환
            likeCount: response.data.likeCount
        };
        
    } catch (error) {
        console.error(`❌ getLikeStatusApi 에러 (ID: ${numericAccompanyId}):`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        
        // 404 에러인 경우 (동행이 존재하지 않음)
        if (error.response?.status === 404) {
            console.warn(`⚠️ 동행 ID ${numericAccompanyId}를 찾을 수 없습니다.`);
            return { isLiked: false, likeCount: 0 };
        }
        
        // 다른 에러의 경우
        handleApiError(error, `좋아요 상태 조회 (ID: ${numericAccompanyId})`);
        return { isLiked: false, likeCount: 0 };
    }
};




// 동행 신청/취소 API 함수
export const toggleApplicationApi = async (postId, userId, currentUserApplicationStatus) => {
    try {
        const isCurrentlyApplied = isUserApplied(currentUserApplicationStatus);
        
        // 올바른 URL과 메서드 설정
        let url, method;
        
        if (isCurrentlyApplied) {
            // 취소: PATCH /api/accompany/{accompanyId}/apply/cancel
            url = `${API_URL}/api/accompany/${postId}/apply/cancel?id=${userId}`;
            method = 'PATCH';
        } else {
            // 신청: POST /api/accompany/{accompanyId}/apply
            url = `${API_URL}/api/accompany/${postId}/apply?id=${userId}`;
            method = 'POST';
        }
        
        console.log(`🌐 동행 ${isCurrentlyApplied ? '취소' : '신청'} API 호출:`, url);
        console.log(`📝 HTTP Method: ${method}`);
        console.log(`📝 Current Status: ${currentUserApplicationStatus}`);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API 응답 오류 (${response.status}):`, errorText);
            
            if (errorText.includes('already applied')) {
                throw new Error('이미 신청한 동행입니다.');
            } else if (errorText.includes('not found')) {
                throw new Error('동행을 찾을 수 없습니다.');
            } else if (errorText.includes('not applied')) {
                throw new Error('신청하지 않은 동행입니다.');
            }
            
            throw new Error(`${isCurrentlyApplied ? '동행 취소' : '동행 신청'}에 실패했습니다. (${response.status})`);
        }

        // 🔥 중요: 백엔드가 문자열을 반환하므로 text()로 받기
        const result = await response.text();
        console.log(`✅ 동행 ${isCurrentlyApplied ? '취소' : '신청'} 성공:`, result);
        
        // 🔥 성공했으므로 새로운 상태 반환
        return {
            success: true,
            newStatus: isCurrentlyApplied ? null : 'PENDING',
            message: isCurrentlyApplied ? '동행 신청이 취소되었습니다.' : '동행 신청이 완료되었습니다.'
        };

    } catch (error) {
        console.error(`❌ 동행 ${isUserApplied(currentUserApplicationStatus) ? '취소' : '신청'} 오류:`, error);
        throw error;
    }
};

// 동행 모집 마감 API 함수
export const closeAccompanyPostApi = async (postId) => {
    const url = `${API_URL}/api/accompany/${postId}/close`;
    console.log('🌐 동행 모집 마감 API 호출:', url);

    const response = await fetch(url, { method: 'PATCH' });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to close the post');
    }
    
    return await response.text();
};

// 동행 삭제 코드
export const deleteAccompanyPostApi = async (postId) => {
    try {
        console.log('🗑️ DELETE API 호출 시작 - postId:', postId);
        
        const response = await fetch(`${API_URL}/api/accompany/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // JSON 파싱 에러 방지를 위한 안전한 에러 처리
            let errorMessage = '삭제에 실패했습니다.';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                // JSON 파싱 실패 시 응답을 텍스트로 읽기
                try {
                    const errorText = await response.text();
                    console.error('❌ 서버 응답 (텍스트):', errorText);
                    errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
                } catch (textError) {
                    console.error('❌ 응답 읽기 실패:', textError);
                    errorMessage = `서버 오류 (${response.status})`;
                }
            }
            
            throw new Error(errorMessage);
        }

        // 🔥 성공 응답도 안전하게 처리
        let data;
        try {
            const responseText = await response.text();
            console.log('📄 응답 텍스트:', responseText);
            
            if (responseText.trim() === '') {
                // 빈 응답인 경우
                data = { success: true, message: '삭제 완료' };
            } else {
                // JSON 파싱 시도
                data = JSON.parse(responseText);
            }
        } catch (parseError) {
            console.warn('⚠️ JSON 파싱 실패, 하지만 삭제는 성공:', parseError);
            // 파싱 실패해도 HTTP 상태가 성공이면 삭제된 것으로 간주
            data = { success: true, message: '삭제 완료' };
        }
        
        console.log('✅ DELETE API 성공:', data);
        return data;
        
    } catch (error) {
        console.error('🔥 DELETE API 에러:', error);
        throw error;
    }
};

// 🆕 새로 추가된 API 함수들

// 읽지 않은 동행 신청 개수 조회 API 함수
export const getUnreadApplicationsApi = async (accompanyId, hostId) => {
    try {
        const url = `${API_URL}/api/accompany/${accompanyId}/unread-applications?hostId=${hostId}`;
        console.log('🌐 읽지 않은 신청 개수 조회 API 호출:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ 읽지 않은 신청 개수 조회 실패 (${response.status}):`, errorText);
            throw new Error(`읽지 않은 신청 개수 조회에 실패했습니다. (${response.status})`);
        }

        const result = await response.json();
        console.log('✅ 읽지 않은 신청 개수 조회 성공:', result);
        
        return {
            unreadCount: result.unreadCount || 0
        };

    } catch (error) {
        console.error('❌ 읽지 않은 신청 개수 조회 오류:', error);
        throw error;
    }
};
