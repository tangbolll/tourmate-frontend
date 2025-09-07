import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 공지사항 데이터
const noticesData = [
  {
    id: '0',
    category: '업데이트',
    title: 'TOURMATE가 출시되었습니다🥳',
  },
  // {
  //   id: '1',
  //   category: '가이드',
  //   title: '여행 후 엽서를 만드는 방법을 알아보세요',
  //   date: '2025.09.01',
  // },
  // {
  //   id: '2',
  //   category: '가이드',
  //   title: '동행 찾기, 이렇게 하면 더 잘 매칭돼요',
  //   date: '2025.09.01',
  // },
];

const NoticeScreen = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('전체');

  // 공지사항 카테고리 목록
  const categories = ['전체', '업데이트', '이벤트', '가이드', '정책', '점검'];

  // 카테고리에 따라 공지사항 필터링
  const filteredNotices = noticesData.filter(notice => {
    return activeCategory === '전체' || notice.category === activeCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                activeCategory === category && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory(category)}>
              <Text
                style={[
                  styles.categoryButtonText,
                  activeCategory === category && styles.activeCategoryButtonText,
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.noticeCountContainer}>
        <Text style={styles.noticeCountText}>총 {filteredNotices.length}개</Text>
      </View>

      <ScrollView style={styles.noticeList}>
        {filteredNotices.map(notice => (
          <View key={notice.id} style={styles.noticeItemContainer}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/profile/notice-detail',
                  params: {
                    id: notice.id, // ID만 넘겨 상세 페이지에서 데이터를 찾도록 합니다.
                  },
                })
              }
              style={styles.noticeItem}>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>
                  <Text style={styles.noticeCategory}>[{notice.category}] </Text>
                  {notice.title}
                </Text>
                <Text style={styles.noticeDate}>{notice.date}</Text>
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
  noticeCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  noticeCountText: {
    fontSize: 14,
    color: '#666',
  },
  noticeList: {
    flex: 1,
  },
  noticeItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
  },
  noticeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
    marginBottom: 4,
  },
  noticeCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  noticeDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});

export default NoticeScreen;