import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CompleteButton from '../../components/mytour/createItinerary/CompleteButton';
import ItineraryTitleInput from '../../components/mytour/createItinerary/ItineraryTitleInput';
import TourPlace from '../../components/mytour/createItinerary/TourPlace';
import TourPeriod from '../../components/mytour/createItinerary/TourPeriod';

export default function CreateItinerary() {
    const router = useRouter();
    const { selectedRegions, currentTitle, currentPeriod } = useLocalSearchParams();
    
    // 상태 관리 - 수정 모드일 때 기존 데이터로 초기화
    const [itineraryTitle, setItineraryTitle] = useState(currentTitle || '');
    const [periodData, setPeriodData] = useState(
        currentPeriod ? JSON.parse(currentPeriod) : {
            type: 'date',
            startDate: '',
            endDate: '',
            nights: '',
            days: ''
        }
    );
    
    // JSON 문자열을 다시 객체로 변환
    const regions = selectedRegions ? JSON.parse(selectedRegions) : [];

    const handleBack = () => {
        router.back();
    };

    const getTitle = () => {
        if (regions.length === 1) return `${regions[0].region} 여행`;
        
        const firstCity = regions[0].region;
        const remainingCount = regions.length - 1;
        return `${firstCity} 외 ${remainingCount}개 도시 여행`;
    };

    const handleTitleChange = (title) => {
        setItineraryTitle(title);
    };

    const handlePeriodChange = (data) => {
        setPeriodData(data);
    };

    // handleCompletePress 함수 정의
    const handleCompletePress = () => {
        console.log('완료 버튼 클릭');
        console.log('여행 제목:', itineraryTitle || getTitle());
        console.log('기간 데이터:', periodData);
        
        router.push({
            pathname: './designItinerary',
            params: {
                selectedRegions: JSON.stringify(regions),
                itineraryTitle: itineraryTitle || getTitle(),
                periodData: JSON.stringify(periodData)
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 고정 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{getTitle()}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* 구분선 */}
            <View style={styles.headerDivider} />

            {/* 메인 컨텐츠 영역 */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <ItineraryTitleInput 
                    placeholder={getTitle()} 
                    onTitleChange={handleTitleChange}
                />
                <TourPlace 
                    selectedRegion={regions} 
                />
                <TourPeriod 
                    onPeriodChange={handlePeriodChange}
                />
            </ScrollView>

            {/* 고정 푸터 */}
            <CompleteButton
                title="작성 완료"
                onPress={handleCompletePress}
                closed={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black',
    },
    headerSpacer: {
        width: 32,
    },
    headerDivider: {
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    content: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 16,
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#6b7280',
        marginBottom: 10,
    },
    selectedRegionsText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 20,
    },
});