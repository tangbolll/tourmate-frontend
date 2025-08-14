import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const AccompanyBottomButton = ({ 
    isHost,
    accompanyStatus, // 'RECRUITING', 'COMPLETED', 'CLOSED'
    userApplicationStatus, // 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'
    onPress, // 이 함수는 API 호출만 담당합니다.
    likes,
    isLiked,
    onLikeToggle,
}) => {
    const [AccompanyStatus, setAccompanyStatus] = useState(accompanyStatus); 
    const [UserApplicationStatus, setUserApplicationStatus] = useState(userApplicationStatus); 
    const [likesCount, setLikesCount] = useState(likes); 
    const [isLikedState, setIsLikedState] = useState(isLiked); 

    useEffect(() => {
        setAccompanyStatus(accompanyStatus);
        setUserApplicationStatus(userApplicationStatus);
        setLikesCount(likes);
        setIsLikedState(isLiked);
    }, [accompanyStatus, userApplicationStatus, likes, isLiked]);

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

    const handleLikePress = () => {
        const newLikedState = !isLikedState;
        setIsLikedState(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
        onLikeToggle();
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
            >
                <View style={styles.iconWrapper}>
                    <Text style={styles.likeText}>{likesCount}</Text>
                    <Ionicons 
                        name={isLikedState ? "heart" : "heart-outline"} 
                        size={30} 
                        color={isLikedState ? "#FF6B6B" : "black"} 
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
    paddingTop: 16, 
    paddingBottom: 40, // 하단 패딩 확장
    minHeight: 80, 
    position: 'absolute',
    width: '100%',
    // bottom: -50,
    bottom: Platform.OS === 'web' ? -30 : -50,
},
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
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