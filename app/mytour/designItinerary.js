import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DesignItineraryHeader from '../../components/mytour/designItinerary/designItineraryHeader';
import DateSelectButtons from '../../components/mytour/designItinerary/DateSelectButtons';
import ItineraryBlock from '../../components/mytour/designItinerary/ItineraryBlock';

export default function DesignItinerary() {
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

    const handleDaySelect = (dayNumber) => {
        console.log('선택된 일차:', dayNumber);
    };

    const dateInfo = formatDateRange();

    return (
        <SafeAreaView style={styles.container}>
            <DesignItineraryHeader 
                title={title}
                dateRange={dateInfo.displayText}
                startDate={dateInfo.startDate}
                endDate={dateInfo.endDate}
                periodType={period.type}
                onBackPress={handleBackPress}
            />
            
            <DateSelectButtons
                periodType={period.type}
                startDate={period.startDate}
                endDate={period.endDate}
                nights={period.nights}
                days={period.days}
                onDaySelect={handleDaySelect}
            />
            
            <View style={styles.content}>
                <ItineraryBlock
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
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    dateBasedContent: {
        flex: 1,
        padding: 16,
    },
    durationBasedContent: {
        flex: 1,
        padding: 16,
    },
});