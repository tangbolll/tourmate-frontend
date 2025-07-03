import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const BottomNotification = ({
    visible = false,
    type = 'delete', // 'delete' | 'closed'
    onCancel,
    onConfirm,
    onClose,
    }) => {
    const getContent = () => {
        switch (type) {
        case 'delete':
            return {
            title: '해당 엽서를 정말 삭제하시겠습니까?',
            description: null,
            cancelText: '취소',
            confirmText: '삭제',
            };
        case 'closed':
            return {
            title: '해당 엽서를 비공개로 전환하시겠습니까?',
            description: '비공개로 설정된 엽서는 다른 사용자에게 노출되지 않으며,\n언제든 다시 공개로 변경할 수 있습니다.',
            cancelText: '취소',
            confirmText: '비공개 전환',
            };
        default:
            return {
            title: '',
            description: null,
            cancelText: '취소',
            confirmText: '확인',
            };
        }
    };

    const content = getContent();

    if (!visible) return null;

    return (
        <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose || onCancel}
        >
        <View style={styles.overlay}>
            <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose || onCancel}
            />
            
            <View style={styles.container}>
            <View style={styles.content}>
                {/* 제목 */}
                <Text style={styles.title}>
                {content.title}
                </Text>
                
                {/* 설명 (있을 경우에만) */}
                {content.description && (
                <Text style={styles.description}>
                    {content.description}
                </Text>
                )}
                
                {/* 버튼들 */}
                <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.8}
                >
                    <Text style={styles.cancelButtonText}>
                    {content.cancelText}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={onConfirm}
                    activeOpacity={0.8}
                >
                    <Text style={styles.confirmButtonText}>
                    {content.confirmText}
                    </Text>
                </TouchableOpacity>
                </View>
            </View>
            </View>
        </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34, // Safe area bottom
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        lineHeight: 24,
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 32,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#000',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
});

export default BottomNotification;