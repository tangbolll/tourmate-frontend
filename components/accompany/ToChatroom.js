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
    status
}) => {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [canShow, setCanShow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkShouldShow();
    }, [postId, currentUserId, status]);

    const checkShouldShow = async () => {
        if (!postId || !currentUserId) {
            setCanShow(false);
            setIsLoading(false);
            return;
        }

        // props로 받은 상태가 COMPLETED가 아니면 숨김
       if (status && status !== 'COMPLETED') {
            setCanShow(false);
            setIsLoading(false);
            return;
        }

        try {
            const url = `http://localhost:8080/api/accompany/${postId}/chat-access?userId=${currentUserId}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                // COMPLETED 상태이고 접근 권한이 있을 때만 표시
                setCanShow(data.canAccess && data.isCompleted);
            } else {
                setCanShow(false);
            }
        } catch (error) {
            setCanShow(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePress = async () => {
        if (isNavigating || !postId) return;
        
        setIsNavigating(true);
        
        try {
            const params = new URLSearchParams({
                postId: postId.toString(),
                location: location || '위치 정보 없음',
                participants: participants?.toString() || '0',
                maxParticipants: maxParticipants?.toString() || '0'
            });
            
            router.push(`/accompany/Chat?${params.toString()}`);
            
        } catch (error) {
            console.error('채팅방 이동 오류:', error);
        } finally {
            setIsNavigating(false);
        }
    };

    // 로딩 중이거나 표시 조건에 맞지 않으면 아무것도 렌더링하지 않음
    if (isLoading || !canShow) {
        return null;
    }

    // COMPLETED 상태이고 참여자인 경우에만 버튼 표시
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