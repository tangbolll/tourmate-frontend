import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// FAQ 데이터를 상세 화면에도 똑같이 복사해서 사용합니다.
const faqsData = [
  {
    id: '1',
    category: '계정',
    question: '비밀번호를 잊어버렸어요. 어떻게 재설정하나요?',
    answer: '로그인 화면에서 "비밀번호 찾기" 기능을 통해 재설정할 수 있습니다. (현재는 구현되지 않았습니다.)',
    date: '2025.09.01',
  },
  {
    id: '2',
    category: '앱 기능',
    question: '엽서는 어떻게 만들고 공유할 수 있나요?',
    answer: '여행 엽서는 사용자가 자신의 여행 경험을 사진과 글로 기록하고 공유하는 기능입니다.',
    date: '2025.09.01',
  },
  {
    id: '3',
    category: '오류 및 문의',
    question: '위치 정보가 제대로 반영되지 않아요.',
    answer: '위치 서비스 설정이 올바르게 되어 있는지 확인해 주세요. (설정 > 서비스 설정 > 위치 서비스)',
    date: '2025.09.01',
  },
  {
    id: '4',
    category: '계정',
    question: '회원가입은 어떻게 하나요?',
    answer: '로그인 화면에서 "일반 회원가입" 버튼을 통해 이메일과 비밀번호로 가입할 수 있습니다.',
    date: '2025.09.01',
  },
  {
    id: '5',
    category: '앱 기능',
    question: 'TourMate는 어떤 서비스인가요?',
    answer: 'TourMate는 여행 동반자를 찾고, 여행 일정을 공유하며, 여행 기록을 남길 수 있는 서비스입니다.',
    date: '2025.09.01',
  },
];

const FAQDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // faqsData 배열에서 ID가 일치하는 항목을 찾습니다.
  const faqItem = faqsData.find(item => item.id === id);

  // 데이터가 없을 경우 처리
  if (!faqItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>데이터를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.faqHeader}>
          {/* FAQ 목록 화면과 동일하게 카테고리와 질문을 합치고 아래에 날짜를 표시합니다. */}
          <Text style={styles.faqQuestion}>
            <Text style={styles.faqCategory}>[{faqItem.category}] </Text>
            {faqItem.question}
          </Text>
          <Text style={styles.faqDate}>{faqItem.date}</Text>
        </View>

        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{faqItem.answer}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  faqHeader: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  faqCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  faqDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  faqAnswerContainer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default FAQDetailScreen;