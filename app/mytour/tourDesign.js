import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SearchRegionHeader from '../../components/mytour/createItinerary/SearchRegionHeader';
import SelectedRegions from '../../components/mytour/createItinerary/SelectedRegions';
import AllAreaToggle from '../../components/mytour/createItinerary/AllAreaToggle';
import CreateItineraryButton from '../../components/mytour/createItinerary/CreateItineraryButton';

const TourDesign = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedRegions, setSelectedRegions] = useState([]); // 선택 지역 상태

  const handleSearchChange = (text) => setSearchText(text);
  const handleBack = () => router.back();

  const handleRegionSelect = (key, country, regionName, code, parentCode) => {
    setSelectedRegions(prev => {
        // ❗️ 1. 비교할 때 parentCode도 함께 확인합니다.
        const exists = prev.find(r => r.code === code && r.parentCode === parentCode);

        if (exists) {
            // ❗️ 2. 제거할 때도 parentCode를 함께 확인하여 정확도를 높입니다.
            return prev.filter(r => !(r.code === code && r.parentCode === parentCode));
        } else {
            // 추가하는 로직은 기존과 동일합니다.
            return [...prev, { key, country, name: regionName, code, parentCode }];
        }
    });
};

  const handleRemoveRegion = (regionKey) => {
    setSelectedRegions(prev => prev.filter(r => r.key !== regionKey));
  };

  // 선택 완료 → CreateItinerary로 이동
  const handleNext = () => {
    console.log('선택된 지역:', selectedRegions); // ← 여기에서 선택된 지역 확인
    router.push({
      pathname: './createItinerary',
      params: {
        selectedRegions: JSON.stringify(selectedRegions),
        currentTitle: '',  // 초기 제목 필요시
        currentPeriod: '', // 초기 기간 필요시
      },
    });
  };

  const isNextButtonActive = selectedRegions.length > 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <SearchRegionHeader
          searchText={searchText}
          onSearchChange={handleSearchChange}
          onBack={handleBack}
        />

        <View style={styles.contentContainer}>
          {selectedRegions.length > 0 && (
            <SelectedRegions
              selectedRegions={selectedRegions}
              onRemoveRegion={handleRemoveRegion}
            />
          )}

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <AllAreaToggle
              onRegionSelect={handleRegionSelect}
              selectedRegions={selectedRegions}
            />
          </ScrollView>
        </View>

        <View style={styles.floatingButtonContainer}>
          <CreateItineraryButton
            isActive={isNextButtonActive}
            onPress={handleNext}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { flex: 1 },
  scrollContent: { flex: 1 },
  floatingButtonContainer: { padding: 20, backgroundColor: '#f9fafb' },
});

export default TourDesign;
