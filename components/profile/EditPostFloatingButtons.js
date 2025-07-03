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
            <Icon name="delete" size={20} color="#000" />
        </TouchableOpacity>

        {/* 다운로드 버튼 */}
        <TouchableOpacity
            style={styles.button}
            onPress={onDownload}
            activeOpacity={0.8}
        >
            <Icon name="file-download" size={20} color="#000" />
        </TouchableOpacity>

        {/* 잠금/잠금해제 버튼 */}
        <TouchableOpacity
            style={styles.button}
            onPress={onLock}
            activeOpacity={0.8}
        >
            <Icon 
            name={isLocked ? "lock" : "lock-open"} 
            size={20} 
            color="#000" 
            />
        </TouchableOpacity>

        {/* 편집 버튼 */}
        <TouchableOpacity
            style={styles.button}
            onPress={onEdit}
            activeOpacity={0.8}
        >
            <Icon name="edit" size={20} color="#000" />
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        // Shadow for Android
        elevation: 4,
    },
});

export default EditPostFloatingButtons;