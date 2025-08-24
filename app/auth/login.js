import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView, View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = 'http://localhost:8080'; // Your backend URL

const LoginScreen = () => {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
        return;
    }

    try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email,
            password,
        });

        if (response.status === 200 && response.data.token) {
            const { token, userId } = response.data;
            await signIn(token, userId);
            Alert.alert('성공', '로그인되었습니다.');
        } else {
            Alert.alert('로그인 실패', '서버에서 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error("Login Failed:", error.response?.data || error.message);
        Alert.alert('로그인 실패', `이메일 또는 비밀번호가 일치하지 않습니다.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>TourMate</Text>
        <Text style={styles.subtitle}>로그인하여 여행을 시작하세요</Text>
        
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/auth/register')}
          style={styles.registerButton}
        >
          <Text style={styles.registerButtonText}>일반 회원가입</Text>
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
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
  },
  registerButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
});

export default LoginScreen;
