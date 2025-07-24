import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const getBaseURL = () => {
    if (__DEV__) { // 개발 환경
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080'; // 안드로이드 에뮬레이터는 '10.0.2.2'를 로컬호스트로 사용
        }
        // iOS 시뮬레이터, 웹, 또는 안드로이드 실기기 개발 시 app.json의 DEV URL 사용
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else { // 운영(배포) 환경
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};

const API_URL = getBaseURL();

const ToChatroom = ({ postId, currentUserId = 2, style }) => {
    const router = useRouter();
    const [chatLoading, setChatLoading] = useState(false);

    // 🌐 채팅방 생성/조회 후 이동
    const handlePress = async () => {
        if (chatLoading || !postId) return;
        
        console.log('그룹채팅 버튼 클릭 - postId:', postId);
        setChatLoading(true);
        
        try {
            // 1. 먼저 채팅방이 있는지 확인
            const checkUrl = `${API_URL}/api/accompany/${postId}/chatroom`;
            console.log('🌐 채팅방 확인 API 호출:', checkUrl);
            
            let chatRoomId = null;
            
            try {
                const checkResponse = await fetch(checkUrl);
                if (checkResponse.ok) {
                    const roomData = await checkResponse.json();
                    chatRoomId = roomData.id;
                    console.log('✅ 기존 채팅방 발견:', roomData);
                } else if (checkResponse.status === 404) {
                    console.log('📝 채팅방이 없음, 새로 생성 필요');
                } else {
                    throw new Error(`채팅방 확인 실패: ${checkResponse.status}`);
                }
            } catch (error) {
                console.log('📝 채팅방 확인 중 오류, 새로 생성 시도');
            }
            
            // 2. 채팅방이 없으면 자동으로 생성됨 (백엔드에서 처리)
            if (!chatRoomId) {
                console.log('🔄 채팅방 자동 생성 요청');
                const createResponse = await fetch(checkUrl);
                
                if (createResponse.ok) {
                    const newRoom = await createResponse.json();
                    chatRoomId = newRoom.id;
                    console.log('✅ 새 채팅방 생성/조회 완료:', newRoom);
                } else {
                    throw new Error(`채팅방 생성 실패: ${createResponse.status}`);
                }
            }
            
            // 3. 채팅방으로 이동
            if (chatRoomId) {
                console.log('🚀 채팅방으로 이동: roomId =', chatRoomId);
                router.push(`/accompany/Chat?postId=${postId}&roomId=${chatRoomId}`);
            } else {
                throw new Error('채팅방 ID를 가져올 수 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 채팅방 처리 오류:', error);
            Alert.alert('오류', '채팅방 연결에 실패했습니다.\n다시 시도해주세요.');
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <TouchableOpacity 
            style={[styles.container, chatLoading && styles.disabledContainer, style]} 
            onPress={handlePress}
            disabled={chatLoading}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                    name={chatLoading ? "loading" : "chat"} 
                    size={14} 
                    color={chatLoading ? "#999" : "black"} 
                />
            </View>
            <Text style={[styles.text, chatLoading && styles.disabledText]}>
                {chatLoading ? " 연결중..." : " 그룹채팅"}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E8E8E8',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    disabledContainer: {
        backgroundColor: '#F0F0F0',
    },
    iconContainer: {
        // 아이콘 컨테이너 스타일 (필요시 추가)
    },
    text: {
        fontSize: 12,
        fontWeight: '500',
        color: '#000000',
        textAlign: 'center',
    },
    disabledText: {
        color: '#999999',
    },
});

export default ToChatroom;