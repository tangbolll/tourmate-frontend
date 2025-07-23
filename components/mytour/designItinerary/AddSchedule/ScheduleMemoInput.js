import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';;

const ScheduleMemoInput = ({ memo, setMemo, memoHeight, setMemoHeight, onFocus, onBlur }) => {
    const handleMemoContentSizeChange = (event) => {
        const { height } = event.nativeEvent.contentSize;
        const newHeight = Math.max(40, Math.min(height + 10, 120));
        setMemoHeight(newHeight);
    };

    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.inputRow}>
                <View style={commonStyles.iconContainer}>
                    <Feather name="file-text" size={16} color="#666" />
                </View>
                <TextInput
                    style={[commonStyles.memoInput, { height: Math.max(40, memoHeight) }]}
                    value={memo}
                    onChangeText={setMemo}
                    placeholder="메모 추가"
                    placeholderTextColor="#CCCCCC"
                    multiline={true}
                    textAlignVertical="top"
                    onContentSizeChange={handleMemoContentSizeChange}
                    scrollEnabled={memoHeight >= 120}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </View>
        </View>
    );
};

const commonStyles = StyleSheet.create({
    section: {
        marginBottom: 16,
        position: 'relative',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        marginRight: 12,
        marginTop: 12,
    },
    memoInput: {
        flex: 1,
        fontSize: 14,
        minHeight: 40,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
});

export default ScheduleMemoInput;