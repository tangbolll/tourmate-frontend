import React from 'react';
import { 
    Modal, 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet 
} from 'react-native';

const CloseAlarmPopup = ({ visible, onConfirm, onCancel }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>알림</Text>
                        <Text style={styles.modalText}>
                            동행을 마감하시겠습니까?{'\n'}
                            마감된 동행은 다시 되돌릴 수 없습니다.
                        </Text>
                    </View>
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.leftButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.buttonTextBold}>네</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.button, styles.rightButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.buttonTextBold}>아니오</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalContent: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'left', // 왼쪽 정렬로 변경
    },
    modalText: {
        fontSize: 14,
        textAlign: 'left',
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    leftButton: {
        borderRightWidth: 0.5,
        borderRightColor: '#eee',
    },
    rightButton: {
        borderLeftWidth: 0.5,
        borderLeftColor: '#eee',
    },
    buttonTextBold: {
        fontSize: 16,
        fontWeight: 'bold', // 볼드체로 변경
    }
});

export default CloseAlarmPopup;