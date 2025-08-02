import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ToChatroom = ({ postId, currentUserId = 2, location, participants, maxParticipants, style }) => {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    // 🚀 Chat 화면으로 바로 이동 (채팅방 생성은 Chat에서 처리)
    const handlePress = async () => {
        if (isNavigating || !postId) return;
        
        console.log('그룹채팅 버튼 클릭 - postId:', postId);
        setIsNavigating(true);
        
        try {
            // Chat 화면으로 이동하면서 필요한 데이터 전달
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