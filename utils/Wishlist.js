import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// # 섹션 1: 유틸리티 함수
// ============================================================================

// 기본 API URL을 가져오는 함수 (환경 설정에 따라)
const getBaseURL = () => {
    if (__DEV__) { // 개발 환경
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080'; // 안드로이드 에뮬레이터는 '10.0.2.2'를 로컬호스트로 사용
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV || 'http://localhost:8080';
    } else { // 운영(배포) 환경
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD || 'YOUR_PRODUCTION_API_URL';
    }
};

const API_URL = getBaseURL();