import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

const setupAxiosInterceptor = () => {
  axios.interceptors.request.use(
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

  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      const status = error.response?.status;

      // 💡 401 또는 403 에러 발생 시 처리
      if (status === 401 || status === 403) {
        // 이미 재시도한 요청이면 무한 루프 방지
        if (originalRequest._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        console.log(`Error ${status} received. Clearing token and redirecting.`);

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
        
        return Promise.reject(error);
      }

      // 다른 에러는 그대로 전파
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptor;