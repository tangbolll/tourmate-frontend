import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import ShowSchedule from './ShowSchedule';
import ShowExtraTime from './ShowExtraTime';
import AddScheduleButton from './AddScheduleButton';
import { useMemo } from 'react';

// --- 시간 계산 함수들 ---
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

const Schedule = ({ 
    schedules = [],
    selectedDay,
    onAddSchedule,
    onScheduleDelete,
    onUpdateSchedule, // 부모로부터 수정 함수를 받음
}) => {
    // useMemo를 사용해 schedules prop이 변경될 때만 여유시간을 다시 계산
    const extraTimes = useMemo(() => calculateExtraTimes(schedules), [schedules]);

    // 일정들과 여유시간을 시간순으로 정렬해서 렌더링
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
                    categoryColor={schedule.categoryColor} // categoryColor가 있다면 전달
                    onDelete={() => onScheduleDelete(schedule.id, selectedDay)}
                    onUpdate={(updatedData) => onUpdateSchedule(schedule.id, updatedData)} // 수정 함수 전달
                />
            );

            const extraTime = extraTimes.find(et => et.afterScheduleId === schedule.id);
            if (extraTime) {
                items.push(
                    <ShowExtraTime
                        key={extraTime.id}
                        duration={extraTime.duration}
                        startTime={extraTime.startTime}
                        endTime={extraTime.endTime}
                        onAddSchedule={() => onAddSchedule(selectedDay, null, extraTime.startTime)}
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
                    <Text style={styles.emptyText}>등록된 일정이 없습니다.</Text>
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
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
    },
});

export default Schedule;