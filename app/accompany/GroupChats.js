import React, { useState, useEffect } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GroupChatList from '../../components/accompany/GroupChatList';
import ChatExitPopup from '../../components/accompany/ChatExitPopup';
import * as ChatApi from '../../utils/ChatApi';
import { useAuth } from '../../context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const GroupChats = () => {
    const router = useRouter();
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { currentUserId, user, loading: authLoading } = useAuth(); // ✅ authLoading 추가

    // ✅ 인증 상태 로그 추가
    useEffect(() => {
        console.log('📱 GroupChats - 인증 상태 변경');
        console.log('📱 authLoading:', authLoading);
        console.log('📱 currentUserId:', currentUserId);
        console.log('📱 user:', user);
    }, [authLoading, currentUserId, user]);

    // ✅ 인증 완료 후 채팅방 로드
    useEffect(() => {
        console.log('📱 GroupChats - useEffect 트리거');
        console.log('📱 authLoading:', authLoading);
        console.log('📱 currentUserId:', currentUserId);
        
        // 인증 로딩이 완료되고 currentUserId가 있을 때만 실행
        if (!authLoading && currentUserId) {
            console.log('📱✅ 조건 만족 - 채팅방 로드 시작');
            loadChatRooms();
        } else if (!authLoading && !currentUserId) {
            console.log('📱❌ 인증되지 않은 사용자 - 로그인 페이지로 이동');
            // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
            Alert.alert(
                '로그인 필요', 
                '로그인이 필요한 서비스입니다.',
                [
                    {
                        text: '확인',
                        onPress: () => router.push('/auth/login')
                    }
                ]
            );
        } else {
            console.log('📱⏳ 인증 로딩 중...');
        }
    }, [authLoading, currentUserId]); // ✅ authLoading 의존성 추가

    // 채팅방 목록 로드 함수
    const loadChatRooms = async () => {
        try {
            console.log('📱 loadChatRooms 시작');
            console.log('📱 currentUserId 확인:', currentUserId);
            console.log('📱 currentUserId 타입:', typeof currentUserId);
            
            if (!currentUserId) {
                throw new Error('사용자 ID가 없습니다');
            }

            setLoading(true);
            const data = await ChatApi.getMyChatRooms(currentUserId);
            console.log('📱✅ 채팅방 데이터 로드 성공:', data);
            setChatRooms(data || []);
        } catch (error) {
            console.error('📱❌ loadChatRooms 에러:', error);
            
            // ✅ 403 에러 특별 처리
            if (error.message.includes('403')) {
                console.log('📱🚫 403 Forbidden 에러 감지');
                Alert.alert(
                    '권한 오류', 
                    '채팅방에 접근할 권한이 없습니다. 로그인 상태를 확인해주세요.',
                    [
                        {
                            text: '다시 로그인',
                            onPress: () => {
                                // 강제 로그아웃 후 로그인 페이지로
                                router.push('/auth/login');
                            }
                        },
                        {
                            text: '취소',
                            style: 'cancel'
                        }
                    ]
                );
            } else {
                Alert.alert('오류', '채팅방 목록을 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 새로고침 함수
    const onRefresh = async () => {
        try {
            console.log('📱 새로고침 시작');
            setRefreshing(true);
            await loadChatRooms();
        } catch (error) {
            console.error('📱❌ refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // 채팅방 클릭 시 상세 정보 가져오고 이동
    const handleChatPress = async (item) => {
        try {
            console.log(`📱 채팅방 클릭: ${item.title} (ID: ${item.id})`);
            
            // chatRoomId만 전달 (Chat 컴포넌트에서 API로 정보 조회)
            const queryParams = new URLSearchParams({
                chatRoomId: item.id,
                currentUserId: currentUserId,
            }).toString();
            
            router.push(`/accompany/Chat?${queryParams}`);
            
        } catch (error) {
            console.error('📱❌ 채팅방 이동 실패:', error);
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
            console.log(`📱✅ ${selectedChat.title} 채팅방 나가기 완료`);
        } catch (error) {
            Alert.alert('오류', '채팅방 나가기에 실패했습니다.');
            console.error('📱❌ exit chatroom error:', error);
        } finally {
            setPopupVisible(false);
            setSelectedChat(null);
        }
    };

    // ✅ 인증 로딩 중일 때 표시할 컴포넌트
    if (authLoading) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
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
                    <Text>인증 확인 중...</Text>
                </View>
            </SafeAreaView>
            </GestureHandlerRootView>
        );
    }

    // ✅ 인증되지 않은 사용자
    if (!currentUserId) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
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
                    <Text>로그인이 필요합니다.</Text>
                </View>
            </SafeAreaView>
            </GestureHandlerRootView>
        );
    }

    // 로딩 중일 때 표시할 컴포넌트
    if (loading) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
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
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                        item={item} // 👈 이렇게 item 객체 하나만 전달합니다.
                        onPress={handleChatPress}
                        onSwipeLeft={handleChatSwipeLeft}
                        />
                    );
                }}
                keyExtractor={(item, index) => {
                    const key = item.id ? item.id.toString() : index.toString();
                    return key;
                }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>참여 중인 채팅방이 없습니다.</Text>
                    </View>
                }
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
        </GestureHandlerRootView>
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