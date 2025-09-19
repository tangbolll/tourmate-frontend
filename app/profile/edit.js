import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { fetchUserProfileApi, updateUserProfileApi, checkNicknameApi, uploadProfileImageApi } from '../../utils/ProfileApi';
import useUserStore from '../../context/userStore';

import { useAuth } from '../../context/AuthContext';

const defaultProfile = require('../../assets/defaultprofile.png');

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
  const params = useLocalSearchParams(); 

  const { userData, setUserData } = useUserStore(); // Use Zustand store
  const [originalUserData, setOriginalUserData] = useState(null); // New state to store original data
  const [originalProfileImage, setOriginalProfileImage] = useState(null); // Add this line

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(true); // New state
  const [nicknameAvailable, setNicknameAvailable] = useState(true); // New state
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState(''); // New state

  const [tagInput, setTagInput] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  
  // Feedback state
  const [nicknameFeedback, setNicknameFeedback] = useState('');
  const [tagsFeedback, setTagsFeedback] = useState(''); // New state for tags feedback
  const [formFeedback, setFormFeedback] = useState({ message: '', type: '' });

  const [isTagInputFocused, setIsTagInputFocused] = useState(false);

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

          if (params.initialTags) {
              // 전달받은 JSON 문자열을 다시 배열로 변환합니다.
              const parsedTags = JSON.parse(params.initialTags); 
              // 배열을 띄어쓰기로 구분된 문자열로 만들어 state에 설정합니다.
              setTagInput(parsedTags.join(' ')); 
              console.log("✅ 테스트 결과 태그를 적용했습니다:", parsedTags);
          } else {
              // 파라미터가 없으면, 기존 프로필의 태그를 설정합니다.
              setTagInput((data.tags || []).join(' '));
          }

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
      const finalTags = tagInput.split(/\s+/).map(tag => tag.trim()).filter(Boolean);

      if (finalTags.length > 4) {
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


      const updatedData = { nickname, tags: finalTags, profileImage: updatedProfileImageUrl };
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
      if (!originalUserData) return false;

      // 1. 원본 태그 데이터를 띄어쓰기로 구분된 문자열로 만듭니다.
      const originalTagsString = (originalUserData.tags || []).join(' ');

      // 2. 현재 입력된 태그 문자열을 앞뒤 공백 제거하여 비교 준비를 합니다.
      const currentTagsString = tagInput.trim();

      const nicknameHasChanged = (originalUserData.nickname || '') !== nickname;
      // 3. 문자열 대 문자열로 직접 비교합니다.
      const tagsHaveChanged = originalTagsString !== currentTagsString;
      const profileImageHasChanged = (originalProfileImage || null) !== (profileImage || null);

      // 변경 사항이 하나도 없으면 저장 불가
      if (!nicknameHasChanged && !tagsHaveChanged && !profileImageHasChanged) {
          return false;
      }

      // 닉네임이 변경되었다면, 반드시 중복 확인을 통과해야 함
      if (nicknameHasChanged && (!nicknameChecked || !nicknameAvailable)) {
          return false;
      }
      
      // 태그 개수 제한을 초과하면 저장 불가
      const currentTagsArray = currentTagsString.split(/\s+/).filter(Boolean);
      if (currentTagsArray.length > 4) {
          return false;
      }

      // 위의 모든 조건을 통과하면 저장 가능
      return true;
      // 4. 의존성 배열에 'tags' 대신 'tagInput'을 넣습니다.
  }, [nickname, tagInput, profileImage, originalUserData, nicknameChecked, nicknameAvailable, originalProfileImage]);

  const displayTags = useMemo(() => tagInput.split(/\s+/).filter(Boolean), [tagInput]);

  return (
    <View style={styles.container}>
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
          <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                  <Text style={styles.label}>태그</Text>
                  <Text style={styles.tagLimitText}>최대 4개까지 설정 가능</Text>
              </View>
              
              {/* isTagInputFocused 상태에 따라 UI를 다르게 보여줍니다. */}
              {isTagInputFocused ? (
                  // 1. 입력 모드 (포커스 되었을 때)
                  <TextInput
                      style={styles.input}
                      value={tagInput}
                      placeholder="#무계획형 #모험형 #지식추구형 #활동형"
                      placeholderTextColor={'gray'}
                      autoFocus={true} // 이 컴포넌트가 나타날 때 자동으로 키보드를 엽니다.
                      onChangeText={(text) => {
                          setTagInput(text);
                          const currentTags = text.split(/\s+/).filter(Boolean);
                          if (currentTags.length > 4) {
                              setTagsFeedback('태그는 최대 4개까지 설정 가능합니다.');
                          } else {
                              setTagsFeedback('');
                          }
                      }}
                      // 포커스를 잃으면 '보기 모드'로 전환합니다.
                      onBlur={() => setIsTagInputFocused(false)} 
                  />
              ) : (
                  // 2. 보기 모드 (포커스가 없을 때)
                  <TouchableOpacity 
                      style={[styles.input, styles.tagDisplayContainer]}
                      onPress={() => setIsTagInputFocused(true)} // 이 영역을 누르면 '입력 모드'로 전환합니다.
                  >
                      {displayTags.length > 0 ? (
                          // 태그가 있으면 칩으로 만들어서 보여줍니다.
                          displayTags.map((tag, index) => (
                              <View key={index} style={styles.tagChip}>
                                  <Text style={styles.tagChipText}>#{tag}</Text>
                              </View>
                          ))
                      ) : (
                          // 태그가 없으면 플레이스홀더를 보여줍니다.
                          <Text style={styles.tagPlaceholder}>#무계획형 #모험형 #지식추구형 #활동형</Text>
                      )}
                  </TouchableOpacity>
              )}
              <Text style={styles.inputSubLabel}>태그할 키워드를 띄어쓰기로 구분해주세요.</Text>
              {tagsFeedback ? <Text style={styles.errorText}>{tagsFeedback}</Text> : null}
        </View>
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
    </View>
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
    flexGrow: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 24,
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
  tagDisplayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tagChip: {
      backgroundColor: '#F0F0F0',
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginRight: 6,
      marginBottom: 6,
  },
  tagChipText: {
      color: '#333',
      fontSize: 14,
  },
  tagPlaceholder: {
      color: 'gray',
      fontSize: 16,
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
    // ✅ 수정된 부분: 이중 간격을 유발하던 marginBottom을 삭제
  },
  tagLimitText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
    transform: [{ translateY: -2 }], 
  },
  inputSubLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    paddingLeft: 4,
  },
  saveButtonPlaceholder: {
    width: 40,
  },
  nicknameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  nicknameInput: {
    flex: 1,
    paddingRight: 100,
  },
  checkButtonInside: {
    position: 'absolute',
    right: 8,
    backgroundColor: 'black',
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
    backgroundColor: '#B1B1B1',
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
  inputError: {
    borderColor: 'red',
  },
});


export default ProfileEditScreen;