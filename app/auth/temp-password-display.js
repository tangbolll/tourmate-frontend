import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TempPasswordDisplayScreen = () => {
  const router = useRouter();
  const { tempPassword } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>임시 비밀번호</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={styles.innerContainer}>
        <Text style={styles.instruction}>새로운 임시 비밀번호가 발급되었습니다.</Text>
        <View style={styles.passwordBox}>
          <Text style={styles.tempPasswordText}>{tempPassword}</Text>
        </View>
        <Text style={styles.instructionSmall}>이 임시 비밀번호로 로그인 후, 반드시 비밀번호를 변경해주세요.</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.buttonText}>로그인 화면으로</Text>
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
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instruction: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  passwordBox: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  tempPasswordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  instructionSmall: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TempPasswordDisplayScreen;