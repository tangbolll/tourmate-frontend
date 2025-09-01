import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { checkEmailApi, resetPasswordNoEmailApi } from '../../utils/ProfileApi';

const PasswordResetScreen = () => {
  const [email, setEmail] = useState('');
  const [emailExistenceMessage, setEmailExistenceMessage] = useState('');
  const [isEmailExist, setIsEmailExist] = useState(false);
  const router = useRouter();

  const handleNext = async () => {
    if (!email) {
      Alert.alert('이메일 입력', '이메일을 입력해주세요.');
      return;
    }

    // 보안 경고: 이 방식은 보안상 매우 취약합니다. 임시 비밀번호를 화면에 직접 표시하는 것은
    // 기기에 접근할 수 있는 누구든지 계정에 접근할 수 있게 만듭니다. 실제 서비스에서는
    // 비밀번호 재설정 링크를 이메일로 보내는 방식을 사용해야 합니다.
    try {
      const newPassword = await resetPasswordNoEmailApi(email);
      router.push({
        pathname: '/auth/temp-password-display',
        params: { tempPassword: newPassword },
      });
    } catch (error) {
      Alert.alert('비밀번호 재설정 실패', error.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>비밀번호 재설정</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.emailInputContainer}>
              <TextInput
                style={styles.emailInput}
                placeholder="이메일 주소를 입력하세요"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.checkButtonInside}
                onPress={async () => {
                  if (!email) {
                    Alert.alert('이메일 입력', '이메일을 입력해주세요.');
                    return;
                  }
                  console.log('확인 버튼 클릭됨. 입력된 이메일:', email);

                  try {
                    const isTaken = await checkEmailApi(email);
                    console.log('이메일 존재 여부 (isTaken):', isTaken);
                    setIsEmailExist(isTaken);
                    if (!isTaken) {
                      setEmailExistenceMessage('이메일이 존재하지 않습니다.');
                    } else {
                      setEmailExistenceMessage('이메일이 확인되었습니다.');
                    }
                  } catch (error) {
                    console.error("Email check failed:", error.message);
                    setIsEmailExist(false);
                    setEmailExistenceMessage('이메일 확인 중 오류가 발생했습니다.');
                    Alert.alert('오류', error.message);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.checkButtonInsideText}>확인</Text>
              </TouchableOpacity>
            </View>
            {emailExistenceMessage ? (
              <Text style={[styles.emailExistenceMessage, !isEmailExist ? styles.emailDoesNotExist : styles.emailExists]}>
                {emailExistenceMessage}
              </Text>
            ) : null}
            <Text style={styles.smallInstruction}>로그인 시 사용한 이메일을 입력해주세요.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedBottomButton}>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.button, !isEmailExist && styles.disabledButton]}
          disabled={!isEmailExist}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, !isEmailExist && styles.disabledButtonText]}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  form: {
    width: '100%',
  },
  instruction: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: 'black',
  },
  smallInstruction: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'left',
    paddingLeft: 15,
  },
  emailExistenceMessage: {
    fontSize: 14,
    marginTop: 5,
    paddingLeft: 15,
  },
  emailDoesNotExist: {
    color: 'red',
  },
  emailExists: {
    color: 'blue',
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
    backgroundColor: 'white',
    color: '#000',
  },
  // New styles for email input with button inside
  emailInputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  emailInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 100, // Space for the button
    fontSize: 16,
    backgroundColor: 'white',
    color: '#000',
  },
  checkButtonInside: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -15 }], // Half of button height
    backgroundColor: 'gray',
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
  fixedBottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#B1B1B1',
  },
  disabledButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PasswordResetScreen;