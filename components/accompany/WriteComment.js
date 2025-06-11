import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WriteComment = ({ 
    onSend, 
    onFocus, 
    placeholder = "코멘트를 작성해주세요.",
    isReplyMode = false,
    replyToNickname = "",
    onCancel
}) => {
    const [comment, setComment] = useState('');

    const handleFocus = () => {
        if (onFocus) {
            onFocus();
        }
    };

    const handleSend = () => {
        if (comment.trim()) {
            onSend(comment); 
            setComment(''); 
            Keyboard.dismiss();
        }
    };

    const handleCancel = () => {
        setComment('');
        if (onCancel) {
            onCancel();
        }
        Keyboard.dismiss();
    };

    return (
        <View style={styles.container}>
            {/* 답글 모드일 때 @닉네임 표시 */}
            {isReplyMode && replyToNickname && (
                <Text style={styles.replyToName}>@{replyToNickname}</Text>
            )}
            
            <TextInput
                style={styles.input}
                placeholder={isReplyMode ? "" : placeholder}
                placeholderTextColor="#999"
                maxLength={50}
                value={comment}
                onChangeText={setComment}
                onFocus={handleFocus}
                multiline={false}
            />
            
            {/* 답글 모드일 때 취소 버튼 */}
            {isReplyMode && (
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                    <Ionicons name="close" size={18} color="#999" />
                </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={handleSend}>
                <Ionicons 
                    name="paper-plane-outline" 
                    size={24} 
                    color={comment.trim() ? "#007AFF" : "#999"} 
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    replyToName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 4,
    },
    cancelButton: {
        marginRight: 8,
        padding: 2,
    },
});

export default WriteComment;