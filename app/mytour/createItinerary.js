import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CompleteButton from '../../components/mytour/createItinerary/CompleteButton';
import ItineraryTitleInput from '../../components/mytour/createItinerary/ItineraryTitleInput';
import TourPlace from '../../components/mytour/createItinerary/TourPlace';
import TourPeriod from '../../components/mytour/createItinerary/TourPeriod';
import Constants from 'expo-constants';

const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
  } else {
    return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
  }
};

const API_URL = getBaseURL();

export default function CreateItinerary() {
  const router = useRouter();
  const { selectedRegions, currentTitle, currentPeriod } = useLocalSearchParams();

  const regions = selectedRegions ? JSON.parse(selectedRegions) : [];

  const [itineraryTitle, setItineraryTitle] = useState(currentTitle || '');
  const [periodData, setPeriodData] = useState(
    currentPeriod ? JSON.parse(currentPeriod) : { type: 'date', startDate: '', endDate: '', nights: '', days: '' }
  );

  const handleBack = () => router.back();

  const getTitle = () => {
    if (regions.length === 1) return `${regions[0].name} 여행`;
    const firstCity = regions[0].name;
    const remainingCount = regions.length - 1;
    return `${firstCity} 외 ${remainingCount}개 지역 여행`;
  };

  const handleTitleChange = (title) => setItineraryTitle(title);
  const handlePeriodChange = (data) => setPeriodData(data);

  const handleCompletePress = async () => {
    console.log("현재 선택된 regions state:", regions); // 데이터 확인용 로그

    try {
        // 숫자로 변환
        const selectedAreaCodes = [...new Set(regions.map(r => Number(r.parentCode)))];
        const selectedSigunguCodes = regions.map(r => Number(r.code));

        // 이름 배열
        const selectedAreaNames = selectedAreaCodes.map(code => {
            const regionObject = regions.find(r => Number(r.parentCode) === code);
            return regionObject ? regionObject.country : '';
        });
        const selectedSigunguNames = regions.map(r => r.name);


        // 날짜 처리: 빈 문자열이면 null
        const startDate = periodData.startDate?.trim() ? periodData.startDate : null;
        const endDate = periodData.endDate?.trim() ? periodData.endDate : null;
        const nightCount = periodData.nights ? Number(periodData.nights) : null;
        const dayCount = periodData.days ? Number(periodData.days) : null;

        const payload = {
        title: itineraryTitle || getTitle(),
        areaCode: selectedAreaCodes,
        sigunguCode: selectedSigunguCodes,
        periodType: periodData.type === 'date' ? 1 : 2,
        areaName: selectedAreaNames,
        sigunguName: selectedSigunguNames,
        startDate,
        endDate,
        nightCount,
        dayCount,
        ownerId: 1 // 로그인 사용자 ID
        };

        console.log('서버 전송 payload:', payload);

        const response = await fetch(`${API_URL}/api/myTour/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
        });

        if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`저장 실패: ${errorText}`);
        }

        const data = await response.json();
        console.log('저장 완료:', data);
        alert('여행 일정 저장 성공!');
        
        router.push({
        pathname: './designItinerary',
        params: {
            selectedRegions: JSON.stringify(regions),
            itineraryTitle: itineraryTitle || getTitle(),
            periodData: JSON.stringify(periodData)
        }
        });

    } catch (error) {
        console.error('저장 오류:', error);
        alert('여행 일정 저장에 실패했습니다.');
    }
    };



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.headerDivider} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <ItineraryTitleInput placeholder={getTitle()} onTitleChange={handleTitleChange} />
        <TourPlace selectedRegion={regions} />
        <TourPeriod onPeriodChange={handlePeriodChange} />
      </ScrollView>

      <CompleteButton title="작성 완료" onPress={handleCompletePress} closed={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: 'black' },
  headerSpacer: { width: 32 },
  headerDivider: { height: 1, backgroundColor: '#E5E5E5' },
  content: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 16 },
});
