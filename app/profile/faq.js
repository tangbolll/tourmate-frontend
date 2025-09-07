import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const faqsData = [
  {
    id: '1',
    category: '계정',
    question: '비밀번호를 잊어버렸어요. 어떻게 재설정하나요?',
    date: '2025.09.07',
  },
  {
    id: '2',
    category: '앱 기능',
    question: '엽서는 어떻게 만들고 공유할 수 있나요?',
    date: '2025.09.07',
  },
  {
    id: '3',
    category: '계정',
    question: '회원가입은 어떻게 하나요?',
    date: '2025.09.07',
  },
  {
    id: '4',
    category: '앱 기능',
    question: 'TourMate는 어떤 서비스인가요?',
    date: '2025.09.07',
  },
];

const FAQScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');

  const categories = ['전체', '계정', '앱 기능', '오류 및 문의'];

  const filteredFaqs = faqsData.filter(faq => {
    const matchesCategory = activeCategory === '전체' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="FAQ 앱 사용과 관련된 질문을 검색해보세요."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.categoryContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, activeCategory === category && styles.activeCategoryButton]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[styles.categoryButtonText, activeCategory === category && styles.activeCategoryButtonText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.faqList}>
        {filteredFaqs.map(faq => (
          <View key={faq.id} style={styles.faqItemContainer}>
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/profile/faq-detail',
                params: {
                  id: faq.id, // id만 넘기도록 수정
                },
              })}
              style={styles.faqQuestionHeader}
            >
              <View style={styles.questionContent}>
                <Text style={styles.faqQuestion}>
                  <Text style={styles.faqCategory}>[{faq.category}] </Text>
                  {faq.question}
                </Text>
                <Text style={styles.faqDate}>{faq.date}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginRight: 4,
    marginBottom: 8,
  },
  activeCategoryButton: {
    backgroundColor: 'transparent',
  },
  categoryButtonText: {
    color: '#333',
    fontSize: 14,
  },
  activeCategoryButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },
  faqList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  faqItemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionContent: {
    flex: 1,
    marginRight: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  faqCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  faqDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});

export default FAQScreen;