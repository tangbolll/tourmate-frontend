import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageBubble = ({ message }) => {
    const { user, text } = message;
    const isSelf = user.isSelf;
    const isHost = user.isHost;
    
    return (
        <View style={[
            styles.messageRow,
            isSelf ? styles.selfMessageRow : {}
        ]}>
            {!isSelf && (
                <View style={styles.messageContainer}>
                    <View style={styles.userInfoRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                        </View>
                        <Text style={styles.userName}>{user.name}</Text>
                        {isHost && (
                            <View style={styles.hostTagContainer}>
                                <Text style={styles.hostTag}>호스트</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.messageBubbleWrapper}>
                        <View style={[
                            styles.messageBubble,
                            isSelf ? styles.MessageBubble : {},
                            isHost ? styles.MessageBubble : {}
                        ]}>
                            <Text style={styles.messageText}>{text}</Text>
                        </View>
                    </View>
                </View>
            )}
            
            {isSelf && (
                <View style={styles.messageBubbleWrapper}>
                    <View style={[
                        styles.messageBubble,
                        styles.selfMessageBubble
                    ]}>
                        <Text style={styles.messageText}>{text}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    messageRow: {
        marginBottom: 16,
    },
    selfMessageRow: {
        alignItems: 'flex-end',
    },
    messageContainer: {
        maxWidth: '90%',
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 14,
        backgroundColor: '#CED4DA',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        marginRight: 6,
    },
    avatarText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 6,
    },
    hostTagContainer: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    hostTag: {
        fontSize: 10,
        color: '#000000',
        fontWeight: '500',
    },
    messageBubbleWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    messageBubble: {
        backgroundColor: '#CED4DA',
        padding: 10,
        borderRadius: 12,
        marginLeft: 6,
        marginRight: 6,
        maxWidth: '90%',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#000000',
    },
});

export default MessageBubble;