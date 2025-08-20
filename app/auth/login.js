
import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login as kakaoLogin } from '@react-native-kakao/user';

const LoginScreen = () => {

  const handleLogin = async () => {
    try {
      const token = await kakaoLogin();
      console.log("Kakao Login Success:", token);
      Alert.alert("로그인 성공", `액세스 토큰: ${token.accessToken}`);
      // TODO: Send this token to your backend for verification and get a JWT

    } catch (error) {
      console.error("Kakao Login Failed:", error);
      Alert.alert("로그인 실패", "카카오 로그인에 실패했습니다.");
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
