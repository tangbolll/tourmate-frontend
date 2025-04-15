import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// default profile image
const defaultProfile = require('../assets/defaultProfile.png');

const Comment = ({ profileImage, nickname, time, content, onReplyPress, isHost }) => {
    // 이미지 source 설정
    const profileSrc = profileImage
        ? { uri: profileImage }
        : defaultProfile;

    return (
        <View>
            {/* 타이틀 */}
            <View style={styles.divider} />
            <Text style={styles.title}> 코멘트</Text>

            {/* 댓글 */}
            <View style={styles.container}>
                {/* 프로필 이미지 */}
                <Image 
                    source={profileSrc} 
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
                        {isHost && <Text style={styles.hostLabel}>호스트</Text>}
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
        borderBottomColor: '#E5E7EB',
        marginTop: 12,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 16,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
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
        flexWrap: 'wrap',
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
        marginRight: 6,
    },
    hostLabel: {
        fontSize: 10,
        backgroundColor: '#E5E7EB',
        color: '#000',
        marginLeft: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    contentText: {
        fontSize: 14,
        color: '#000',
        marginTop: 2,
        marginBottom: 16,
    },
});

export default Comment;
