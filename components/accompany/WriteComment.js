import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WriteComment = ({ 
    onSend, 
    onFocus, 
    placeholder = "50자 내로 코멘트를 작성해주세요.",
    isReplyMode = false,
    replyToNickname = "",
    onCancel
}) => {
    const [comment, setComment] = useState('');
    const inputRef = useRef(null);

    // 답글 모드가 되면 자동으로 포커스
    useEffect(() => {
        if (isReplyMode) {
            // 약간의 딜레이를 주어 레이아웃이 완료된 후 포커스
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [isReplyMode]);

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

    // 답글 모드에 따른 placeholder 설정
    const getPlaceholder = () => {
        if (isReplyMode) {
            return replyToNickname ? `@${replyToNickname}에게 답글...` : "답글을 작성해주세요...";
        }
        return placeholder;
    };

    return (
        <View style={[styles.container, isReplyMode && styles.replyContainer]}>
            {/* 답글 모드 표시 */}
            {isReplyMode && (
                <View style={styles.replyIndicator}>
                    <Ionicons name="return-down-forward" size={14} color="#666" />
                </View>
            )}
            
            <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={getPlaceholder()}
                placeholderTextColor="#999"
                maxLength={50}
                value={comment}
                onChangeText={setComment}
                onFocus={handleFocus}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
            />
            
            {/* 답글 모드일 때 취소 버튼 */}
            {isReplyMode && (
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                    <Ionicons name="close" size={18} color="#999" />
                </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
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
        marginBottom: 0,
        backgroundColor: '#fff',
    },
    replyContainer: {
        borderColor: '#ccc',
        backgroundColor: '#f8f9ff',
    },
    replyIndicator: {
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
    sendButton: {
        padding: 2,
    },
});

export default WriteComment;