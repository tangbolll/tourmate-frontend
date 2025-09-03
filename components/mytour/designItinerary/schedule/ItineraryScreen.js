import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Schedule from '../components/mytour/designItinerary/Schedule'; // 기존 Schedule 컴포넌트 경로

// --- 서버 응답 데이터 (실제로는 API 호출로 받아옵니다) ---
const SERVER_RESPONSE = {"2025-09-10": [{"attractionId": "2783851", "attractionName": "경암근린공원", "latitude": 0, "location": null, "longitude": 0, "scheduleTitle": "산책로에서 자연 감상", "scheduleType": "ATTRACTION", "stayDuration": 2, "tip": "특히 봄 가을에 아름다운 단풍을 감상할 수 있습니다."}], "2025-09-11": [], "2025-09-12": [{"attractionId": "1622544", "attractionName": "경장각", "latitude": 0, "location": null, "longitude": 0, "scheduleTitle": "역사적인 사찰 탐방", "scheduleType": "ATTRACTION", "stayDuration": 1, "tip": "한국의 전통 고즈넉한 사찰 분위기를 느낄 수 있습니다."}]};

// --- 데이터 변환을 위한 헬퍼 함수 ---
const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// scheduleType에 따라 색상을 지정하는 맵
const categoryColorMap = {
    'ATTRACTION': '#4A90E2',
    'MEAL': '#D0021B',
    'CAFE': '#50E3C2',
    'DEFAULT': '#9B9B9B'
};

/**
 * AI 응답 데이터를 Schedule 컴포넌트가 이해할 수 있는 형식으로 변환하는 함수
 * @param {object} aiData - 서버에서 받은 원본 데이터
 * @returns {object} - 날짜를 key로, 변환된 일정 배열을 value로 갖는 객체
 */
const transformAIDataToSchedules = (aiData) => {
    const transformedData = {};
    const START_TIME_MINUTES = 9 * 60; // 오전 9시
    const TRAVEL_TIME_MINUTES = 30;    // 일정 간 이동/준비 시간

    Object.keys(aiData).forEach(date => {
        let currentTime = START_TIME_MINUTES;
        transformedData[date] = aiData[date].map(item => {
            const startTime = currentTime;
            const endTime = startTime + (item.stayDuration * 60);

            // 다음 일정을 위해 현재 시간 업데이트
            currentTime = endTime + TRAVEL_TIME_MINUTES;

            return {
                id: item.attractionId || `temp_${Math.random()}`, // 고유 ID
                title: item.scheduleTitle,
                place: item.attractionName,
                startTime: minutesToTime(startTime),
                endTime: minutesToTime(endTime),
                memo: item.tip,
                categoryColor: categoryColorMap[item.scheduleType] || categoryColorMap['DEFAULT'],
                // Schedule 컴포넌트가 필요로 하는 다른 필드들...
            };
        });
    });
    return transformedData;
};


// --- 메인 컴포넌트 ---
const ItineraryScreen = () => {
    const [itinerary, setItinerary] = useState({});
    const [selectedDay, setSelectedDay] = useState(1);

    // 컴포넌트 마운트 시 서버 데이터를 변환하여 state에 저장
    useEffect(() => {
        const transformed = transformAIDataToSchedules(SERVER_RESPONSE);
        setItinerary(transformed);
    }, []);

    // 날짜 키를 시간순으로 정렬
    const sortedDates = useMemo(() => Object.keys(itinerary).sort(), [itinerary]);
    
    // 현재 선택된 날짜의 스케줄 데이터
    const currentSchedules = sortedDates[selectedDay - 1] 
        ? itinerary[sortedDates[selectedDay - 1]] 
        : [];

    // --- 핸들러 함수들 (기능 연결 시 구현 필요) ---
    const handleAddSchedule = (data) => {
        console.log('일정 추가 버튼 클릭됨:', data);
        // 여기에 새 일정을 추가하는 로직 구현 (예: 모달 열기)
    };
    const handleScheduleDelete = (scheduleId, day) => {
        console.log(`${day}일차의 일정(ID: ${scheduleId}) 삭제`);
        // itinerary state를 업데이트하는 로직 구현
    };
    const handleUpdateSchedule = (schedule) => {
        console.log('일정 업데이트:', schedule);
        // itinerary state를 업데이트하는 로직 구현
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI 추천 여행 일정</Text>
            </View>

            {/* 날짜 선택 탭 */}
            <View style={styles.dayTabsContainer}>
                {sortedDates.map((date, index) => (
                    <TouchableOpacity
                        key={date}
                        style={[styles.dayTab, selectedDay === index + 1 && styles.dayTabActive]}
                        onPress={() => setSelectedDay(index + 1)}
                    >
                        <Text style={[styles.dayTabText, selectedDay === index + 1 && styles.dayTabTextActive]}>
                            Day {index + 1}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 선택된 날짜의 스케줄 표시 */}
            <View style={styles.scheduleContainer}>
                <Schedule 
                    schedules={currentSchedules}
                    selectedDay={selectedDay}
                    onAddSchedule={handleAddSchedule}
                    onScheduleDelete={handleScheduleDelete}
                    onUpdateSchedule={handleUpdateSchedule}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    dayTabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    dayTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ced4da',
    },
    dayTabActive: {
        backgroundColor: '#007BFF',
        borderColor: '#007BFF',
    },
    dayTabText: {
        color: '#495057',
        fontWeight: '600',
    },
    dayTabTextActive: {
        color: '#fff',
    },
    scheduleContainer: {
        flex: 1,
    },
});

export default ItineraryScreen;
