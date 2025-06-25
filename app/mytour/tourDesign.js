import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import SearchRegionHeader from '../../components/mytour/createItinerary/SearchRegionHeader';
import Continent from '../../components/mytour/createItinerary/Continent';
import Country from '../../components/mytour/createItinerary/Country';
import SelectedRegions from '../../components/mytour/createItinerary/SelectedRegions';
import { BottomSheet } from '../../components/mytour/createItinerary/BottomSheet';
import CreateItineraryButton from '../../components/mytour/createItinerary/CreateItineraryButton';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const TourDesign = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [selectedContinent, setSelectedContinent] = useState('국내');
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
    const [sheetHeight, setSheetHeight] = useState(0.6); // 0.6 = 60%

    const handleSearchChange = (text) => {
        setSearchText(text);
    };

    const handleBack = () => {
        console.log('뒤로 가기');
        // Expo Router 뒤로가기
        router.back();
    };

    const handleContinentSelect = (continent) => {
        setSelectedContinent(continent);
    };

    const handleRegionSelect = (regionKey, country, region) => {
        setSelectedRegions(prev => {
            const exists = prev.find(r => r.key === regionKey);
            if (exists) {
                return prev.filter(r => r.key !== regionKey);
            } else {
                return [...prev, { key: regionKey, country, region }];
            }
        });
    };

    const handleRemoveRegion = (regionKey) => {
        setSelectedRegions(prev => prev.filter(r => r.key !== regionKey));
    };

    const handleCreateTrip = () => {
        router.push({
            pathname: 'mytour/createItinerary',
            params: {
                selectedRegions: JSON.stringify(selectedRegions)
            }
        });
    };

    // 하나 이상의 지역이 선택되었는지 확인
    const isCreateButtonActive = selectedRegions.length > 0;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
            {/* 상단 헤더 */}
            <SearchRegionHeader 
                searchText={searchText}
                onSearchChange={handleSearchChange}
                onBack={handleBack}
            />
            
            {/* 지도 영역 */}
            <View style={styles.mapContainer}>
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderText}>지도 영역</Text>
                </View>
                
            </View>

            {/* 바텀 시트 */}
            <BottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
                onHeightChange={setSheetHeight}
            >
                {/* 바텀 시트 내부 선택된 지역 표시 */}
                <SelectedRegions 
                    selectedRegions={selectedRegions}
                    onRemoveRegion={handleRemoveRegion}
                />
                
                <Continent 
                    selectedContinent={selectedContinent}
                    onContinentSelect={handleContinentSelect}
                />
                <Country 
                    selectedContinent={selectedContinent}
                    onRegionSelect={handleRegionSelect}
                    selectedRegions={selectedRegions}
                />
            </BottomSheet>

            {/* 플로팅 여행일정 생성 버튼 */}
            <View style={styles.floatingButtonContainer}>
                <CreateItineraryButton 
                    isActive={isCreateButtonActive}
                    onPress={handleCreateTrip}
                />
            </View>
        </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    mapPlaceholderText: {
        fontSize: 18,
        color: '#6b7280',
    },
    selectedRegionsOverlay: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        zIndex: 50,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
});

export default TourDesign;