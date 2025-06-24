import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ToChatRoom = ({ 
    onPress, 
    title = "그룹채팅 입장", 
    onClose 
}) => {
    
    const handlePress = () => {
        if (onPress) {
            onPress();
        }
    };

    const handleBackdropPress = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <Modal
            visible={true}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            {/* 어두운 배경 */}
            <TouchableOpacity 
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleBackdropPress}
            >
                {/* 하단 컨테이너 */}
                <TouchableOpacity 
                    style={styles.container}
                    activeOpacity={1}
                    onPress={() => {}} // 버블링 방지
                >
                    {/* 상단 핸들 바 */}
                    <View style={styles.handleBar} />
                    
                    {/* 닫기 버튼 */}
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    
                    {/* 메인 버튼 */}
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handlePress}
                        activeOpacity={0.8}
                    >
                        <Ionicons 
                            name="chat" 
                            size={24} 
                            color="white"
                        />
                        <Text style={styles.buttonText}>
                            {title}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 34, // Safe area 고려
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
        zIndex: 1,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ToChatRoom;