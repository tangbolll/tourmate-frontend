import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';

const ToChatroom = ({ 
    postId, 
    style,
    status,
    chatAccess, 
    isDataLoading = false  
}) => {
    const { currentUserId } = useAuth();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    // 표시 조건 체크 함수
    const shouldShow = () => {
        // 데이터 로딩 중이면 숨김
        if (isDataLoading) return false;
        
        // 필수 데이터 확인
        if (!postId || !currentUserId) return false;
        
        // 상태가 COMPLETED가 아니면 숨김
        if (status && status !== 'COMPLETED') return false;
        
        // 채팅 접근 권한 확인
        if (!chatAccess) return false;
        
        return chatAccess.canAccess && chatAccess.isCompleted;
    };

    const handlePress = async () => {
        if (isNavigating || !postId) return;
        
        setIsNavigating(true);
        
        try {
        const queryParams = new URLSearchParams({
            postId: postId,
        }).toString();
        
        router.push(`/accompany/Chat?${queryParams}`);

    } catch (error) {
    } finally {
        setIsNavigating(false);
        }
    };

    // 표시 조건에 맞지 않으면 렌더링하지 않음
    if (!shouldShow()) {
        return null;
    }

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