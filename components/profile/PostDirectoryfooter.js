import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PostDirectoryFooter = ({
    isVisible = false,
    selectedCount = 0,
    onDelete,
    onDownload,
    onLock,
    }) => {
    if (!isVisible) return null;

    return (
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            {/* 선택된 개수 표시 */}
            <View style={styles.countContainer}>
            <Text style={styles.countText}>
                {selectedCount}개 선택
            </Text>
            </View>

            {/* 액션 버튼들 */}
            <View style={styles.actionContainer}>
            {/* 삭제 버튼 */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onDelete}
                disabled={selectedCount === 0}
            >
                <Icon
                name="delete"
                size={24}
                color={selectedCount > 0 ? '#000' : '#ccc'}
                />
            </TouchableOpacity>

            {/* 다운로드 버튼 */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onDownload}
                disabled={selectedCount === 0}
            >
                <Icon
                name="file-download"
                size={24}
                color={selectedCount > 0 ? '#000' : '#ccc'}
                />
            </TouchableOpacity>

            {/* 잠금 버튼 */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onLock}
                disabled={selectedCount === 0}
            >
                <Icon
                name="lock"
                size={24}
                color={selectedCount > 0 ? '#000' : '#ccc'}
                />
            </TouchableOpacity>
            </View>
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    countContainer: {
        flex: 1,
    },
    countText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    actionButton: {
        padding: 8,
        borderRadius: 4,
    },
});

export default PostDirectoryFooter;