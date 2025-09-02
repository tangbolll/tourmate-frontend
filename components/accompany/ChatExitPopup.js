import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';

// 기본 프로필 이미지들
const defaultProfiles = [
  require('../../assets/defaultProfile.png')
];

const ChatExitPopup = ({ isVisible, onClose, onConfirm, chatTitle, participants }) => {
  // 겹쳐진 프로필 렌더링 함수
  const renderProfileImages = () => {
    // 참가자가 1명일 때
    if (participants === 1) {
      return (
        <View style={styles.profileImageContainer}>
          <Image 
            source={defaultProfiles[0]} 
            style={styles.singleProfileImage}
          />
        </View>
      );
    }
    
    // 2명일 때
    if (participants === 2) {
      return (
        <View style={styles.profileImageContainer}>
          <View style={styles.multipleProfilesContainer}>
            <Image 
              source={defaultProfiles[1]} 
              style={[styles.profileImage, styles.backProfileImage]}
            />
            <Image 
              source={defaultProfiles[0]} 
              style={[styles.profileImage, styles.frontProfileImage]}
            />
          </View>
        </View>
      );
    }
    
    // 3명 이상일 때 3개 프로필 모두 표시
    return (
      <View style={styles.profileImageContainer}>
        <View style={styles.multipleProfilesContainer}>
          <Image 
            source={defaultProfiles[2]} 
            style={[styles.profileImage, styles.thirdProfileImage]}
          />
          <Image 
            source={defaultProfiles[1]} 
            style={[styles.profileImage, styles.backProfileImage]}
          />
          <Image 
            source={defaultProfiles[0]} 
            style={[styles.profileImage, styles.frontProfileImage]}
          />
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          
          {/* 프로필 이미지 */}
          {renderProfileImages()}
          
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
  profileImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  singleProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  multipleProfilesContainer: {
    width: 140,
    height: 100,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#fff',
  },
  thirdProfileImage: {
    left: 40,
  },
  backProfileImage: {
    left: 20,
  },
  frontProfileImage: {
    left: 0,
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