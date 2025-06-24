import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import SearchRegionHeader from '../../components/mytour/createItinerary/SearchRegionHeader';
import Continent from '../../components/mytour/createItinerary/Continent';
import Country from '../../components/mytour/createItinerary/Country';
import SelectedRegions from '../../components/mytour/createItinerary/SelectedRegions';
import { BottomSheet } from '../../components/mytour/createItinerary/BottomSheet';
import CreateItineraryButton from '../../components/mytour/createItinerary/CreateItineraryButton';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const TourDesign = () => {
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
        // 네비게이션 처리
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
        console.log('여행일정 생성', selectedRegions);
    };

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
});

export default TourDesign;