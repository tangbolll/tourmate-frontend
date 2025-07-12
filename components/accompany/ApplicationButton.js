import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// API 설정
const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    } else {
      return 'http://192.168.35.218:8080';
    }
  } else {
    return 'https://your-production-api.com';
  }
};

const API_URL = getApiUrl();

const ApplicationButton = ({ 
    title, 
    initialLikes = 0, 
    onPress, 
    closed, 
    postId,
    currentUserId = 2,
    isLiked: initialIsLiked = false
}) => {
    const router = useRouter();
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeLoading, setLikeLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);

    // 🌐 좋아요 API 호출
    const handleLikePress = async () => {
        if (likeLoading) return;
        
        setLikeLoading(true);
        const newLikeStatus = !isLiked;
        
        // UI 즉시 업데이트 (낙관적 업데이트)
        setIsLiked(newLikeStatus);
        setLikes(prevLikes => newLikeStatus ? prevLikes + 1 : prevLikes - 1);
        
        try {
            const url = `${API_URL}/api/accompany/${postId}/like`;
            console.log('🌐 좋아요 API 호출:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    isLiked: newLikeStatus
                }),
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ 좋아요 성공:', result);
                
                // 서버에서 받은 실제 좋아요 수로 업데이트
                if (result.totalLikes !== undefined) {
                    setLikes(result.totalLikes);
                }
            } else {
                throw new Error(`좋아요 실패: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ 좋아요 오류:', error);
            
            // 실패 시 롤백
            setIsLiked(isLiked);
            setLikes(likes);
            
            Alert.alert('오류', '좋아요 처리에 실패했습니다.');
        } finally {
            setLikeLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            {/* 메인 버튼 (신청/취소) */}
            <TouchableOpacity 
                style={[styles.button, closed && styles.disabledButton]} 
                onPress={onPress}
                disabled={closed}
            >
                <Text style={styles.buttonText}>{title}</Text>
            </TouchableOpacity>
            
            {/* 좋아요 버튼 */}
            <TouchableOpacity 
                style={styles.likesContainer} 
                onPress={handleLikePress}
                disabled={likeLoading}
            >
                <View style={styles.iconWrapper}>
                    <Text style={styles.likeText}>{likes}</Text>
                    <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={30} 
                        color={isLiked ? "#FF6B6B" : "black"} 
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, 
        
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
    },
    button: {
        flex: 1,
        backgroundColor: 'black',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    likesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    iconWrapper: {
        position: 'relative',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    likeText: {
        position: 'absolute',
        top: -8,
        fontSize: 10,
        color: 'black',
        fontWeight: '500',
    },
});

export default ApplicationButton;