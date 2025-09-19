import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const SettingsScreen = () => {
  const router = useRouter();
  const { performLogout } = useAuth(); // performLogout 함수 사용

  const [pushEnabled, setPushEnabled] = useState(true);
  const [accompanyEnabled, setAccompanyEnabled] = useState(true);
  const [myTourEnabled, setMyTourEnabled] = useState(true);
  const [postcardEnabled, setPostcardEnabled] = useState(true);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = confirm('현재 계정에서 로그아웃하시겠습니까?');
      if (confirmLogout) {
        performActualLogout();
      }
    } else {
      Alert.alert(
        '로그아웃',
        '현재 계정에서 로그아웃하시겠습니까?',
        [
          {
            text: '아니오',
            style: 'cancel',
          },
          {
            text: '네',
            onPress: performActualLogout,
          },
        ]
      );
    }
  };

  // 확인 후 실제 로그아웃 실행
  const performActualLogout = async () => {
    try {
      await performLogout();
      router.dismissAll();
      router.replace('/auth/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      if (Platform.OS === 'web') {
        alert('로그아웃에 실패했습니다.');
      } else {
        Alert.alert('오류', '로그아웃에 실패했습니다.');
      }
    }
  };

  const Section = ({ title, children }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ label, isNav, onPress }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <Text style={styles.itemLabel}>{label}</Text>
      {isNav && <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />}
    </TouchableOpacity>
  );

  const ToggleItem = ({ label, description, value, onValueChange }) => (
    <View style={styles.toggleItemContainer}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: '#E0E0E0', true: '#42A5F5' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor="#E0E0E0"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
  
  const ServiceItem = ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: '#9E9E9E', marginRight: 8 }}>{value}</Text>
        <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>환경설정</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView>
        <Section title="프로필 및 계정">
          <SettingItem label="프로필 및 계정 설정" isNav onPress={() => router.push('/profile/edit')} />
          <SettingItem label="비밀번호 변경" isNav onPress={() => router.push('/profile/change-password')} />
        </Section>

        <Section title="고객센터">
          <SettingItem label="공지사항" isNav onPress={() => router.push('/profile/notice')} />
          <SettingItem label="FAQ" isNav onPress={() => router.push('/profile/faq')} />
          <SettingItem label="고객센터 문의" isNav onPress={() => router.push('/profile/inquiry')} />
        </Section>
        
        <View style={styles.singleItemContainer}>
            <SettingItem label="약관 및 정책" isNav onPress={() => router.push('/profile/terms-and-policies')} />
        </View>
        
        <View style={styles.singleItemContainer}>
            <SettingItem label="로그아웃" onPress={handleLogout} />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginTop: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  singleItemContainer: {
    marginTop: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#616161',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemLabel: {
    fontSize: 16,
  },
  toggleItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  itemDescription: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
});

export default SettingsScreen;