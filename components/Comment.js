import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const Comment = ({ profileImage, nickname, time, content, onReplyPress }) => {
    return (
        <View style={styles.container}>
            {/* 프로필 이미지 */}
            <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage}
            />

            {/* 댓글 본문 */}
            <View style={styles.contentContainer}>
                {/* 닉네임 + 시간 */}
                <View style={styles.headerRow}>
                    <Text style={styles.nickname}>{nickname}</Text>
                    <Text style={styles.time}>· {time}  </Text>
                    {/* 답글 버튼 */}
                    <TouchableOpacity onPress={onReplyPress}>
                        <Text style={styles.replyText}>답글</Text>
                    </TouchableOpacity>
                </View>

                {/* 댓글 내용 */}
                <Text style={styles.contentText}>{content}</Text>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // Tailwind의 gray-200
        backgroundColor: '#fff',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nickname: {
        fontWeight: 'bold',
        marginRight: 6,
        color: '#000',
    },
    time: {
        fontSize: 12,
        color: '#000',
    },
    contentText: {
        fontSize: 14,
        color: '#000',
        marginBottom: 6,
    },
    replyText: {
        fontSize: 13,
        color: '#6B7280', // Tailwind gray-500
        textDecorationLine: 'underline',
    },
});

export default Comment;
