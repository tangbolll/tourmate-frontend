import Constants from 'expo-constants';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';

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