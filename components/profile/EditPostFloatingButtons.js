import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditPostFloatingButtons = ({
    onDelete,
    onDownload,
    onLock,
    onEdit,
    isLocked = false,
    style,
    }) => {
    return (
        <View style={[styles.container, style]}>
        {/* 삭제 버튼 */}
        <TouchableOpacity
            style={styles.button}
            onPress={onDelete}
            activeOpacity={0.8}
        >
            <Icon name="delete" size={24} color="#000" />
        </TouchableOpacity>

        {/* 다운로드 버튼 */}
        <TouchableOpacity
            style={styles.button}
            onPress={onDownload}
            activeOpacity={0.8}
        >
            <Icon name="file-download" size={24} color="#000" />
        </TouchableOpacity>

        {/* 잠금/잠금해제 버튼 */}
        <TouchableOpacity
            style={styles.button}
            onPress={onLock}
            activeOpacity={0.8}
        >
            <Icon 
            name={isLocked ? "lock" : "lock-open"} 
            size={24} 
            color="#000" 
            />
        </TouchableOpacity>

        {/* 편집 버튼 */}
        <TouchableOpacity
            style={styles.button}
            onPress={onEdit}
            activeOpacity={0.8}
        >
            <Icon name="edit" size={24} color="#000" />
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 38,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        // Shadow for Android
        elevation: 4,
    },
});

export default EditPostFloatingButtons;