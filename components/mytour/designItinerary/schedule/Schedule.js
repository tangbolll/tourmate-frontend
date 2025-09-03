import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import ShowSchedule from './ShowSchedule';
import ShowExtraTime from './ShowExtraTime';
import AddScheduleButton from './AddScheduleButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 헬퍼 함수들 ---
const timeToMinutes = (timeString) => {
    if (!timeString || !timeString.includes(':')) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const calculateExtraTimes = (scheduleList) => {
    if (!scheduleList || scheduleList.length < 2) return [];
    const sortedSchedules = [...scheduleList].sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    const extraTimes = [];
    for (let i = 0; i < sortedSchedules.length - 1; i++) {
        const currentEnd = timeToMinutes(sortedSchedules[i].endTime);
        const nextStart = timeToMinutes(sortedSchedules[i + 1].startTime);
        if (nextStart > currentEnd) {
            const duration = nextStart - currentEnd;
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            let durationText = hours > 0 ? `${hours}시간 ` : '';
            durationText += `${minutes}분`;
            extraTimes.push({
                id: `extra_${sortedSchedules[i].id}`,
                startTime: minutesToTime(currentEnd),
                endTime: minutesToTime(nextStart),
                duration: durationText,
                afterScheduleId: sortedSchedules[i].id,
            });
        }
    }
    return extraTimes;
};

// --- Schedule 컴포넌트 ---
const Schedule = ({ 
    schedules = [],
    selectedDay,
    onAddSchedule,
    onScheduleDelete,
    onUpdateSchedule,
    onSelectSchedule, // 💡 1. 부모로부터 onSelectSchedule prop을 받습니다.
}) => {
    console.log(`[${selectedDay}일차] Schedule 컴포넌트가 받은 데이터:`, JSON.stringify(schedules, null, 2));

    const [hiddenExtraTimeIds, setHiddenExtraTimeIds] = useState([]);

    useEffect(() => {
        const loadHiddenIds = async () => {
            if (!selectedDay) return;
            try {
                const key = `hidden_ids_${selectedDay}`;
                const savedIds = await AsyncStorage.getItem(key);
                setHiddenExtraTimeIds(savedIds ? JSON.parse(savedIds) : []);
            } catch (e) {
                console.error('숨겨진 ID 불러오기 실패:', e);
                setHiddenExtraTimeIds([]);
            }
        };
        loadHiddenIds();
    }, [selectedDay]);

    const extraTimes = useMemo(() => calculateExtraTimes(schedules), [schedules]);

    const handleDeleteExtraTime = async (idToHide) => {
        try {
            const newHiddenIds = hiddenExtraTimeIds.includes(idToHide) 
                ? hiddenExtraTimeIds 
                : [...hiddenExtraTimeIds, idToHide];
            setHiddenExtraTimeIds(newHiddenIds);

            const key = `hidden_ids_${selectedDay}`;
            await AsyncStorage.setItem(key, JSON.stringify(newHiddenIds));
        } catch (e) {
            console.error('숨겨진 ID 저장하기 실패:', e);
        }
    };

    const renderScheduleItems = () => {
        const sortedSchedules = [...schedules].sort((a, b) => 
            timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );
        const items = [];
        for (let i = 0; i < sortedSchedules.length; i++) {
            const schedule = sortedSchedules[i];
            items.push(
                <ShowSchedule
                    key={schedule.id}
                    schedule={schedule}
                    isAiSuggestion={schedule.isAiSuggestion}
                    // 💡 2. 받은 onSelectSchedule을 onSelect prop으로 그대로 전달합니다.
                    onSelect={onSelectSchedule}
                    categoryColor={schedule.categoryColor}
                    onDelete={() => onScheduleDelete(schedule.id, selectedDay)}
                    onUpdate={() => onUpdateSchedule(schedule)}
                />
            );
            const extraTime = extraTimes.find(et => et.afterScheduleId === schedule.id);
            if (extraTime && !hiddenExtraTimeIds.includes(extraTime.id)) {
                items.push(
                    <ShowExtraTime
                        key={extraTime.id}
                        duration={extraTime.duration}
                        onAddSchedule={() => {
                            const dataToSend = { 
                                selectedDay: selectedDay, 
                                startTime: extraTime.startTime, 
                                endTime: extraTime.endTime 
                            };
                            console.log("✅ 1. Schedule.js에서 부모로 보내는 데이터:", dataToSend);
                            onAddSchedule(dataToSend);
                        }}
                        onDelete={handleDeleteExtraTime} 
                        extraTimeId={extraTime.id}
                    />
                );
            }
        }
        return items;
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {schedules && schedules.length > 0 ? (
                    renderScheduleItems()
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>등록된 일정이 없습니다.</Text>
                    </View>
                )}
                
                <AddScheduleButton 
                    onPress={() => onAddSchedule && onAddSchedule(selectedDay)}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',    
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 20,
        marginBottom: 50,
    },
});

export default Schedule;
