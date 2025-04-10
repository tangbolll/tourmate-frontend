import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const Comment = ({ profileImage, nickname, time, content, onReplyPress, depth }) => {
    return (
        <View>
            {/* 타이틀 */}
            <View style={styles.divider} />
            {<Text style={styles.title}> 코멘트</Text>}

            {/* 댓글 */}
            <View style={[styles.container, {
                marginLeft: 40 * depth,
                marginTop: 8 * depth,
            }]}>
                {/* 프로필 이미지 */}
                <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImage}
                />

                {/* 내용 */}
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.nickname}>{nickname}</Text>
                        <Text style={styles.time}>· {time}</Text>
                        <TouchableOpacity onPress={onReplyPress}>
                            <Text style={styles.replyText}>답글</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.contentText}>{content}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // 얇은 회색 라인
        marginTop: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        marginRight: 6,
    },
    replyText: {
        fontSize: 12,
        color: '#6B7280',
        textDecorationLine: 'underline',
    },
    contentText: {
        fontSize: 14,
        color: '#000',
        marginTop: 2,
        marginBottom: 16,
    },
});

export default Comment;
