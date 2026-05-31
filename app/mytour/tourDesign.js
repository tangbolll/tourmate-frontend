import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SearchRegionHeader from '../../components/mytour/createItinerary/SearchRegionHeader';
import SelectedRegions from '../../components/mytour/createItinerary/SelectedRegions';
import AllAreaToggle from '../../components/mytour/createItinerary/AllAreaToggle';
import ApplicationButton from '../../components/mytour/createItinerary/CompleteButton';

const TourDesign = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [selectedRegions, setSelectedRegions] = useState([]);

    const handleSearchChange = (text) => setSearchText(text);
    const handleBack = () => router.back();

    const handleRegionSelect = (key, country, regionName, code, parentCode) => {
        setSelectedRegions(prev => {
            const exists = prev.find(r => r.code === code && r.parentCode === parentCode);
            if (exists) {
                return prev.filter(r => !(r.code === code && r.parentCode === parentCode));
            } else {
                return [...prev, { key, country, name: regionName, code, parentCode }];
            }
        });
    };

    const handleRemoveRegion = (regionKey) => {
        setSelectedRegions(prev => prev.filter(r => r.key !== regionKey));
    };

    const handleNext = () => {
        router.push({
        pathname: './createItinerary',
        params: {
            selectedRegions: JSON.stringify(selectedRegions),
            currentTitle: '',
            currentPeriod: '',
        },
        });
    };

    const isNextButtonActive = selectedRegions.length > 0;

    const selectedRegionKeys = selectedRegions.map(region => region.key);


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
                {/* ✅ 검색어(searchText)를 AllAreaToggle 컴포넌트로 전달합니다. */}
                <AllAreaToggle
                searchText={searchText}
                onRegionSelect={handleRegionSelect}
                selectedRegions={selectedRegionKeys}
                />
            </ScrollView>
            </View>
        </SafeAreaView>
        <View style={styles.floatingButtonContainer}>
            {/* ❗️ 이 버튼에는 검색어가 필요 없으므로 searchText prop을 삭제합니다. */}
            <ApplicationButton
            title="다음"
            onPress={handleNext}
            closed={!isNextButtonActive}
            />
        </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    contentContainer: { flex: 1 },
    scrollContent: { flex: 1 },
    floatingButtonContainer: {
        paddingTop: 12,
        backgroundColor: '#f9fafb',
        paddingBottom: 38,
        borderTopColor: '#f0f0f0',
        borderTopWidth: 1,
    },
});

export default TourDesign;
