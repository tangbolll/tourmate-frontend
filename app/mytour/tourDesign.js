import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import SearchRegionHeader from '../../components/mytour/createItinerary/SearchRegionHeader';
import SelectedRegions from '../../components/mytour/createItinerary/SelectedRegions';
import BottomSheet from '../../components/mytour/createItinerary/BottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const TourDesign = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
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
                selectedRegions={selectedRegions}
                onRegionSelect={handleRegionSelect}
                onRemoveRegion={handleRemoveRegion}
                isCreateButtonActive={isCreateButtonActive}
                handleCreateTrip={handleCreateTrip}
            />
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