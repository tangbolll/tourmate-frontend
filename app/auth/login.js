
import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import axios from 'axios';

const KAKAO_CLIENT_ID = '258d62eaabf3e1213e2b974f01185d44';
const KAKAO_REDIRECT_URI = Linking.createURL('/auth/kakao-redirect', { scheme: 'http', port: 8081 }); // Use Linking.createURL for deep linking
const BACKEND_URL = 'http://localhost:8080'; // Your backend URL

const LoginScreen = () => {

  const handleLogin = async () => {
    try {
      // 1. Construct the Kakao OAuth URL
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;

      // 2. Open the URL in a web browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(
        kakaoAuthUrl,
        KAKAO_REDIRECT_URI
      );

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          console.log("Authorization Code:", code);
          // 3. Send the authorization code to your backend
          const response = await axios.get(`${BACKEND_URL}/login/oauth2/code/kakao?code=${code}`);
          const jwtToken = response.headers.authorization; // Assuming JWT is in Authorization header

          if (jwtToken) {
            console.log("JWT Token:", jwtToken);
            Alert.alert("로그인 성공", `JWT 토큰: ${jwtToken}`);
            // TODO: Store JWT token securely (e.g., AsyncStorage) and navigate to main app
          } else {
            Alert.alert("로그인 실패", "백엔드로부터 JWT 토큰을 받지 못했습니다.");
          }
        } else {
          Alert.alert("로그인 실패", "카카오로부터 인증 코드를 받지 못했습니다.");
        }
      } else if (result.type === 'cancel') {
        Alert.alert("로그인 취소", "카카오 로그인이 취소되었습니다.");
      } else {
        Alert.alert("로그인 실패", "카카오 로그인에 실패했습니다.");
      }

    } catch (error) {
      console.error("Kakao Login Failed:", error);
      Alert.alert("로그인 실패", `카카오 로그인 중 오류 발생: ${error.message}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-3xl font-bold mb-10">TourMate</Text>
        <Text className="text-lg text-gray-600 mb-20">소셜 로그인으로 간편하게 시작하세요</Text>
        
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-[#FEE500] w-full py-3 rounded-md flex-row justify-center items-center"
        >
          <Image 
            source={{ uri: 'https://www.kakaocorp.com/page/favicon.ico' }} 
            className="w-6 h-6 mr-2"
          />
          <Text className="text-black text-lg font-semibold">카카오로 로그인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
