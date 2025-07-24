import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
            // 쿼리 파라미터로 userId 전송하도록 수정
            const url = `${API_URL}/api/accompany/${postId}/like?userId=${currentUserId}`;
            console.log('🌐 좋아요 API 호출:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // body 제거 (백엔드에서 사용하지 않음)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ 좋아요 성공:', result);
                
                // 서버에서 받은 실제 좋아요 수로 업데이트
                if (result.likeCount !== undefined) {
                    setLikes(result.likeCount);
                }
                
                // 서버에서 받은 실제 좋아요 상태로 업데이트
                if (result.isLiked !== undefined) {
                    setIsLiked(result.isLiked);
                }
            } else {
                throw new Error(`좋아요 실패: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ 좋아요 오류:', error);
            
            // 실패 시 롤백
            setIsLiked(!newLikeStatus);  // 원래 상태로 롤백
            setLikes(prevLikes => newLikeStatus ? prevLikes - 1 : prevLikes + 1);  // 원래 좋아요 수로 롤백
            
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