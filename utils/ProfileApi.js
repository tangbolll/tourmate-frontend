import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const API_URL = 'http://localhost:8080';

export const fetchUserProfileApi = async (userId) => {
    try {
        const token = await AsyncStorage.getItem('jwtToken'); // Get token
        const headers = token ? { Authorization: `Bearer ${token}` } : {}; // Create headers

        const response = await axios.get(`${API_URL}/api/user/${userId}`, { headers }); // Pass headers
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};
