import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080'; // Ensure this matches your backend URL

export default function KakaoOAuthRedirect() {
  const { code } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleKakaoCode = async () => {
      if (code) {
        try {
          console.log("Received authorization code:", code);
          // Send the authorization code to your backend
          const response = await axios.get(`${BACKEND_URL}/login/oauth2/code/kakao?code=${code}`);
          const jwtToken = response.headers.authorization; // Assuming JWT is in Authorization header

          if (jwtToken) {
            console.log("Received JWT Token:", jwtToken);
            // TODO: Store JWT token securely (e.g., AsyncStorage)
            // For now, just navigate to the main app
            router.replace('/(tabs)');
          } else {
            Alert.alert("로그인 실패", "백엔드로부터 JWT 토큰을 받지 못했습니다.");
            router.replace('/auth/login'); // Go back to login
          }
        } catch (error) {
          console.error("Backend communication failed:", error);
          Alert.alert("로그인 실패", `백엔드 통신 중 오류 발생: ${error.message}`);
          router.replace('/auth/login'); // Go back to login
        }
      } else {
        Alert.alert("로그인 실패", "카카오 인증 코드를 받지 못했습니다.");
        router.replace('/auth/login'); // Go back to login
      }
    };

    handleKakaoCode();
  }, [code, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>카카오 로그인 처리 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});