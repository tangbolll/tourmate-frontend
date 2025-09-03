// axiosInterceptor.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { getBaseURL } from './MyTourApi';
import { Alert } from 'react-native';

// 전역 axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: getBaseURL(),
});

let isLoggedOut = false; // 이미 로그아웃 처리되었는지 확인하는 플래그

const handleAuthError = async () => {
  // 이미 로그아웃 처리되었으면 바로 리턴
  if (isLoggedOut) {
    return;
  }
  
  // 플래그를 먼저 설정 (동기적으로)
  isLoggedOut = true;
  
  console.log('Handling auth error - clearing token and redirecting');
  
  try {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('userId');
    
    if (Constants.platform?.web) {
      window.alert('세션 만료: 로그인 세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
      router.replace('/auth/login');
    } else {
      Alert.alert(
        '세션 만료',
        '로그인 세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.',
        [{
            text: '확인',
            onPress: () => {
                router.replace('/auth/login');
            }
        }]
      );
    }
  } catch (e) {
    console.error('Error clearing AsyncStorage:', e);
  }
};

const setupAxiosInterceptor = () => {
  console.log("API_URL inside axiosInterceptor:", getBaseURL());

  apiClient.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    response => response,
    async error => {
      const status = error.response?.status;

      // 401, 403 에러이고 아직 로그아웃 처리되지 않았을 때만
      if ((status === 401 || status === 403) && !isLoggedOut) {
        console.log(`Error ${status} received. Processing logout...`);
        await handleAuthError();
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};

// 로그인 성공 시 플래그 리셋하는 함수 (필요시 export해서 사용)
export const resetAuthState = () => {
  isLoggedOut = false;
};

// 인터셉터 설정 후 인스턴스 반환
setupAxiosInterceptor();

export default apiClient;