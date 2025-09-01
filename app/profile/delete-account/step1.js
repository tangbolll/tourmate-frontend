import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const reasons = [
  '앱 사용이 불편해요.',
  '정보 탐색이 어려워요.',
  '광고성 알림이 너무 많이 와요.',
  '쓰지 않는 앱이에요.',
  '재가입할 예정이에요.',
  '기타',
];

const DeleteAccountStep1 = () => {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState(null);
  const [otherReason, setOtherReason] = useState('');

  const handleNext = () => {
    // TODO: 선택된 사유를 백엔드로 전송하는 로직 추가
    // router.push('/profile/delete-account/step2');
    console.log('Selected Reason:', selectedReason);
    console.log('Other Reason:', otherReason);
    router.push('/profile/delete-account/step2'); // 다음 단계로 이동
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
        <Text style={styles.question}>어떤 이유로 떠나시나요?</Text>
        {reasons.map((reason, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.reasonOption,
              selectedReason === reason && styles.reasonOptionSelected,
            ]}
            onPress={() => setSelectedReason(reason)}
          >
            <Ionicons
              name={selectedReason === reason ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={selectedReason === reason ? '#555555' : '#AAAAAA'} // 선택 여부에 따라 색상 변경 (흑백 톤)
            />
            <Text
              style={[
                styles.reasonText,
                selectedReason === reason && styles.reasonTextSelected,
              ]}
            >
              {reason}
            </Text>
          </TouchableOpacity>
        ))}
        {selectedReason === '기타' && (
          <TextInput
            style={styles.otherReasonInput}
            placeholder="탈퇴 사유를 입력해주세요."
            placeholderTextColor="gray"
            multiline
            numberOfLines={4}
            value={otherReason}
            onChangeText={setOtherReason}
          />
        )}
        <View style={styles.spacer} /> {/* 하단 버튼 공간 확보 */}
      </ScrollView>

      <View style={styles.fixedBottomButton}>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.registerButton, (!selectedReason || (selectedReason === '기타' && !otherReason.trim())) && styles.disabledButton]}
          disabled={!selectedReason || (selectedReason === '기타' && !otherReason.trim())}
          activeOpacity={0.7}
        >
          <Text style={[styles.registerButtonText, (!selectedReason || (selectedReason === '기타' && !otherReason.trim())) && styles.disabledButtonText]}>다음</Text>
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
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black', // 검정 텍스트 유지
  },
  reasonOption: {
    flexDirection: 'row', // 아이콘과 텍스트를 나란히
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0', // 밝은 테두리 유지
    borderRadius: 8,
    marginBottom: 10,
  },
  reasonOptionSelected: {
    borderColor: '#AAAAAA', // 선택 시 테두리 색상 (회색)
    backgroundColor: '#F0F0F0', // 선택 시 배경색 (밝은 회색)
  },
  reasonText: {
    fontSize: 16,
    color: 'black', // 검정 텍스트 유지
    marginLeft: 10, // 아이콘과의 간격
  },
  reasonTextSelected: {
    fontWeight: 'bold',
    color: '#555555', // 선택 시 텍스트 색상 (진한 회색)
  },
  otherReasonInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0', // 밝은 테두리 유지
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    color: 'black', // 검정 텍스트 유지
    placeholderTextColor: 'gray', // 플레이스홀더 색상 유지
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
  disabledButton: {
    backgroundColor: '#B1B1B1', // 비활성화 시 회색
  },
  disabledButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DeleteAccountStep1;