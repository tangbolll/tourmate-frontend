import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PostDirectoryHeader = ({
    title = 'Busan',
    startDate = '2021.03.04',
    endDate = '2021.03.06',
    onBackPress,
    onSelectPress,
    onCancelPress,
}) => {
    const [isSelectMode, setIsSelectMode] = useState(false);

    const handleSelectToggle = () => {
        if (isSelectMode) {
            // 취소 모드일 때
            setIsSelectMode(false);
            if (onCancelPress) {
                onCancelPress();
            }
        } else {
            // 선택 모드일 때
            setIsSelectMode(true);
            if (onSelectPress) {
                onSelectPress();
            }
        }
    };

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        }
    };

    return (
        <View style={styles.container}>
            {/* 왼쪽 뒤로가기 버튼 */}
            <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackPress}
            >
                <Feather name="chevron-left" size={24} color="#333" />
            </TouchableOpacity>

            {/* 중앙 제목 및 기간 */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.dateRange}>{startDate} - {endDate}</Text>
            </View>

            {/* 오른쪽 선택/취소 버튼 */}
            <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleSelectToggle}
            >
                <Text style={styles.actionButtonText}>
                    {isSelectMode ? '취소' : '선택'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        height: 70,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    dateRange: {
        fontSize: 14,
        color: '#999',
        fontWeight: '400',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        minWidth: 60,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
});

export default PostDirectoryHeader;