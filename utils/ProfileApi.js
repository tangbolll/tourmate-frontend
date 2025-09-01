import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 베이스 URL 설정
const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080'; // Keep for Android emulator
        }
        // For web and other platforms in development
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV || 'http://localhost:8080';
        if (Platform.OS === 'web') {
            return 'http://localhost:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};
const API_URL = getBaseURL();
console.log("API_URL being used:", API_URL);


// ------------------  Login  ------------------

// 로그인 함수
export const handleLoginApi = async (email, password) => {
  if (!email || !password) {
    return { success: false, message: '이메일과 비밀번호를 모두 입력해주세요.' };
  }

  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });

    if (response.status === 200 && response.data.token) {
      const { token, userId } = response.data;
      return { success: true, token, userId };
    } else {
      return { success: false, message: '서버에서 오류가 발생했습니다.' };
    }
  } catch (error) {
    console.error("Login Failed:", error.response?.data || error.message);
    return { success: false, message: `이메일 또는 비밀번호가 일치하지 않습니다.` };
  }
};

// ------------------  Register  ------------------

export const registerUserApi = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // 성공 시, 응답 데이터를 반환
  } catch (error) {
    throw error.response?.data || error.message; // 실패 시, 에러를 throw
  }
};

export const fetchUserProfileApi = async (userId) => {
    try {
        const token = await AsyncStorage.getItem('jwtToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${API_URL}/api/user/${userId}`, { headers });
        console.log("Fetched user profile:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const updateUserProfileApi = async (userId, userData) => {
    try {
        const token = await AsyncStorage.getItem('jwtToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 백엔드 API 명세에 맞게 PUT 요청으로 수정
        const response = await axios.put(`${API_URL}/api/user/${userId}`, userData, { headers });
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

export const checkNicknameApi = async (nickname) => {
    try {
        const token = await AsyncStorage.getItem('jwtToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 백엔드 API 명세에 맞게 GET 요청 및 params 사용으로 수정
        const response = await axios.get(`${API_URL}/api/user/check-nickname`, {
            headers: headers,
            params: { nickname }
        });
        return response.data; // true (중복) 또는 false (사용 가능)
    } catch (error) {
        console.error('Error checking nickname:', error);
        throw error;
    }
};

export const checkEmailApi = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/check-email?email=${email}`);
    return response.data; // 서버 응답 (true/false)을 직접 반환
  } catch (error) {
    console.error("Email check failed:", error.response?.data || error.message);
    // 에러를 UI 컴포넌트에서 처리할 수 있도록 throw
    throw new Error('이메일 확인 중 오류가 발생했습니다.');
  }
};

export const uploadProfileImageApi = async (userId, imageUri) => {
    try {
        const token = await AsyncStorage.getItem('jwtToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        console.log("Image URI:", imageUri);

        const formData = new FormData();

        // Base64 URI에서 MIME 타입과 데이터 분리
        const base64Response = await fetch(imageUri);
        const blob = await base64Response.blob();

        // 파일 이름과 타입 설정 (여기서는 기본값 사용 또는 imageUri에서 추출)
        const filename = `profile_image_${Date.now()}.jpeg`; // 적절한 파일 이름 생성
        const type = blob.type || 'image/jpeg'; // Blob에서 타입 가져오기, 없으면 기본값

        formData.append('image', blob, filename); // Blob 객체와 파일 이름 전달

        console.log("FormData being sent:", formData);

        const response = await axios.put(`${API_URL}/api/user/${userId}/profile-image`, formData, {
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading profile image:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchCommentsApi = async (accompanyId) => {
    const url = `${API_URL}/api/accompany/${accompanyId}/comments`;
    console.log('🌐 댓글 조회 API 호출:', url);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch comments');
    }

    const commentsData = await response.json();
    return commentsData.map(comment => {
        return {
            id: comment.id?.toString(),
            nickname: comment.userNickname,
            time: comment.createdAt ? formatTimeAgo(comment.createdAt) : '방금 전',
            content: comment.content,
            profileImage: comment.authorProfileImage,
            isHost: comment.hostComment,
            replies: comment.replies?.map(reply => {
                return {
                    id: reply.id?.toString(),
                    nickname: reply.userNickname,
                    time: reply.createdAt ? formatTimeAgo(reply.createdAt) : '방금 전',
                    content: reply.content,
                    profileImage: reply.authorProfileImage,
                    isHost: reply.hostComment,
                };
            }) || [],
        };
    });
};