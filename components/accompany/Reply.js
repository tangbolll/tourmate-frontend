import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const defaultProfile = require('../../assets/defaultProfile1.png');

const Reply = ({ profileImage, nickname, time, content, onReplyPress, isHost, style }) => {
    const profileSrc = profileImage
        ? { uri: profileImage }
        : defaultProfile;

    return (
        <View style={[styles.wrapper, style]}>

            
            <View style={styles.container}>
                <Image 
                    source={profileSrc} 
                    style={styles.profileImage}
                />

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
    wrapper: {
        marginLeft: 20, 
        marginBottom: 8,
    },
    replyIndicator: {
        marginLeft: 32,
        marginBottom: 4,
    },
      container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
        marginLeft: 52
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

export default Reply;
