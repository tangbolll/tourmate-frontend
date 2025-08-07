import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AccompanyBottomButton = ({ 
    isHost,
    accompanyStatus, // 'RECRUITING', 'COMPLETED', 'CLOSED'
    userApplicationStatus, // 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'
    onPress,
    likes,
    isLiked,
    onLikeToggle,
    applied // 신청했는지 여부
}) => {
    // 버튼 텍스트와 상태를 결정하는 함수
    const getButtonConfig = () => {
        if (isHost) {
            // 호스트인 경우
            switch (accompanyStatus) {
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
            // 참가자인 경우
            switch (accompanyStatus) {
                case 'RECRUITING':
                    // 신청 상태에 따라 다르게 표시
                    if (userApplicationStatus === 'PENDING') {
                        return {
                            text: '동행 취소',
                            disabled: false, // 취소 가능
                            backgroundColor: 'black' 
                        };
                    } else if (userApplicationStatus === 'ACCEPTED') {
                        return {
                            text: '참여 중인 동행입니다',
                            disabled: false, // 취소 가능
                            backgroundColor: '#CCCCCC' 
                        };
                    } else if (userApplicationStatus === 'REJECTED') {
                        return {
                            text: '거절된 동행입니다',
                            disabled: false, // 다시 신청 가능
                            backgroundColor: '#CCCCCC' 
                        };
                    } else {
                        return {
                            text: '동행 신청',
                            disabled: false,
                            backgroundColor: 'black'
                        };
                    }
                case 'COMPLETED':
                    return {
                        text: '마감된 동행입니다',
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
                        text: applied ? '동행 취소' : '동행 신청',
                        disabled: false,
                        backgroundColor: 'black'
                    };
            }
        }
    };

    const buttonConfig = getButtonConfig();

    return (
        <View style={styles.container}>
            {/* 메인 버튼 */}
            <TouchableOpacity 
                style={[
                    styles.button, 
                    { backgroundColor: buttonConfig.backgroundColor }
                ]} 
                onPress={onPress}
                disabled={buttonConfig.disabled}
            >
                <Text style={styles.buttonText}>{buttonConfig.text}</Text>
            </TouchableOpacity>
            
            {/* 좋아요 버튼 */}
            <TouchableOpacity 
                style={styles.likesContainer} 
                onPress={onLikeToggle}
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