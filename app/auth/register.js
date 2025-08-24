import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = 'http://localhost:8080';

const RegisterScreen = () => {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMismatchMessage, setPasswordMismatchMessage] = useState('');
  const [email, setEmail] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');

  const handleNext = () => {
    if (!lastname || !firstname || !email || !password || !confirmPassword || !phoneNumber) {
      Alert.alert('필수 정보 누락', '모든 필수 정보를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('비밀번호 불일치', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!emailChecked || !emailAvailable) {
      Alert.alert('이메일 확인 필요', '이메일 중복 확인을 해주세요.');
      return;
    }

    router.push({
      pathname: '/auth/register-details',
      params: { // Use params for URL parameters
        password,
        email,
        phoneNumber,
        firstname,
        lastname,
      },
    });
  };

  const handleEmailCheck = async () => {
    if (!email) {
      Alert.alert('이메일 입력', '이메일을 입력해주세요.');
      return;
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/check-email?email=${email}`);
      const isTaken = response.data;

      setEmailChecked(true);
      setEmailAvailable(!isTaken);
      setEmailCheckMessage(isTaken ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.');
    } catch (error) {
      console.error("Email check failed:", error.response?.data || error.message);
      setEmailChecked(false);
      setEmailAvailable(false);
      setEmailCheckMessage('이메일 확인 중 오류가 발생했습니다.');
      Alert.alert('오류', '이메일 확인 중 오류가 발생했습니다.');
    }
  };

  const isNextButtonDisabled = (
    !lastname ||
    !firstname ||
    !email ||
    !password ||
    !confirmPassword ||
    !phoneNumber ||
    password !== confirmPassword ||
    !emailChecked ||
    !emailAvailable
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> {/* Fixed header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원가입</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
        <View style={styles.form}> {/* Added marginTop to push content below header */}
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, styles.nameInputGroup]}>
              <Text style={styles.label}>성</Text>
              <TextInput
                style={styles.input}
                placeholder="성을 입력하세요"
                value={lastname}
                onChangeText={setLastname}
              />
            </View>

            <View style={[styles.inputGroup, styles.nameInputGroup]}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력하세요"
                value={firstname}
                onChangeText={setFirstname} // Fixed syntax error here
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.emailInputContainer}>
              <TextInput
                style={[styles.input, styles.emailInput]}
                placeholder="이메일 주소를 입력하세요"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailChecked(false);
                  setEmailAvailable(false);
                  setEmailCheckMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleEmailCheck}
                disabled={!email}
              >
                <Text style={styles.checkButtonText}>중복 확인</Text>
              </TouchableOpacity>
            </View>
            {emailCheckMessage ? (
              <Text style={[styles.emailMessage, emailAvailable ? styles.emailAvailable : styles.emailTaken]}>
                {emailCheckMessage}
              </Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>전화번호</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 01012345678"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (confirmPassword && text !== confirmPassword) {
                  setPasswordMismatchMessage('비밀번호가 일치하지 않습니다.');
                } else {
                  setPasswordMismatchMessage('');
                }
              }}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (password && text !== password) {
                  setPasswordMismatchMessage('비밀번호가 일치하지 않습니다.');
                } else {
                  setPasswordMismatchMessage('');
                }
              }}
              secureTextEntry
            />
            {passwordMismatchMessage ? (
              <Text style={styles.errorMessage}>{passwordMismatchMessage}</Text>
            ) : null}
          </View>

          {/* Next button moved outside ScrollView and fixed at bottom */}

        </View>
      </ScrollView>
      <View style={[styles.fixedBottomButton]}> {/* Wrapped in a View */}
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.registerButton, isNextButtonDisabled && styles.disabledButton]}
          disabled={isNextButtonDisabled}
        >
          <Text style={[styles.registerButtonText, isNextButtonDisabled && styles.disabledButtonText]}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1, // Ensure ScrollView takes remaining space
    paddingTop: 60, // Space for the absolute header (adjust as needed)
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
    fontWeight: 'bold',
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
    color: 'black', // Changed to black for debugging
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

export default RegisterScreen;
