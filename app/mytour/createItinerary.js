import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// API 함수 및 상수 임포트
import { createTour } from '../../utils/MyTourApi';
import CompleteButton from '../../components/mytour/createItinerary/CompleteButton';
import ItineraryTitleInput from '../../components/mytour/createItinerary/ItineraryTitleInput';
import TourPlace from '../../components/mytour/createItinerary/TourPlace';
import TourPeriod from '../../components/mytour/createItinerary/TourPeriod';
import { useAuth } from '../../context/AuthContext';

export default function CreateItinerary() {
    const { currentUserId } = useAuth();
    const router = useRouter();
    const { selectedRegions, currentTitle, currentPeriod } = useLocalSearchParams();

    const regions = selectedRegions ? JSON.parse(selectedRegions) : [];

    const [itineraryTitle, setItineraryTitle] = useState(currentTitle || '');
    const [periodData, setPeriodData] = useState(
        currentPeriod ? JSON.parse(currentPeriod) : { type: 'date', startDate: '', endDate: '', nights: '', days: '' }
    );

    // 뒤로가기 버튼 핸들러
    const handleBack = () => router.back();

    // 제목을 자동으로 생성하는 헬퍼 함수
    const getTitle = () => {
        if (regions.length === 1) return `${regions[0].name} 여행`;
        const firstCity = regions[0].name;
        const remainingCount = regions.length - 1;
        return `${firstCity} 외 ${remainingCount}개 지역 여행`;
    };

    // 제목 변경 핸들러
    const handleTitleChange = (title) => setItineraryTitle(title);
    // 기간 변경 핸들러
    const handlePeriodChange = (data) => setPeriodData(data);

    // 작성 완료 버튼 핸들러
    const handleCompletePress = async () => {
        console.log("현재 선택된 regions state:", regions);

        try {
            // 1️⃣ 지역별로 묶어서 Map 생성 (areaCode 기준)
            const regionMap = new Map();

            regions.forEach(r => {
                const areaCode = Number(r.parentCode);
                const areaName = r.country || '';

                if (!regionMap.has(areaCode)) {
                    regionMap.set(areaCode, {
                        areaCode,
                        areaName,
                        sigungu: []
                    });
                }

                // sigungu 추가
                regionMap.get(areaCode).sigungu.push({
                    // ✅ 'key'를 서버가 기대하는 'code'로 변경합니다.
                    code: Number(r.code), 
                    name: r.name
                });
            });

            // 2️⃣ Map → 배열로 변환
            const regionsPayload = Array.from(regionMap.values());

            // 3️⃣ 기간 정보 처리
            const startDate = periodData.startDate?.trim() ? periodData.startDate : null;
            const endDate = periodData.endDate?.trim() ? periodData.endDate : null;
            const nightCount = periodData.nights ? Number(periodData.nights) : null;
            const dayCount = periodData.days ? Number(periodData.days) : null;

            // 4️⃣ 서버로 전송할 payload 구성
            const payload = {
                title: itineraryTitle || getTitle(),
                regions: regionsPayload,   // ✅ DTO 구조에 맞춘 regions
                periodType: periodData.type === 'date' ? 1 : 2,
                startDate,
                endDate,
                nightCount,
                dayCount,
                ownerId: currentUserId,
            };

            console.log('서버 전송 payload:', payload);

            // MyTourApi.js의 createTour 함수를 호출하여 API 요청 처리
            const newTour = await createTour(payload);

            console.log('✅ 저장 완료:', newTour);

            // 저장 성공 시 알림
            Alert.alert('저장 완료', '여행 일정이 성공적으로 저장되었습니다.');

            // 다음 페이지로 이동
            router.replace({
                pathname: './designItinerary',
                params: {
                    tourId: newTour.id,
                    selectedRegions: JSON.stringify(regions),
                    itineraryTitle: itineraryTitle || getTitle(),
                    periodData: JSON.stringify(periodData)
                }
            });

        } catch (error) {
            console.error('❌ 저장 오류:', error);
            // 저장 실패 시 알림
            Alert.alert('저장 실패', '여행 일정 저장 중 오류가 발생했습니다.');
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
