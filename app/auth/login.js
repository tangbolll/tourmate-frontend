import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView, View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { handleLoginApi } from '../../utils/ProfileApi';

const LoginScreen = () => {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="gray"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="gray"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
            onPress={async () => { // Make it async
              const result = await handleLoginApi(email, password); // Await the result
              if (result.success) {
                await signIn(result.token, result.userId); // Call signIn with token and userId
                router.replace('/'); // Navigate to home screen
              } else {
                Alert.alert("로그인 실패", result.message); // Show error message
              }
            }}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => alert("기능 준비중입니다.\n관리자에게 문의 주시면 신속한 도움 드리겠습니다.\n불편을 드려 죄송합니다.") /*router.push('/auth/password-reset')*/}>
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}>l</Text>
          <TouchableOpacity onPress={() => router.push('/auth/terms-agreement')}>
            <Text style={styles.linkText}>회원가입</Text>
          </TouchableOpacity>
        </View>
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
  logo: {
    width: 200,
    height: 160,
    marginBottom: -30,
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
    color: 'black',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'black',
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
    color: 'black',
    fontSize: 14,
  },
  linksContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: 'black',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    color: 'black',
    fontSize: 14,
    marginHorizontal: 8,
  },
});

export default LoginScreen;