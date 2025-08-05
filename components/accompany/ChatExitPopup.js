import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';

const ChatExitPopup = ({ isVisible, onClose, onConfirm, chatTitle }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          
          {/* 프로필 이미지 (임시) */}
          {/* 실제 이미지 URL prop을 받아서 사용하도록 수정할 수 있습니다. */}
          <View style={styles.profileImagePlaceholder}>
            {/* <Image source={{ uri: photoUrl }} style={styles.profileImage} /> */}
          </View>
          
          <Text style={styles.modalTitle}>{chatTitle}</Text>
          <Text style={styles.modalText}>해당 채팅방에서 나가시겠습니까?</Text>

          <View style={styles.buttonContainer}>
            {/* 왼쪽 '네' 버튼 */}
            <TouchableOpacity style={styles.leftButton} onPress={onConfirm}>
              <Text style={styles.buttonText}>네</Text>
            </TouchableOpacity>
            
            {/* 오른쪽 '아니오' 버튼 */}
            <TouchableOpacity style={styles.rightButton} onPress={onClose}>
              <Text style={styles.buttonText}>아니오</Text>
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
    paddingTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
    overflow: 'hidden', // 이미지가 둥근 테두리 밖으로 나가지 않도록
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  leftButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  rightButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatExitPopup;
