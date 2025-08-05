import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GroupChatList from '../../components/accompany/GroupChatList';
import ChatExitPopup from '../../components/accompany/ChatExitPopup';

// 임시 데이터
const dummyChats = [
  {
    id: '1',
    photo: 'https://via.placeholder.com/50',
    title: '공주 공산성에서 아경 같이 즐겨요',
    message: '여러분 오늘 내로 OKR 업데이트 해주세요~!',
    participants: 5,
    timestamp: '17분 전',
    unreadCount: 3,
  },
  {
    id: '2',
    photo: 'https://via.placeholder.com/50',
    title: '화천 산천어 축제 가서 놀 사람',
    message: '여러분 오늘 내로 OKR 업데이트 해주세요~!',
    participants: 3,
    timestamp: '1일 전',
    unreadCount: 12,
  },
  {
    id: '3',
    photo: 'https://via.placeholder.com/50',
    title: '비단가람은길 자전거 여행',
    message: '여러분 오늘 내로 OKR 업데이트 해주세요~!',
    participants: 3,
    timestamp: '3월 6일',
    unreadCount: 0,
  },
  {
    id: '4',
    photo: 'https://via.placeholder.com/50',
    title: '공주 공산성에서 아경 같이 즐겨요',
    message: '여러분 오늘 내로 OKR 업데이트 해주세요~!',
    participants: 5,
    timestamp: '2025.3.6',
    unreadCount: 0,
  },
];

const GroupChats = () => {
    const router = useRouter();
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);

  const handleChatPress = (item) => {
    // 채팅방 상세 페이지로 이동하는 로직
    // router.push(`accompany/chat/${item.id}`);
    console.log(`${item.title} 채팅방으로 이동`);
  };

  const handleChatSwipeLeft = (item) => {
    setSelectedChat(item);
    setPopupVisible(true);
  };

  const handleExitConfirm = () => {
    // 채팅방 나가기 로직
    console.log(`${selectedChat.title} 채팅방 나가기`);
    setPopupVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        {/* onPress 이벤트 핸들러를 올바르게 수정 */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('accompany')}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>동행 그룹채팅</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 채팅 목록 */}
      <FlatList
        data={dummyChats}
        renderItem={({ item }) => (
          <GroupChatList
            photo={item.photo}
            title={item.title}
            message={item.message}
            participants={item.participants}
            timestamp={item.timestamp}
            unreadCount={item.unreadCount}
            onPress={() => handleChatPress(item)}
            // 스와이프 이벤트 핸들러 prop을 올바르게 전달
            onSwipeLeft={() => handleChatSwipeLeft(item)}
          />
        )}
        keyExtractor={(item) => item.id}
      />
      
      {/* 채팅방 나가기 팝업 */}
      <ChatExitPopup
        isVisible={isPopupVisible}
        onClose={() => setPopupVisible(false)}
        onConfirm={handleExitConfirm}
        chatTitle={selectedChat?.title || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 34,
  },
});

export default GroupChats;