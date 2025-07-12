import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DesignItineraryMapHeader from '../../../components/mytour/designItinerary/map/designItineraryMapHeader';
import BottomSheet from '../../../components/mytour/designItinerary/map/BottomSheet';

export default function ItineraryMap() {
    const router = useRouter();
    const { selectedRegions, itineraryTitle, periodData } = useLocalSearchParams();
    
    // 전달받은 데이터들을 파싱
    const regions = selectedRegions ? JSON.parse(selectedRegions) : [];
    const title = itineraryTitle || '';
    const period = periodData ? JSON.parse(periodData) : {};
    
    console.log('전달받은 데이터들:');
    console.log('- 지역 데이터:', regions);
    console.log('- 여행 제목:', title);
    console.log('- 기간 데이터:', period);
    console.log('- 기간 타입:', period.type);
    
    if (period.type === 'date') {
        console.log('- 시작 날짜:', period.startDate);
        console.log('- 종료 날짜:', period.endDate);
    } else if (period.type === 'duration') {
        console.log('- 숙박 기간:', period.nights + '박');
        console.log('- 총 기간:', period.days + '일');
    }

    // 날짜 포맷팅 함수
    const formatDateRange = () => {
        if (period.type === 'date' && period.startDate && period.endDate) {
            return {
                startDate: period.startDate,
                endDate: period.endDate,
                displayText: `${period.startDate} - ${period.endDate}`
            };
        } else if (period.type === 'duration' && period.nights && period.days) {
            return {
                displayText: `${period.nights}박 ${period.days}일`
            };
        }
        return { displayText: '' };
    };

    const handleBackPress = () => {
        router.back();
    };

    // 멤버 아이콘 클릭 핸들러 (임시)
    const handleMemberPress = () => {
        console.log('멤버 아이콘 클릭');
    };

    const dateInfo = formatDateRange();

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <DesignItineraryMapHeader 
                title={title}
                dateRange={dateInfo.displayText}
                startDate={dateInfo.startDate}
                endDate={dateInfo.endDate}
                periodType={period.type}
                onBackPress={handleBackPress}
                onMemberPress={handleMemberPress}
            />
            
            {/* 지도 영역 */}
            <View style={styles.mapContainer}>
                <Text style={styles.mapPlaceholder}>지도 영역</Text>
            </View>
            
            {/* 바텀시트 */}
            <View style={styles.bottomSheetContainer}>
                <BottomSheet
                    periodType={period.type}
                    startDate={period.startDate}
                    endDate={period.endDate}
                    nights={period.nights}
                    days={period.days}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    mapPlaceholder: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
    },
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
});

