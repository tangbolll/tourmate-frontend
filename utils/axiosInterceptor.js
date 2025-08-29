import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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

      // If the error is 401 Unauthorized and it's not a retry request
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Mark as retry to prevent infinite loops

        console.log('401 Unauthorized received. Clearing token and redirecting to login.');
        
        try {
          await AsyncStorage.removeItem('jwtToken');
          await AsyncStorage.removeItem('userId');
          // Optionally, clear other user-related data
        } catch (e) {
          console.error('Error clearing AsyncStorage on 401:', e);
        }

        // Redirect to login screen
        router.replace('/auth/login');

        return Promise.reject(error); // Reject the promise to propagate the error
      }

      return Promise.reject(error); // For other errors, just reject
    }
  );
};

export default setupAxiosInterceptor;
