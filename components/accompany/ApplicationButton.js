import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ApplicationButton = ({ 
    title, 
    onPress, 
    closed, 
    likes, // prop으로 likes를 받음
    isLiked, // prop으로 isLiked를 받음
    onLikeToggle // prop으로 onLikeToggle 함수를 받음
}) => {
    return (
        <View style={styles.container}>
            {/* 메인 버튼 (신청/취소) */}
            <TouchableOpacity 
                style={[styles.button, closed && styles.disabledButton]} 
                onPress={onPress}
                disabled={closed}
            >
                <Text style={styles.buttonText}>{closed ? '모집이 마감된 동행입니다.' : title}</Text>
            </TouchableOpacity>
            
            {/* 좋아요 버튼 */}
            <TouchableOpacity 
                style={styles.likesContainer} 
                onPress={onLikeToggle} // onLikeToggle prop을 직접 연결
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
