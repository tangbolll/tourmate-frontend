import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { changePasswordApi } from '../../utils/ProfileApi';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMismatchMessage, setPasswordMismatchMessage] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('필수 정보 누락', '모든 비밀번호 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('비밀번호 불일치', '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    // TODO: Add validation for new password strength

    try {
      await changePasswordApi(currentPassword, newPassword); // Call API
      Alert.alert('비밀번호 변경 성공', '비밀번호가 성공적으로 변경되었습니다.');
      router.back(); // Go back to settings
    } catch (error) {
      Alert.alert('비밀번호 변경 실패', error.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  const isChangeButtonDisabled = (
    !currentPassword ||
    !newPassword ||
    !confirmNewPassword ||
    newPassword !== confirmNewPassword
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>비밀번호 변경</Text>
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
            <Text style={styles.label}>현재 비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="현재 비밀번호를 입력하세요"
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>새 비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 입력하세요"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (confirmNewPassword && text !== confirmNewPassword) {
                  setPasswordMismatchMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
                } else {
                  setPasswordMismatchMessage('');
                }
              }}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>새 비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 다시 입력하세요"
              placeholderTextColor="#999"
              value={confirmNewPassword}
              onChangeText={(text) => {
                setConfirmNewPassword(text);
                if (newPassword && text !== newPassword) {
                  setPasswordMismatchMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
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
        </View>
      </ScrollView>

      <View style={styles.fixedBottomButton}>
        <TouchableOpacity
          onPress={handleChangePassword}
          style={[styles.button, isChangeButtonDisabled && styles.disabledButton]}
          disabled={isChangeButtonDisabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, isChangeButtonDisabled && styles.disabledButtonText]}>변경</Text>
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

export default ChangePasswordScreen;