import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext'; // 절대 경로 임포트 사용

const DeleteAccountStep2 = () => {
  const router = useRouter();
  const {signOut} = useAuth(); // <-- 여기로 이동 (올바른 위치)

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      const confirmDelete = confirm('정말 탈퇴하시겠습니까?\n\n더욱 행복한 여행을 위해\n투어메이트가 더 노력하겠습니다.');
      if (confirmDelete) {
        console.log('실제 회원 탈퇴 로직 실행 (임시 메시지 - 웹)');
        signOut(); // <-- 여기서 호출
        router.replace('/auth/login');
      } else {
        console.log('회원 탈퇴 취소 (웹)');
      }
    } else {
      // 모바일 환경 (Alert.alert 사용)
      Alert.alert(
        '정말 탈퇴하시겠습니까?', // 제목
        '더욱 행복한 여행을 위해\n투어메이트가 더 노력하겠습니다.', // 메시지
        [
          {
            text: '아니오', // 첫 번째 버튼
            onPress: () => console.log('회원 탈퇴 취소'),
            style: 'cancel',
          },
          {
            text: '탈퇴', // 두 번째 버튼
            onPress: async () => {
              console.log('실제 회원 탈퇴 로직 실행 (임시 메시지 - 모바일)');
              // 실제 탈퇴 로직은 여기에 들어갈 것임
              signOut(); // <-- 여기서 호출
              router.replace('/auth/login'); // 로그인 화면으로 리다이렉션
            },
            style: 'destructive', // 경고성 버튼 스타일
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계정 탈퇴</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for spacing */}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>탈퇴 전 알아야 할 내용이 있어요.</Text>

        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>삭제 및 이용제한 되는 항목</Text>
          <Text style={styles.listItem}>- 개인정보 삭제</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>삭제되지 않고 노출되는 항목</Text>
          <Text style={styles.listItem}>- 등록한 게시물 (동행 피드, 여행엽서 등)</Text>
          <Text style={styles.listItem}>- 문의 내용 및 답변</Text>
        </View>

        <View style={styles.importantInfoBox}>
          <Text style={styles.sectionTitle}>꼭 확인해주세요 !</Text>
          <Text style={styles.paragraph}>
            탈퇴 시 투어메이트 내 모든 서비스에서 탈퇴 처리됩니다. 탈퇴 시 계정과 관련된 정보는 복구가 불가능합니다.
          </Text>
          <Text style={styles.paragraph}>
            문의 내역, 동행 피드, 여행엽서 등의 게시물은 그대로 유지되오니 삭제를 원하시면 반드시 탈퇴 전에 삭제해주세요. 탈퇴 후에는 삭제가 불가능합니다.
          </Text>
        </View>

        <View style={styles.spacer} /> {/* 하단 버튼 공간 확보 */}
      </ScrollView>

      <View style={styles.fixedBottomButton}>
        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={styles.registerButton} // registerButton 스타일 사용
          activeOpacity={0.7}
        >
          <Text style={styles.registerButtonText}>계정 탈퇴하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // 흰색 배경 유지
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // 밝은 테두리 유지
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black', // 검정 텍스트 유지
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black', // 검정 텍스트 유지
  },
  section: { // 기존 section 스타일은 유지 (다른 곳에서 사용될 수 있으므로)
    marginBottom: 20,
  },
  infoBox: { // 새로 추가할 박스 스타일
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#F9F9F9', // 박스 내부 배경색 (약간 회색)
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black', // 검정 텍스트 유지
  },
  listItem: {
    fontSize: 14,
    marginBottom: 3,
    color: '#555', // 유지
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
    color: '#555', // 유지
  },
  importantInfoBox: { // 꼭 확인해주세요! 섹션 스타일
    paddingHorizontal: 15, // 양옆 여백 추가
    marginBottom: 20,
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

export default DeleteAccountStep2;