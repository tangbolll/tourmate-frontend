import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { fetchUserProfileApi, updateUserProfileApi, checkNicknameApi, uploadProfileImageApi } from '../../utils/ProfileApi';
import useUserStore from '../../context/userStore';

import { useAuth } from '../../context/AuthContext';

const defaultProfile = require('../../assets/defaultProfile1.png');

const InputField = ({ label, value, onChangeText, placeholder, keyboardType, editable = true, feedback, subLabel, labelComponent }) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {labelComponent}
    </View>
    <TextInput
      style={[styles.input, !editable && styles.inputDisabled]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={'gray'}
      keyboardType={keyboardType}
      editable={editable}
    />
    {subLabel ? <Text style={styles.inputSubLabel}>{subLabel}</Text> : null}
    {feedback ? <Text style={styles.errorText}>{feedback}</Text> : null}
  </View>
);

const ProfileEditScreen = () => {
  const router = useRouter();
  const { userData, setUserData } = useUserStore(); // Use Zustand store
  const [originalUserData, setOriginalUserData] = useState(null); // New state to store original data
  const [originalProfileImage, setOriginalProfileImage] = useState(null); // Add this line

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(false); // New state
  const [nicknameAvailable, setNicknameAvailable] = useState(false); // New state
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState(''); // New state
  const [tags, setTags] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  
  // Feedback state
  const [nicknameFeedback, setNicknameFeedback] = useState('');
  const [tagsFeedback, setTagsFeedback] = useState(''); // New state for tags feedback
  const [formFeedback, setFormFeedback] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const data = await fetchUserProfileApi(userId);
          console.log("Fetched user data:", data); // 이 줄 추가
          setUserData(data); // Update Zustand store
          setOriginalUserData(data); // Set original data
          setEmail(data.email || '');
          const fullName = `${data.lastname || ''}${data.firstname || ''}`;
          setName(fullName);
          setNickname(data.nickname || '');
          setTags(data.tags || []);
          setPhoneNumber(data.phoneNumber || '');
          setDob(data.dob || '');
          setGender(data.gender || '');
          setProfileImage(data.profileImage || null); // Set current profile image
          setOriginalProfileImage(data.profileImage || null); // Set original profile image
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
    setTagsFeedback(''); // Clear tags feedback
    setFormFeedback({ message: '', type: '' });

    try {
      // No need to check for nickname duplication here, it's handled by the check button
      // Ensure nickname is checked and available if it has changed
      if (originalUserData && originalUserData.nickname !== nickname) {
        if (!nicknameChecked || !nicknameAvailable) {
          setNicknameFeedback('닉네임 중복 확인을 해주세요.');
          return;
        }
      }

      // Validate tags
      const actualTags = tags.filter(tag => tag.trim() !== ''); // Filter non-empty tags for validation
      if (actualTags.length > 4) {
        setTagsFeedback('태그는 최대 4개까지 설정 가능합니다.');
        return;
      }

      const userId = await AsyncStorage.getItem('userId');
      let updatedProfileImageUrl = profileImage; // Assume no change or already a URL

      // Check if profileImage has changed and is a local URI (starts with 'file://')
      if (profileImage && (profileImage.startsWith('file://') || profileImage.startsWith('data:')) && profileImage !== originalProfileImage) {
        try {
          // Upload the new profile image to S3
          updatedProfileImageUrl = await uploadProfileImageApi(userId, profileImage);
          setProfileImage(updatedProfileImageUrl); // Update state with S3 URL
        } catch (uploadError) {
          console.error('Error uploading profile image:', uploadError);
          setFormFeedback({ message: '프로필 이미지 업로드에 실패했습니다.', type: 'error' });
          return; // Stop save process if upload fails
        }
      } else if (profileImage === null && originalProfileImage !== null) {
          // User explicitly removed profile image (set to null)
          updatedProfileImageUrl = null;
      }


      const updatedData = { nickname, tags: actualTags, profileImage: updatedProfileImageUrl }; // Use the S3 URL or null
      await updateUserProfileApi(userId, updatedData);
      // After successful update, fetch the latest user data and update the store
      const updatedUserData = await fetchUserProfileApi(userId);
      setUserData(updatedUserData); // Update Zustand store with latest data
      setOriginalUserData(updatedUserData); // Update original data to reflect saved changes
      
      setFormFeedback({ message: '프로필이 성공적으로 업데이트되었습니다.', type: 'success' });

      // 알림창 추가
      if (Platform.OS === 'web') {
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        Alert.alert('업데이트 완료', '프로필이 성공적으로 업데이트되었습니다.');
      }

      setNicknameCheckMessage(''); // Clear nickname check message after successful save

    } catch (error) {
      console.error('Error updating profile:', error);
      setFormFeedback({ message: '프로필 업데이트에 실패했습니다.', type: 'error' });
      // 에러 알림도 추가
      if (Platform.OS === 'web') {
        alert('프로필 업데이트에 실패했습니다.');
      } else {
        Alert.alert('업데이트 실패', '프로필 업데이트에 실패했습니다.');
      }
    }
  };

  const handleDeleteAccount = () => {
    router.push('/profile/delete-account/step1'); // 첫 번째 탈퇴 화면으로 이동
  };

  const handleNicknameCheck = useCallback(async () => {
    if (!nickname) {
      setNicknameCheckMessage('닉네임을 입력해주세요.');
      setNicknameChecked(false);
      setNicknameAvailable(false);
      return;
    }

    // Check if the nickname is the user's current nickname
    if (originalUserData && nickname === originalUserData.nickname) {
      setNicknameCheckMessage('현재 사용 중인 별명입니다.');
      setNicknameChecked(true);
      setNicknameAvailable(true);
      return;
    }

    try {
      const isDuplicate = await checkNicknameApi(nickname);
      setNicknameChecked(true);
      setNicknameAvailable(!isDuplicate);
      setNicknameCheckMessage(isDuplicate ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.');
    } catch (error) {
      console.error("Nickname check failed:", error.response?.data || error.message);
      setNicknameChecked(false);
      setNicknameAvailable(false);
      setNicknameCheckMessage('닉네임 확인 중 오류가 발생했습니다.');
      // Alert.alert('오류', '닉네임 확인 중 오류가 발생했습니다.'); // Removed Alert as per previous instructions
    }
  }, [nickname]);

  const pickImage = async () => {
    // Request camera roll permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '프로필 사진을 변경하려면 사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setProfileImage(selectedImageUri);
      // TODO: Call backend API to upload the image
      console.log('Selected image URI:', selectedImageUri);
      // Example: await uploadProfileImageApi(selectedImageUri);
    }
  };

  // Check if there are any changes
  const canSave = useMemo(() => {
    if (!originalUserData) return false; // No original data yet

    const originalNickname = originalUserData.nickname || '';
    const originalTags = originalUserData.tags ? JSON.stringify(originalUserData.tags) : '[]';
    const currentTags = JSON.stringify(tags.filter(tag => tag.trim() !== ''));
    const originalImg = originalProfileImage || null; // Get original image
    const currentImg = profileImage || null; // Get current image

    const nicknameHasChanged = originalNickname !== nickname;
    const tagsHaveChanged = originalTags !== currentTags;
    const profileImageHasChanged = originalImg !== currentImg; // Check image change

    // If nickname changed, it must be checked and available
    if (nicknameHasChanged && (!nicknameChecked || !nicknameAvailable)) {
      return false;
    }

    // If nickname hasn't changed, but tags or profile image have, it's savable
    if (!nicknameHasChanged && (tagsHaveChanged || profileImageHasChanged)) {
      return true;
    }

    // If nickname has changed and is valid, and tags or profile image may or may not have changed, it's savable
    if (nicknameHasChanged && nicknameChecked && nicknameAvailable) {
      return true;
    }

    // If only profile image has changed, it's savable
    if (!nicknameHasChanged && !tagsHaveChanged && profileImageHasChanged) {
        return true;
    }

    return false; // No changes or invalid state
  }, [nickname, tags, originalUserData, nicknameChecked, nicknameAvailable, profileImage, originalProfileImage]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        {canSave ? ( // Conditionally render save button or a placeholder
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>저장</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.saveButtonPlaceholder} /> // Placeholder to maintain spacing
        )}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
          <Image source={profileImage ? { uri: profileImage } : defaultProfile} style={styles.profileImage} />
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>

        <InputField label="이메일" value={email} editable={false} />
        <InputField label="이름" value={name} editable={false} />
        <View style={styles.inputContainer}>
          <Text style={styles.label}>별명</Text>
          <View style={styles.nicknameInputContainer}>
            <TextInput
              style={[styles.input, styles.nicknameInput, nicknameFeedback && styles.inputError]} // Apply error style if feedback exists
              value={nickname}
              onChangeText={(text) => {
                setNickname(text);
                setNicknameChecked(false);
                setNicknameAvailable(false);
                setNicknameCheckMessage('');
              }}
              placeholder="별명을 입력하세요"
              placeholderTextColor={'gray'}
            />
            <TouchableOpacity
              style={[styles.checkButtonInside, !nickname && styles.disabledCheckButton]}
              onPress={handleNicknameCheck}
              disabled={!nickname}
              activeOpacity={0.7}
            >
              <Text style={styles.checkButtonInsideText}>중복 확인</Text>
            </TouchableOpacity>
          </View>
          {nicknameCheckMessage ? (
            <Text style={[styles.emailMessage, nicknameAvailable ? styles.emailAvailable : styles.emailTaken]}>
              {nicknameCheckMessage}
            </Text>
          ) : null}
          {nicknameFeedback ? <Text style={styles.errorText}>{nicknameFeedback}</Text> : null}
        </View>
        <InputField
          label="태그"
          labelComponent={<Text style={styles.tagLimitText}>최대 4개까지 설정 가능</Text>} // New label component
          value={tags.join(' ')}
          onChangeText={(text) => {
            const newTags = text.split(' '); // Keep empty strings for now
            setTags(newTags); // Update the state with all parts, including empty ones

            // Validation for max 4 tags should be based on non-empty tags
            const actualTags = newTags.filter(tag => tag.trim() !== '');
            if (actualTags.length > 4) {
              setTagsFeedback('태그는 최대 4개까지 설정 가능합니다.');
            } else {
              setTagsFeedback('');
            }
          }}
          placeholder="#무계획형 #모험형 #지식추구형 #활동형" // Updated placeholder
          subLabel="태그할 키워드를 띄어쓰기로 구분해주세요." // New subLabel
          feedback={tagsFeedback}
        />
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
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagLimitText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
  },
  inputSubLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    paddingLeft: 4,
  },
  saveButtonPlaceholder: {
    width: 40, // Approximate width of the "저장" text
  },
  // New styles for nickname input with button inside
  nicknameInputContainer: {
    flexDirection: 'row', // To place button next to input
    alignItems: 'center',
    position: 'relative', // For absolute positioning of button
  },
  nicknameInput: {
    flex: 1, // Take up available space
    paddingRight: 100, // Space for the button
  },
  checkButtonInside: {
    position: 'absolute',
    right: 8,
    backgroundColor: 'black', // Changed to black
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonInsideText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledCheckButton: {
    backgroundColor: '#B1B1B1', // Gray for disabled
  },
  emailMessage: {
    marginTop: 4,
    fontSize: 12,
    paddingLeft: 4,
  },
  emailAvailable: {
    color: 'green',
  },
  emailTaken: {
    color: 'red',
  },
  inputError: { // Style for input when there's an error feedback
    borderColor: 'red',
  },
});

export default ProfileEditScreen;