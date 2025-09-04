import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { getBaseURL } from './apiConfig';
import { Alert } from 'react-native';

const setupAxiosInterceptor = () => {
  const api = axios.create({});

  const API_BASE_URL = getBaseURL();
  console.log("API_URL inside axiosInterceptor:", API_BASE_URL);
  api.defaults.baseURL = API_BASE_URL;

  api.interceptors.request.use(
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

  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      const status = error.response?.status;

      if (status === 401 || status === 403) {
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

      return Promise.reject(error);
    }
  );

  return api;
};

export default setupAxiosInterceptor;