import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const SettingsScreen = () => {
  const router = useRouter();
  const { signOut } = useAuth(); // useAuth 훅으로 signOut 함수를 가져옵니다.

  const [pushEnabled, setPushEnabled] = useState(true);
  const [accompanyEnabled, setAccompanyEnabled] = useState(true);
  const [myTourEnabled, setMyTourEnabled] = useState(true);
  const [postcardEnabled, setPostcardEnabled] = useState(true);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    signOut();
    // 로그아웃 후 로그인 화면으로 이동하거나 앱의 초기 화면으로 리디렉션 할 수 있습니다.
    // 예: router.replace('/login');
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
    <SafeAreaView style={styles.container}>
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

        {/*
        <Section title="알림설정">
          <ToggleItem
            label="앱 푸쉬알림"
            description="앱의 모든 알람을 푸쉬알림으로 받을 수 있어요"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <ToggleItem
            label="동행 소식 알림"
            description="동행 신청 및 신청 결과에 대한 알림을 받을 수 있어요"
            value={accompanyEnabled}
            onValueChange={setAccompanyEnabled}
          />
          <ToggleItem
            label="내여행 소식 알림"
            description="내여행 동반자 초대에 대한 알림을 받을 수 있어요"
            value={myTourEnabled}
            onValueChange={setMyTourEnabled}
          />
          <ToggleItem
            label="여행 엽서 소식 알림"
            description="여행 엽서 좋아요 및 저장에 대한 알림을 받을 수 있어요"
            value={postcardEnabled}
            onValueChange={setPostcardEnabled}
          />
        </Section>
        */}

        {/*
        <Section title="서비스 설정">
            <ServiceItem label="위치 서비스" value="앱 사용 중 허용" onPress={() => {}} />
        </Section>
        */}

        <Section title="고객센터">
          <SettingItem label="공지사항" isNav onPress={() => router.push('/profile/notice')} />
          <SettingItem label="FAQ" isNav onPress={() => router.push('/profile/faq')} />
          {/* 여기를 수정했습니다. */}
          <SettingItem label="고객센터 문의" isNav onPress={() => router.push('/profile/inquiry')} />
        </Section>
        
        <View style={styles.singleItemContainer}>
            <SettingItem label="약관 및 정책" isNav onPress={() => router.push('/profile/terms-and-policies')} />
        </View>
        
        <View style={styles.singleItemContainer}>
            <SettingItem label="로그아웃" onPress={handleLogout} />
        </View>

      </ScrollView>
    </SafeAreaView>
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