import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// 공지사항 데이터를 상세 화면에도 복사해서 사용합니다.
const noticesData = [
  {
    id: '1',
    category: '업데이트',
    title: '여행 일정 자동 추천 기능이 추가되었어요!',
    content: '사용자의 여행 기록과 선호도를 분석하여 맞춤형 여행 일정을 자동으로 추천해 주는 기능이 추가되었습니다.',
    date: '2025.09.01',
  },
  {
    id: '2',
    category: '이벤트',
    title: '여름 휴가 엽서 만들기 챌린지 – 지금 참여하세요!',
    content: '여름 휴가 여행 기록을 엽서로 만들고 공유하여 경품을 받을 수 있는 챌린지 이벤트가 시작되었습니다.',
    date: '2025.09.01',
  },
  {
    id: '3',
    category: '점검',
    title: '8월 3일(토) 새벽 2시~4시 서버 점검 예정',
    content: '서비스 안정화를 위한 정기 서버 점검이 예정되어 있습니다. 점검 시간 동안은 서비스 이용이 일시적으로 제한됩니다. 양해 부탁드립니다.',
    date: '2025.09.01',
  },
  {
    id: '4',
    category: '가이드',
    title: '여행 후 엽서를 만드는 방법을 알아보세요',
    content: '앱 내에서 여행 엽서를 쉽게 만드는 방법에 대한 가이드가 업데이트되었습니다. 사진과 텍스트를 활용해 추억을 기록해 보세요.',
    date: '2025.09.01',
  },
  {
    id: '5',
    category: '정책',
    title: '개인정보 처리방침 개정 (시행일: 2025.08.10)',
    content: '개인정보 처리방침이 일부 개정되었습니다. 자세한 내용은 공지사항 전문을 통해 확인해 주세요.',
    date: '2025.09.01',
  },
  {
    id: '6',
    category: '업데이트',
    title: '일시적인 채팅 연결 오류가 해결되었습니다',
    content: '일부 사용자에게 발생했던 채팅 연결 오류 문제가 해결되어 정상적으로 서비스 이용이 가능합니다.',
    date: '2025.09.01',
  },
  {
    id: '7',
    category: '가이드',
    title: '동행 찾기, 이렇게 하면 더 잘 매칭돼요',
    content: '여행 동반자를 더 효과적으로 찾는 팁과 가이드가 추가되었습니다. 프로필을 자세히 작성하고, 원하는 여행 스타일을 명확히 설정해 보세요.',
    date: '2025.09.01',
  },
  {
    id: '8',
    category: '점검',
    title: '8월 17일(토) 새벽 2시~4시 긴급 서버 점검 예정',
    content: '서비스 안정화를 위한 긴급 서버 점검이 예정되어 있습니다. 점검 시간 동안은 서비스 이용이 일시적으로 제한됩니다. 양해 부탁드립니다.',
    date: '2025.08.15',
  },
];

const NoticeDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // ID로 해당 공지사항 데이터를 찾습니다.
  const noticeItem = noticesData.find(item => item.id === id);

  // 데이터가 없을 경우 처리
  if (!noticeItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>공지사항</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>공지사항을 찾을 수 없습니다.</Text>
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
        <Text style={styles.headerTitle}>공지사항</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.noticeHeader}>
          <Text style={styles.noticeTitle}>
            <Text style={styles.noticeCategory}>[{noticeItem.category}] </Text>
            {noticeItem.title}
          </Text>
          <Text style={styles.noticeDate}>{noticeItem.date}</Text>
        </View>

        <View style={styles.noticeContentContainer}>
          <Text style={styles.noticeContent}>{noticeItem.content}</Text>
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
  noticeHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 16,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  noticeCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  noticeDate: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  noticeContentContainer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  noticeContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
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

export default NoticeDetailScreen;