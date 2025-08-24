import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useRouter } from 'expo-router';

const BACKEND_URL = 'http://localhost:8080'; // Your backend URL

const RegisterScreen = () => {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailChecked, setEmailChecked] = useState(false); // New state
  const [emailAvailable, setEmailAvailable] = useState(false); // New state
  const [emailCheckMessage, setEmailCheckMessage] = useState(''); // New state
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [tags, setTags] = useState('');
  const [preference, setPreference] = useState('');

  const handleRegister = async () => {
    // Add this check
    if (!emailChecked || !emailAvailable) {
      Alert.alert('이메일 확인 필요', '이메일 중복 확인을 해주세요.');
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
        age: age ? parseInt(age) : null,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        preference: preference ? preference.split(',').map(pref => pref.trim()) : [],
      };

      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, requestBody);

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

  const handleEmailCheck = async () => {
    if (!email) {
      Alert.alert('이메일 입력', '이메일을 입력해주세요.');
      return;
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/check-email?email=${email}`);
      const isTaken = response.data; // Backend returns boolean

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>새로운 계정을 만들어보세요</Text>
        </View>

        <View style={styles.form}>
          

          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.emailInputContainer}> {/* New container for input and button */}
              <TextInput
                style={[styles.input, styles.emailInput]} // Add emailInput style
                placeholder="이메일 주소를 입력하세요"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailChecked(false); // Reset check status on change
                  setEmailAvailable(false);
                  setEmailCheckMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleEmailCheck} // New handler
                disabled={!email} // Disable if email is empty
              >
                <Text style={styles.checkButtonText}>중복 확인</Text>
              </TouchableOpacity>
            </View>
            {emailCheckMessage ? ( // Display message if exists
              <Text style={[styles.emailMessage, emailAvailable ? styles.emailAvailable : styles.emailTaken]}>
                {emailCheckMessage}
              </Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChangeText={setNickname}
            />
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

          <View style={styles.nameRow}> {/* New style for horizontal layout */}
            <View style={[styles.inputGroup, styles.nameInputGroup]}> {/* Apply flex to individual input groups */}
              <Text style={styles.label}>성</Text>
              <TextInput
                style={styles.input}
                placeholder="성을 입력하세요"
                value={lastname}
                onChangeText={setLastname}
              />
            </View>

            <View style={[styles.inputGroup, styles.nameInputGroup]}> {/* Apply flex to individual input groups */}
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력하세요"
                value={firstname}
                onChangeText={setFirstname}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderSelectionContainer}> {/* New container for gender buttons */}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>나이</Text>
            <TextInput
              style={styles.input}
              placeholder="나이를 입력하세요"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          

          <View style={styles.inputGroup}>
            <Text style={styles.label}>태그</Text>
            <TextInput
              style={styles.input}
              placeholder="쉼표로 구분하여 입력하세요"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>선호도</Text>
            <TextInput
              style={styles.input}
              placeholder="쉼표로 구분하여 입력하세요"
              value={preference}
              onChangeText={setPreference}
            />
          </View>

          <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>회원가입</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>이미 계정이 있으신가요? 로그인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
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
    marginTop: 20,
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
    marginBottom: 15, // Adjust as needed
  },
  emailInput: {
    flex: 1, // Take up remaining space
    marginRight: 10, // Space between input and button
  },
  checkButton: {
    backgroundColor: '#28a745', // Green color for check button
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100, // Ensure button has a minimum width
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailMessage: {
    marginTop: -10, // Adjust to position below input
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
});

export default RegisterScreen;
