import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GroupChatList from '../../components/accompany/GroupChatList';
import ChatExitPopup from '../../components/accompany/ChatExitPopup';
import * as ChatApi from '../../utils/ChatApi';
import { useAuth } from '../../context/AuthContext';

const GroupChats = () => {
    const router = useRouter();
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { currentUserId } = useAuth();

    // 컴포넌트 마운트 시 채팅방 목록 로드
    useEffect(() => {
      console.log('Component mounted, loading chat rooms...');
      console.log('Current User ID:', currentUserId);
      loadChatRooms();
    }, []);

    // 채팅방 목록 로드 함수
    const loadChatRooms = async () => {
      try {
        setLoading(true);
        const data = await ChatApi.getMyChatRooms(currentUserId);
        console.log('Setting chat rooms:', data);
        setChatRooms(data);
      } catch (error) {
        Alert.alert('오류', '채팅방 목록을 불러오는데 실패했습니다.');
        console.error('loadChatRooms error:', error);
      } finally {
        setLoading(false);
      }
    };

    // 새로고침 함수
    const onRefresh = async () => {
      try {
        setRefreshing(true);
        await loadChatRooms();
      } catch (error) {
        console.error('refresh error:', error);
      } finally {
        setRefreshing(false);
      }
    };

    // 채팅방 클릭 시 상세 정보 가져오고 이동
    const handleChatPress = async (item) => {
        try {
            console.log(`채팅방 클릭: ${item.title} (ID: ${item.id})`);
            
            // chatRoomId만 전달 (Chat 컴포넌트에서 API로 정보 조회)
            const queryParams = new URLSearchParams({
                chatRoomId: item.id,
                currentUserId: currentUserId,
            }).toString();
            
            router.push(`/accompany/Chat?${queryParams}`);
            
        } catch (error) {
            console.error('채팅방 이동 실패:', error);
            Alert.alert('오류', '채팅방으로 이동할 수 없습니다.');
        }
    };

    const handleChatSwipeLeft = (item) => {
      setSelectedChat(item);
      setPopupVisible(true);
    };

    const handleExitConfirm = async () => {
      if (!selectedChat) return;

      try {
        await ChatApi.exitChatRoom(selectedChat.id, currentUserId);
        
        // 성공 시 로컬 상태 업데이트
        setChatRooms(prevChats => 
          prevChats.filter(chat => chat.id !== selectedChat.id)
        );
        
        Alert.alert('알림', '채팅방에서 나왔습니다.');
        console.log(`${selectedChat.title} 채팅방 나가기 완료`);
      } catch (error) {
        Alert.alert('오류', '채팅방 나가기에 실패했습니다.');
        console.error('exit chatroom error:', error);
      } finally {
        setPopupVisible(false);
        setSelectedChat(null);
      }
    };

    // 로딩 중일 때 표시할 컴포넌트
    if (loading) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('accompany')}
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>동행 그룹채팅</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.loadingContainer}>
            <Text>채팅방 목록을 불러오는 중...</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
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
          data={chatRooms}
          renderItem={({ item }) => {

            return (
              <GroupChatList
                photo={item.photo}
                title={item.title}
                message={item.message}
                participants={item.participants}
                timestamp={item.timestamp}
                unreadCount={item.unreadCount}
                onPress={() => handleChatPress(item)}
                onSwipeLeft={() => handleChatSwipeLeft(item)}
              />
            );
          }}
          keyExtractor={(item, index) => {
            const key = item.id ? item.id.toString() : index.toString();
            console.log('KeyExtractor:', key);
            return key;
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>참여 중인 채팅방이 없습니다.</Text>
            </View>
          }
          // 디버깅을 위해 추가
          style={{ flex: 1 }}
          contentContainerStyle={chatRooms.length === 0 ? { flex: 1 } : undefined}
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 16,
      color: '#888',
    },
});

export default GroupChats;