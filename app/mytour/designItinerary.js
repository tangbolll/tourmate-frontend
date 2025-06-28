import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DesignItineraryHeader from '../../components/mytour/designItinerary/designItineraryHeader';
import DateSelectButtons from '../../components/mytour/designItinerary/DateSelectButtons';
import ItineraryBlock from '../../components/mytour/designItinerary/ItineraryBlock';
import BottomSheet from '../../components/mytour/designItinerary/BottomSheet';
import AiItineraryDesignPopup from '../../components/mytour/designItinerary/AiItineraryDesignPopup';

export default function DesignItinerary() {
    const router = useRouter();
    const { selectedRegions, itineraryTitle, periodData } = useLocalSearchParams();
    
    // 전달받은 데이터들을 파싱
    const regions = selectedRegions ? JSON.parse(selectedRegions) : [];
    const title = itineraryTitle || '';
    const period = periodData ? JSON.parse(periodData) : {};
    
    // 선택된 관광지 상태 관리
    const [selectedAttractions, setSelectedAttractions] = useState([]);
    
    // AI 일정 디자인 팝업 상태
    const [showAiPopup, setShowAiPopup] = useState(false);
    
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

    // 관광지 선택/해제 핸들러
    const handleAttractionToggle = (attraction) => {
        setSelectedAttractions(prev => {
            const isSelected = prev.some(item => item.id === attraction.id);
            if (isSelected) {
                return prev.filter(item => item.id !== attraction.id);
            } else {
                return [...prev, attraction];
            }
        });
    };

    // AI 일정 버튼 클릭 핸들러
    const [showActionButtons, setShowActionButtons] = useState(false);
    
    const handleAiItineraryPress = () => {
        setShowAiPopup(true);
    };

    const handleAiPopupConfirm = (result) => {
        setShowActionButtons(true); // 버튼 세 개 보여주기
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

            <BottomSheet
                regions={regions}
                onAttractionToggle={handleAttractionToggle}
                selectedAttractions={selectedAttractions}
                onAiItineraryPress={handleAiItineraryPress}
                showActionButtons={showActionButtons}
                onConfirmItinerary={() => setShowActionButtons(false)} // 일정 확정
                onGoBack={() => setShowActionButtons(false)} // 뒤로가기
            />

            <AiItineraryDesignPopup
                visible={showAiPopup}
                onClose={() => setShowAiPopup(false)}
                onConfirm={() => {handleAiPopupConfirm(); setShowAiPopup(false)}}
                periodType={period.type}
                startDate={period.startDate}
                endDate={period.endDate}
                nights={period.nights}
                days={period.days}
            />
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