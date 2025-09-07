import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// 공지사항 데이터를 상세 화면에도 복사해서 사용합니다.
const noticesData = [
  {
    id: '0',
    category: '업데이트',
    title: 'TOURMATE 정식 출시🥳',
    content: '드디어 TOURMATE가 세상에 나왔습니다! ✨\n\n이제 여행 동반자를 손쉽게 찾고, 여행 일정을 공유하며, 특별한 순간을 기록할 수 있어요. 혼자 여행하든, 친구와 함께하든, TOURMATE와 함께라면 더 즐겁고 의미 있는 여행이 될 거예요.\n\n많은 분들의 의견과 아이디어를 반영해 조금씩 다듬어왔고, 앞으로도 꾸준히 발전해 나가겠습니다. 여러분의 피드백은 저희에게 큰 힘이 됩니다. 💪\n\n\n🔑 TOURMATE는 여행과 개발을 사랑하는 다섯 명이 함께 머리를 맞대어 만든 결과물이에요.\n\n👩‍💻 만든 사람들의 한마디\n- 민수: "떠나요 둘이서"\n- 서연: "모든 걸 훌훌 버리고"\n- 윤서: "제주도 푸른 밤"\n- 태연: "여러분들은 제 두번째 가족입니다, 거부하지 마세요. 끝까지 고생 너무 많으셨고 저와 함께 해주셔서 감사합니다!"\n- 휘경: "얘들아 5달 동안 수고했고 나중에 웃으면서 보자"\n\nTOURMATE와 함께 새로운 여행을 떠나보세요!'
  },
  {
    id: '1',
    category: '가이드',
    title: '여행 후 엽서를 만드는 방법을 알아보세요',
    content: '앱 내에서 여행 엽서를 쉽게 만드는 방법에 대한 가이드가 업데이트되었습니다. 사진과 텍스트를 활용해 추억을 기록해 보세요.',
    date: '2025.09.01',
  },
  {
    id: '2',
    category: '가이드',
    title: '동행 찾기, 이렇게 하면 더 잘 매칭돼요',
    content: '여행 동반자를 더 효과적으로 찾는 팁과 가이드가 추가되었습니다. 프로필을 자세히 작성하고, 원하는 여행 스타일을 명확히 설정해 보세요.',
    date: '2025.09.01',
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
      <View style={styles.container}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
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