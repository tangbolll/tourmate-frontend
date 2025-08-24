import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { checkNicknameApi } from '../../utils/ProfileApi';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = 'http://localhost:8080';

const RegisterDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Data from first registration page
  const { password, email, phoneNumber, firstname, lastname } = params;

  

  // States for second registration page
  const [nickname, setNickname] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
  const [gender, setGender] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  // const [tags, setTags] = useState(''); // Removed tags state
  // const [preference, setPreference] = useState(''); // Removed preference state

  const handleRegister = async () => {
    // Validate Year, Month, Day
    if (!year || !month || !day) {
      Alert.alert('생년월일 입력', '생년월일을 모두 입력해주세요.');
      return;
    }
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      Alert.alert('생년월일 오류', '생년월일은 숫자로만 입력해주세요.');
      return;
    }
    const dobText = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Calculate age from dobText
    const birthDate = new Date(dobText);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
    }

    // Validate Nickname and check duplication status
    if (!nicknameChecked || !nicknameAvailable) {
        Alert.alert('닉네임 확인 필요', '닉네임 중복 확인을 해주세요.');
        return;
    }

    try {
      const requestBody = {
        password,
        email,
        nickname,
        phoneNumber,
        firstname,
        lastname,
        gender,
        age: calculatedAge,
        // tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Removed tags from requestBody
        // preference: preference ? preference.split(',').map(pref => pref.trim()) : [], // Removed preference from requestBody
        dob: dobText,
      };

      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        Alert.alert("회원가입 성공", "성공적으로 회원가입되었습니다. 로그인 해주세요.");
        router.replace('/auth/login');
      } else {
        Alert.alert("회원가입 실패", "회원가입 중 오류가 발생했습니다.");
      }

    } catch (error) {
      console.error("Registration Failed:", error.response?.data || error.message);
      Alert.alert("회원가입 실패", `오류 발생: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleNicknameCheck = useCallback(async () => {
    if (!nickname) {
      Alert.alert('닉네임 입력', '닉네임을 입력해주세요.');
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
      Alert.alert('오류', '닉네임 확인 중 오류가 발생했습니다.');
    }
  }, [nickname]);

  // Determine if the Register button should be disabled
  const isRegisterButtonDisabled = (
    !nickname ||
    !gender ||
    !year ||
    !month ||
    !day ||
    !nicknameChecked ||
    !nicknameAvailable
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> {/* Fixed header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원 정보</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
        <View style={styles.form}>
          {/* Nickname input moved to top */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>별명</Text>
            <View style={styles.emailInputContainer}> {/* Reusing emailInputContainer for nickname check */}
              <TextInput
                style={[styles.input, styles.emailInput]}
                placeholder="별명을 입력하세요"
                value={nickname}
                onChangeText={(text) => {
                  setNickname(text);
                  setNicknameChecked(false);
                  setNicknameAvailable(false);
                  setNicknameCheckMessage('');
                }}
              />
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleNicknameCheck}
                disabled={!nickname}
              >
                <Text style={styles.checkButtonText}>중복 확인</Text>
              </TouchableOpacity>
            </View>
            {nicknameCheckMessage ? (
              <Text style={[styles.emailMessage, nicknameAvailable ? styles.emailAvailable : styles.emailTaken]}>
                {nicknameCheckMessage}
              </Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderSelectionContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'MALE' && styles.genderButtonSelected]}
                onPress={() => setGender('MALE')}
              >
                <Text style={[styles.genderButtonText, gender === 'MALE' && styles.genderButtonTextSelected]}>남</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'FEMALE' && styles.genderButtonSelected]}
                onPress={() => setGender('FEMALE')}
              >
                <Text style={[styles.genderButtonText, gender === 'FEMALE' && styles.genderButtonTextSelected]}>여</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date of Birth Input (Year, Month, Day) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>생년월일</Text>
            <View style={styles.dobInputContainer}>
              <TextInput
                style={[styles.input, styles.dobInput, { width: '40%' }]} // Adjusted width
                placeholder="년 (YYYY)"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
              />
              <TextInput
                style={[styles.input, styles.dobInput, { width: '25%' }]} // Adjusted width
                placeholder="월 (MM)"
                value={month}
                onChangeText={setMonth}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.dobInput, { width: '25%', marginRight: 0 }]} // Adjusted width and removed marginRight
                placeholder="일 (DD)"
                value={day}
                onChangeText={setDay}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>

          {/* Tags and Preference inputs removed */}

        </View>
      </ScrollView>
      {/* Register button moved outside ScrollView and fixed at bottom */}
      <View style={[styles.fixedBottomButton]}> {/* Wrapped in a View */}
        <TouchableOpacity
          onPress={handleRegister}
          style={[styles.registerButton, isRegisterButtonDisabled && styles.disabledButton]}
          disabled={isRegisterButtonDisabled}
        >
          <Text style={[styles.registerButtonText, isRegisterButtonDisabled && styles.disabledButtonText]}>가입</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Changed background color to match settings
  },
  scrollView: {
    flex: 1, // Ensure ScrollView takes remaining space
    paddingTop: 60, // Space for the absolute header
    paddingBottom: 80, // Space for the fixed bottom button
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    position: 'absolute', // Added for fixed header
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Ensure it's above content
  },
  backButton: {
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
  },
  form: {
    width: '100%',
    marginTop: 60, // Added marginTop to push content below header
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  registerButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    // Removed marginTop: 20, as it's now fixed
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#3498db',
    fontSize: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nameInputGroup: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  genderSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
    marginBottom: 10,
  },
  genderButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9',
  },
  genderButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailInput: {
    flex: 1,
    marginRight: 10,
  },
  checkButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailMessage: {
    marginTop: -10,
    marginBottom: 10,
    fontSize: 14,
    paddingLeft: 5,
  },
  emailAvailable: {
    color: 'green',
  },
  emailTaken: {
    color: 'red',
  },
  dobInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dobInput: {
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  disabledButtonText: {
    color: '#E0E0E0',
  },
  errorMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 5,
  },
  fixedBottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20, // Match screen padding
    paddingVertical: 10, // Adjust as needed
    backgroundColor: 'white', // Background for the fixed button area
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    zIndex: 1, // Ensure it's above content
  },
});

export default RegisterDetailsScreen;
