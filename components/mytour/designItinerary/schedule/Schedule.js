import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ShowSchedule from './ShowSchedule';
import ShowExtraTime from './ShowExtraTime';
import AddScheduleButton from './AddScheduleButton';

const Schedule = ({ 
    selectedDay, 
    onAddSchedule,
    schedules: initialSchedules = []
}) => {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [extraTimes, setExtraTimes] = useState([]);

    // 예시 데이터 (실제로는 props나 API에서 받아올 데이터)
    useEffect(() => {
        if (selectedDay) {
            // 선택된 날짜에 따른 일정 데이터 설정
            const exampleSchedules = [
                {
                    id: 'schedule1',
                    title: '웨스트민스터 사원에서 구경',
                    location: '웨스트민스터 사원',
                    startTime: '7:00',
                    endTime: '8:00',
                    memo: '여기서 집합하고, 11시부터 열람 가능하대.',
                    transport: '대중교통 | 10분',
                    category: 'attraction',
                    categoryColor: '#4A90E2'
                },
                {
                    id: 'schedule2',
                    title: '웨스트민스터 사원에서 구경',
                    location: '웨스트민스터 사원',
                    startTime: '7:00',
                    endTime: '8:00',
                    memo: '여기서 집합하고, 11시부터 열릴 가능하다.',
                    transport: '대중교통 | 10분',
                    category: 'attraction',
                    categoryColor: '#4A90E2'
                },
                {
                    id: 'schedule3',
                    title: '버로우 마켓에서 머시룸 리조또 먹어',
                    location: '버로우 마켓',
                    startTime: '12:00',
                    endTime: '13:00',
                    memo: '맛있는 음식이 많아서 여기 정말 맛있어 보인다. 나 먹고싶었거든 가볼까? 기대된다.',
                    category: 'food',
                    categoryColor: '#E67E22'
                }
            ];
            setSchedules(exampleSchedules);
        }
    }, [selectedDay]);

    // 여유시간 계산
    useEffect(() => {
        if (schedules.length > 0) {
            const calculatedExtraTimes = calculateExtraTimes(schedules);
            setExtraTimes(calculatedExtraTimes);
        } else {
            setExtraTimes([]);
        }
    }, [schedules]);

    // 시간 문자열을 분으로 변환
    const timeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // 분을 시간 문자열로 변환
    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // 여유시간 계산 함수
    const calculateExtraTimes = (scheduleList) => {
        if (scheduleList.length < 2) return [];

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
                
                let durationText = '';
                if (hours > 0) {
                    durationText = `${hours}시간`;
                    if (minutes > 0) {
                        durationText += ` ${minutes}분`;
                    }
                } else {
                    durationText = `${minutes}분`;
                }

                extraTimes.push({
                    id: `extra_${i}`,
                    startTime: minutesToTime(currentEnd),
                    endTime: minutesToTime(nextStart),
                    duration: durationText,
                    afterScheduleId: sortedSchedules[i].id,
                    beforeScheduleId: sortedSchedules[i + 1].id
                });
            }
        }

        return extraTimes;
    };

    // 일정 삭제 핸들러
    const handleScheduleDelete = (scheduleId) => {
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    };

    // 여유시간 삭제 핸들러
    const handleExtraTimeDelete = (extraTimeId) => {
        setExtraTimes(prev => prev.filter(extraTime => extraTime.id !== extraTimeId));
    };

    // 여유시간에서 일정 추가 핸들러
    const handleExtraTimeAddSchedule = (startTime, endTime, extraTimeId) => {
        const newSchedule = {
            id: `schedule_${Date.now()}`,
            title: '여유시간',
            location: '',
            startTime: startTime,
            endTime: endTime,
            memo: '',
            category: 'general',
            categoryColor: '#95A5A6'
        };
        
        setSchedules(prev => [...prev, newSchedule]);
        // 여유시간은 자동으로 재계산됨
    };

    // 일정들과 여유시간을 시간순으로 정렬해서 렌더링
    const renderScheduleItems = () => {
        const sortedSchedules = [...schedules].sort((a, b) => 
            timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );

        const items = [];
        
        for (let i = 0; i < sortedSchedules.length; i++) {
            const schedule = sortedSchedules[i];
            
            // 일정 추가
            items.push(
                <ShowSchedule
                    key={schedule.id}
                    schedule={schedule}
                    categoryColor={schedule.categoryColor}
                    onDelete={handleScheduleDelete}
                />
            );

            // 다음 일정과의 여유시간 확인
            const extraTime = extraTimes.find(et => et.afterScheduleId === schedule.id);
            if (extraTime) {
                items.push(
                    <ShowExtraTime
                        key={extraTime.id}
                        duration={extraTime.duration}
                        startTime={extraTime.startTime}
                        endTime={extraTime.endTime}
                        extraTimeId={extraTime.id}
                        onAddSchedule={handleExtraTimeAddSchedule}
                        onDelete={handleExtraTimeDelete}
                    />
                );
            }
        }

        return items;
    };

    if (!selectedDay) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderScheduleItems()}
                
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
});

export default Schedule;