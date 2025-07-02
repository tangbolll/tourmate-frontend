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

const NotificationPopup = ({
    visible = false,
    title = '알림',
    message = '',
    confirmText = '네',
    cancelText = '아니오',
    onConfirm,
    onCancel,
    onClose,
    showCancelButton = true,
    }) => {
    if (!visible) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
    };

    const handleClose = () => {
        if (onClose) onClose();
        else if (onCancel) onCancel();
    };

    return (
        <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        >
        <View style={styles.overlay}>
            <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={handleClose}
            />
            
            <View style={styles.container}>
            <View style={styles.content}>
                {/* 제목 */}
                <Text style={styles.title}>
                {title}
                </Text>
                
                {/* 메시지 */}
                {message && (
                <Text style={styles.message}>
                    {message}
                </Text>
                )}
                
                {/* 버튼들 */}
                <View style={styles.buttonContainer}>
                {showCancelButton && (
                    <TouchableOpacity
                    style={[
                        styles.button,
                        styles.cancelButton,
                        !showCancelButton && styles.singleButton
                    ]}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                    >
                    <Text style={styles.cancelButtonText}>
                        {cancelText}
                    </Text>
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity
                    style={[
                    styles.button,
                    styles.confirmButton,
                    !showCancelButton && styles.singleButton
                    ]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                >
                    <Text style={styles.confirmButtonText}>
                    {confirmText}
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    container: {
        width: width - 48,
        maxWidth: 320,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        lineHeight: 24,
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 32,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
    },
    confirmButton: {
        // 확인 버튼 스타일
    },
    singleButton: {
        borderRightWidth: 0,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});

export default NotificationPopup;