import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const DeleteAccountStep3 = () => {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.replace('/auth/login'); // 로그인 화면으로 이동
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>탈퇴가 완료되었습니다.</Text>
        <Text style={styles.message}>투어메이트를 이용해주셔서 감사합니다. 앞으로 해당 계정으로는 투어메이트 이용이 불가합니다.</Text>
        <View style={styles.spacer} /> {/* 하단 버튼 공간 확보 */}
      </View>

      <View style={styles.fixedBottomButton}>
        <TouchableOpacity
          onPress={handleGoToLogin}
          style={styles.registerButton} // registerButton 스타일 사용
          activeOpacity={0.7}
        >
          <Text style={styles.registerButtonText}>로그인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // 흰색 배경 유지
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'black', // 검정 텍스트 유지
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555', // 유지
  },
  // register 화면의 버튼 스타일 복사
  spacer: {
    height: 40, // 하단 버튼 공간 확보
  },
  fixedBottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  registerButton: {
    backgroundColor: 'black', // 검정색 버튼
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DeleteAccountStep3;