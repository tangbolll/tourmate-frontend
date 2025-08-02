import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AlarmPopup = ({ 
    alarmText, 
    onClose, 
    onConfirm,
    confirmText = "확인",
    cancelText = "취소",
    showConfirmButton = false,
    confirmButtonStyle = {}
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>알림</Text>
                </View>
                
                <View style={styles.contentContainer}>
                    <Text style={styles.contentText}>{alarmText || '알림 내용'}</Text>
                </View>
                
                {/* 버튼 영역 - 확인/취소 버튼이 있으면 2개, 없으면 1개 */}
                <View style={showConfirmButton ? styles.buttonRow : styles.singleButtonWrapper}>
                    {showConfirmButton ? (
                        <>
                            <TouchableOpacity 
                                style={[styles.buttonHalf, styles.cancelButton]} 
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.buttonHalf, styles.confirmButton, confirmButtonStyle]} 
                                onPress={onConfirm}
                            >
                                <Text style={styles.confirmButtonText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity 
                            style={styles.singleButtonContainer} 
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>닫기</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
    },
    card: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerContainer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    contentText: {
        fontSize: 16,
        lineHeight: 20,
        color: '#333',
    },
    // 단일 버튼 wrapper
    singleButtonWrapper: {
        borderBottomWidth: 0, // 마지막 구분선 제거를 위해 추가
    },
    // 단일 버튼 (닫기만 있는 경우)
    singleButtonContainer: {
        alignItems: 'center',
        padding: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    // 두 개 버튼 (확인/취소)
    buttonRow: {
        flexDirection: 'row',
        height: 48,
    },
    buttonHalf: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1.2,
        borderRightColor: '#E5E7EB',
    },
    cancelButton: {
        backgroundColor: '#fff',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    confirmButton: {
        backgroundColor: '#fff',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
});

export default AlarmPopup;