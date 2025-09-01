import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const AccompanyBottomButton = ({ 
    isHost,
    accompanyStatus,
    userApplicationStatus,
    onPress,
    likes,
    isLiked,
    onLikeToggle,
    isLoading = false,
}) => {
    const [AccompanyStatus, setAccompanyStatus] = useState(accompanyStatus); 
    const [UserApplicationStatus, setUserApplicationStatus] = useState(userApplicationStatus); 

    useEffect(() => {
        console.log('🔍 AccompanyBottomButton props 변경 감지:', {
            accompanyStatus,
            userApplicationStatus,
            likes,
            isLiked: isLiked,
            isLikedType: typeof isLiked,
            isLoading
        });
        
        setAccompanyStatus(accompanyStatus);
        setUserApplicationStatus(userApplicationStatus);
        // 좋아요 상태는 부모에서 관리하므로 여기서 setState 하지 않음
    }, [accompanyStatus, userApplicationStatus, likes, isLiked, isLoading]);

    // ✅ 디버깅 로그만 유지 (좋아요 상태는 부모에서 관리)
    useEffect(() => {
        console.log('🔍 AccompanyBottomButton 현재 표시 상태:', {
            AccompanyStatus,
            UserApplicationStatus,
            부모_likes: likes,
            부모_isLiked: isLiked,
            isLoading
        });
    }, [AccompanyStatus, UserApplicationStatus, likes, isLiked, isLoading]);

    const getButtonConfig = () => {
        if (isHost) {
            switch (AccompanyStatus) {
                case 'RECRUITING':
                    return {
                        text: '모집 마감',
                        disabled: false,
                        backgroundColor: 'black'
                    };
                case 'COMPLETED':
                    return {
                        text: '모집이 마감된 동행입니다',
                        disabled: true,
                        backgroundColor: '#CCCCCC'
                    };
                case 'CLOSED':
                    return {
                        text: '종료된 동행입니다',
                        disabled: true,
                        backgroundColor: '#CCCCCC'
                    };
                default:
                    return {
                        text: '모집 마감',
                        disabled: false,
                        backgroundColor: 'black'
                    };
            }
        } else {
            switch (AccompanyStatus) {
                case 'RECRUITING':
                    switch (UserApplicationStatus) {
                        case 'PENDING':
                            return {
                                text: '동행 취소',
                                disabled: false,
                                backgroundColor: 'black'
                            };
                        case 'ACCEPTED':
                            return {
                                text: '참여 중인 동행입니다',
                                disabled: true,
                                backgroundColor: '#CCCCCC'
                            };
                        case 'REJECTED':
                            return {
                                text: '거절된 동행입니다',
                                disabled: true,
                                backgroundColor: '#CCCCCC'
                            };
                        case 'CANCELLED':
                            return {
                                text: '동행 신청',
                                disabled: false,
                                backgroundColor: 'black'
                            };
                        case null:
                        case undefined:
                        default:
                            return {
                                text: '동행 신청',
                                disabled: false,
                                backgroundColor: 'black'
                            };
                    }
                case 'COMPLETED':
                case 'CLOSED':
                    return {
                        text: '마감된 동행입니다',
                        disabled: true,
                        backgroundColor: '#CCCCCC'
                    };
                default:
                    return {
                        text: '동행 신청',
                        disabled: false,
                        backgroundColor: 'black'
                    };
            }
        }
    };

    const buttonConfig = getButtonConfig();

    const handleMainButtonPress = async () => {
        const previousAccompanyStatus = AccompanyStatus; // ✅ 변수명 수정
        const previousUserApplicationStatus = UserApplicationStatus;

        try {
            // 낙관적 업데이트: UI를 먼저 업데이트합니다.
            if (isHost && AccompanyStatus === 'RECRUITING') {
                setAccompanyStatus('RECRUITING');
            } else if (!isHost && AccompanyStatus === 'RECRUITING') {
                if (UserApplicationStatus === 'PENDING') {
                    setUserApplicationStatus('CANCELLED');
                } else if (UserApplicationStatus === null || UserApplicationStatus === undefined || UserApplicationStatus === 'REJECTED' || UserApplicationStatus === 'CANCELLED') {
                    setUserApplicationStatus('PENDING');
                }
            }
            
            await onPress(); // 부모 컴포넌트의 API 호출 함수 실행
            // API 호출 성공 시 상태가 유지됩니다.

        } catch (error) {
            console.error('API 호출 중 에러 발생:', error);
            // 에러 발생 시 상태를 이전 상태로 되돌립니다.
            setAccompanyStatus(previousAccompanyStatus);
            setUserApplicationStatus(previousUserApplicationStatus);
            // 필요하다면 사용자에게 오류 메시지를 표시할 수 있습니다.
        }
    };

    // ✅ 좋아요 토글 - 부모에게 완전히 위임
    const handleLikePress = async () => {
        console.log('💖 AccompanyBottomButton: 좋아요 버튼 클릭');
        console.log('🔍 클릭 시점 상태:', { 
            부모_isLiked: isLiked, 
            부모_likes: likes,
            isLoading,
            상태_타입: {
                isLiked_type: typeof isLiked,
                likes_type: typeof likes
            }
        });
        
        // 로딩 중이면 처리하지 않음
        if (isLoading) {
            console.log('⚠️ 로딩 중이므로 좋아요 처리 건너뛰기');
            return;
        }
        
        // 좋아요 정보가 유효하지 않으면 처리하지 않음
        if (likes === undefined || isLiked === undefined || isLiked === null) {
            console.log('⚠️ 좋아요 정보가 유효하지 않아 처리 건너뛰기', {
                likes,
                isLiked
            });
            return;
        }
        
        try {
            console.log('🚀 부모의 onLikeToggle 호출 시작');
            await onLikeToggle();
            console.log('✅ AccompanyBottomButton: 부모 좋아요 토글 완료');
            
        } catch (error) {
            console.log('❌ AccompanyBottomButton: 부모에서 처리된 에러 감지:', error.message);
            // 에러는 부모에서 이미 처리되므로 여기서는 로깅만
        }
    };
    
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.button, 
                    { backgroundColor: buttonConfig.backgroundColor }
                ]} 
                onPress={handleMainButtonPress}
                disabled={buttonConfig.disabled}
            >
                <Text style={styles.buttonText}>{buttonConfig.text}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.likesContainer} 
                onPress={handleLikePress}
                activeOpacity={0.7}
                disabled={isLoading} // ✅ 로딩 중일 때 비활성화
            >
                <View style={styles.iconWrapper}>
                    <Text style={styles.likeText}>{likes}</Text>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FF6B6B" />
                    ) : (
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={30} 
                            color={isLiked ? "#FF6B6B" : "black"} 
                        />
                    )}
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
    paddingBottom: 50, // 하단 패딩 확장
    minHeight: 80, 
    position: 'absolute',
    width: '100%',
    // bottom: -50,
    bottom: Platform.OS === 'web' ? -30 : -50,
},
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 18,
        alignItems: 'center',
        marginRight: 8,
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

export default AccompanyBottomButton;