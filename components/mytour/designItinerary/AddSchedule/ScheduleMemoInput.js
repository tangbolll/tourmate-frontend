import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ScheduleMemoInput = ({ memo, setMemo, onFocus, onBlur }) => {
    return (
        <View style={styles.section}>
            <View style={styles.inputRow}>
                <View style={styles.iconContainer}>
                    <Feather name="file-text" size={16} color="#666" />
                </View>
                <TextInput
                    style={styles.memoInput}
                    value={memo}
                    onChangeText={setMemo}
                    placeholder="메모 추가"
                    placeholderTextColor="#CCCCCC"
                    multiline={true}
                    textAlignVertical="top"
                    scrollEnabled={true} // 항상 스크롤 가능
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        height: 80, // 고정 높이 (재렌더링 없음)
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
});

export default ScheduleMemoInput;