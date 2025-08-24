import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8080';

export const fetchUserProfileApi = async (userId) => {
    try {
        const token = await AsyncStorage.getItem('jwtToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${API_URL}/api/user/${userId}`, { headers });
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