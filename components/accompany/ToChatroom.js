// ToChatroom 컴포넌트에 디버깅 로그 추가

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ToChatroom = ({ 
    postId, 
    currentUserId = 2, 
    location, 
    participants, 
    maxParticipants, 
    style,
    status // props로 받은 상태
}) => {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [canShow, setCanShow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('🔍 ToChatroom 컴포넌트 props:', {
            postId,
            currentUserId,
            status
        });
        checkShouldShow();
    }, [postId, currentUserId, status]);

    const checkShouldShow = async () => {
        console.log('🔍 checkShouldShow 시작');
        
        if (!postId || !currentUserId) {
            console.log('❌ postId 또는 currentUserId 없음:', { postId, currentUserId });
            setCanShow(false);
            setIsLoading(false);
            return;
        }

        // props로 받은 상태 먼저 확인
        console.log('🔍 status 확인:', status);
        if (status && status !== 'COMPLETED') {
            console.log('❌ 상태가 COMPLETED가 아님:', status);
            setCanShow(false);
            setIsLoading(false);
            return;
        }

        try {
            const url = `http://localhost:8080/api/accompany/${postId}/chat-access?userId=${currentUserId}`;
            console.log('🔍 API 호출:', url);
            
            const response = await fetch(url);
            console.log('🔍 API 응답 상태:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 API 응답 데이터:', data);
                
                const shouldShow = data.canAccess && data.isCompleted;
                console.log('🔍 표시 여부 결정:', shouldShow);
                setCanShow(shouldShow);
            } else {
                const errorText = await response.text();
                console.log('❌ API 오류 응답:', errorText);
                setCanShow(false);
            }
        } catch (error) {
            console.error('❌ API 호출 오류:', error);
            setCanShow(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePress = async () => {
        if (isNavigating || !postId) return;
        
        console.log('그룹채팅 버튼 클릭 - postId:', postId);
        setIsNavigating(true);
        
        try {
            const params = new URLSearchParams({
                postId: postId.toString(),
                location: location || '위치 정보 없음',
                participants: participants?.toString() || '0',
                maxParticipants: maxParticipants?.toString() || '0'
            });
            
            console.log('🚀 채팅방으로 이동:', `/accompany/Chat?${params.toString()}`);
            router.push(`/accompany/Chat?${params.toString()}`);
            
        } catch (error) {
            console.error('❌ 채팅방 이동 오류:', error);
        } finally {
            setIsNavigating(false);
        }
    };

    return (
        <TouchableOpacity 
            style={[styles.container, isNavigating && styles.disabledContainer, style]} 
            onPress={handlePress}
            disabled={isNavigating}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                    name={isNavigating ? "loading" : "chat"} 
                    size={14} 
                    color={isNavigating ? "#999" : "black"} 
                />
            </View>
            <Text style={[styles.text, isNavigating && styles.disabledText]}>
                {isNavigating ? " 이동중..." : " 그룹채팅"}
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
        // 아이콘 컨테이너 스타일
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