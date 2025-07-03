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
    showActionButton = true, // 오른쪽 버튼 표시 여부
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

    // onSelectPress나 onCancelPress가 없으면 버튼 숨김
    const shouldShowButton = showActionButton && (onSelectPress || onCancelPress);

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

            {/* 오른쪽 선택/취소 버튼 - 조건부 렌더링 */}
            {shouldShowButton ? (
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleSelectToggle}
                >
                    <Text style={styles.actionButtonText}>
                        {isSelectMode ? '취소' : '선택'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.actionButtonPlaceholder} />
            )}
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
        marginTop: 50, // 헤더 높이 조정
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    dateRange: {
        fontSize: 14,
        color: '#666',
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
    actionButtonPlaceholder: {
        width: 60, // 버튼과 같은 너비를 유지하여 레이아웃 균형 맞춤
    },
});

export default PostDirectoryHeader;