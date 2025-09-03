import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import setupAxiosInterceptor from '../../utils/axiosInterceptor';

const InquiryScreen = () => {
  const router = useRouter();
  const api = setupAxiosInterceptor();
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('질문 유형을 선택해주세요');
  const [inquiryContent, setInquiryContent] = useState('');

  const inquiryTypes = [
    '계정 / 로그인 관련',
    '내 여행 관련',
    '동행 기능 관련',
    '엽서 / 기록 기능 관련',
    '결제 / 구독 관련',
    '앱 오류 / 이용 불편',
    '서비스 제안 / 피드백',
    '기타 문의',
  ];

  const handleSave = async () => {
    if (selectedType === '질문 유형을 선택해주세요' || inquiryContent.trim() === '') {
      Alert.alert('알림', '문의 유형, 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      console.log("API instance base URL:", api.defaults.baseURL);
      await api.post('/api/inquiries', {
          type: selectedType,
          content: inquiryContent
      });
      Alert.alert('성공', '문의사항이 성공적으로 접수되었습니다!');
      setSelectedType('질문 유형을 선택해주세요');
      setInquiryContent('');
      router.push('/profile/inquiry-history');
    } catch (error) {
      console.error('Error saving inquiry:', error);
      Alert.alert('오류', '문의사항 접수 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>고객센터 문의</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* '내 문의 내역' 버튼을 최상단에 배치하고 '문의사항 접수'와 같은 스타일 적용 */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/profile/inquiry-history')}
        >
          <Text style={styles.sectionTitle}>내 문의 내역 {'>'}</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>문의사항 접수</Text>

        <Text style={styles.submitDescription}>
          앱 이용 중 궁금한 점이나 불편한 점이 있으신가요?
          {"\n"}무엇이든 편하게 문의해 주세요. 담당자가 빠르게 답변드릴게요
        </Text>

        {/* 질문 유형 선택 */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
          >
            <Text
              style={[ 
                styles.dropdownText,
                selectedType === '질문 유형을 선택해주세요' && styles.placeholderText,
              ]}
            >
              {selectedType}
            </Text>
            <Ionicons
              name={isTypeDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={20}
              color="#9E9E9E"
            />
          </TouchableOpacity>
          {isTypeDropdownOpen && (
            <View style={styles.dropdownMenu}>
              {inquiryTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedType(type);
                    setIsTypeDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 문의 내용 입력 */}
        <View style={styles.inquiryInputContainer}>
          <TextInput
            style={styles.inquiryInput}
            multiline
            placeholder="궁금한 내용을 자유롭게 적어주세요."
            value={inquiryContent}
            onChangeText={setInquiryContent}
          />
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  submitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 2, // 드롭다운 컨테이너에 높은 z-index 설정
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#9E9E9E',
  },
  dropdownMenu: {
    backgroundColor: 'white', // 배경색을 흰색으로 변경
    borderRadius: 8,
    marginTop: 8,
    position: 'absolute', // absolute 포지션을 사용하여 다른 요소 위에 겹치도록 함
    top: '100%', // 드롭다운 버튼 바로 아래에 위치
    left: 0,
    right: 0,
    zIndex: 3, // 메뉴 자체에 더 높은 z-index 설정
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  inquiryInputContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    zIndex: 1, // 드롭다운보다 낮은 z-index 설정
  },
  
  inquiryInput: {
    minHeight: 400, 
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InquiryScreen;
