import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfileApi, updateUserProfileApi, checkNicknameApi } from '../../utils/ProfileApi';

const defaultProfile = require('../../assets/defaultProfile1.png');

const InputField = ({ label, value, onChangeText, placeholder, keyboardType, editable = true, feedback }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.inputDisabled]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      editable={editable}
    />
    {feedback ? <Text style={styles.errorText}>{feedback}</Text> : null}
  </View>
);

const ProfileEditScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [tags, setTags] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  
  // Feedback state
  const [nicknameFeedback, setNicknameFeedback] = useState('');
  const [formFeedback, setFormFeedback] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const data = await fetchUserProfileApi(userId);
          setUserData(data);
          setEmail(data.email || '');
          const fullName = `${data.lastname || ''}${data.firstname || ''}`;
          setName(fullName);
          setNickname(data.nickname || '');
          setTags(data.tags || []);
          setPhoneNumber(data.phoneNumber || '');
          setDob(data.dob || '');
          setGender(data.gender || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setFormFeedback({ message: '사용자 정보를 불러오는 데 실패했습니다.', type: 'error' });
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setNicknameFeedback('');
    setFormFeedback({ message: '', type: '' });

    try {
      if (userData && userData.nickname !== nickname) {
        const isDuplicate = await checkNicknameApi(nickname);
        if (isDuplicate) {
          setNicknameFeedback('중복되는 별명이어서 사용할 수 없습니다.');
          return;
        }
      }

      const userId = await AsyncStorage.getItem('userId');
      const updatedData = { nickname, tags };
      await updateUserProfileApi(userId, updatedData);
      
      setFormFeedback({ message: '프로필이 성공적으로 업데이트되었습니다.', type: 'success' });

    } catch (error) {
      console.error('Error updating profile:', error);
      setFormFeedback({ message: '프로필 업데이트에 실패했습니다.', type: 'error' });
    }
  };

  const handleDeleteAccount = () => {
    // Since Alert is not working, we use console.log
    console.log("회원탈퇴 버튼 클릭됨. 여기에 실제 탈퇴 로직(API 호출) 및 확인 절차를 추가해야 합니다.");
    // Example: router.push('/account/delete-confirm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.profileImageContainer}>
          <Image source={userData?.profileImage ? { uri: userData.profileImage } : defaultProfile} style={styles.profileImage} />
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>

        <InputField label="이메일" value={email} editable={false} />
        <InputField label="이름" value={name} editable={false} />
        <InputField label="별명" value={nickname} onChangeText={setNickname} placeholder="별명을 입력하세요" feedback={nicknameFeedback} />
        <InputField label="태그" value={tags.join(' ')} onChangeText={(text) => setTags(text.split(' '))} placeholder="태그를 입력하세요 (스페이스로 구분)" />
        <InputField label="휴대폰번호" value={phoneNumber} editable={false} />
        <InputField label="생년월일" value={dob} editable={false} />
        <InputField label="성별" value={gender} editable={false} />

        {formFeedback.message ? <Text style={[styles.formFeedbackText, formFeedback.type === 'success' ? styles.successText : styles.errorText]}>{formFeedback.message}</Text> : null}

        <View style={styles.deleteAccountContainer}>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <Text style={styles.deleteAccountText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveText: {
    fontSize: 16,
    color: '#42A5F5',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    flexGrow: 1, // Ensures the container can grow to allow footer positioning
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 110,
    backgroundColor: '#42A5F5',
    borderRadius: 15,
    padding: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#A0A0A0',
  },
  formFeedbackText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center'
  },
  successText: {
    color: '#42A5F5',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  deleteAccountContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  deleteAccountText: {
    fontSize: 12,
    color: '#9E9E9E',
    textDecorationLine: 'underline',
  }
});

export default ProfileEditScreen;
