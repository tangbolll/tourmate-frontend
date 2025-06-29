import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import ItineraryBlock from './ItineraryBlock';
import AddSchedule from './AddSchedule';

const ItineraryWithSchedule = ({ 
    periodType, 
    startDate, 
    endDate, 
    nights, 
    days 
}) => {
    const [schedules, setSchedules] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(7);
    const [existingSchedule, setExistingSchedule] = useState(null);

    // 시간 블록 클릭 핸들러
    const handleTimeBlockClick = (date, hour, schedule) => {
        setSelectedDate(date);
        setSelectedTime(hour);
        setExistingSchedule(schedule);
        setModalVisible(true);
    };
    console.log('date: ', selectedDate);

    // 일정 저장 핸들러
    const handleSaveSchedule = (scheduleData) => {
        setSchedules(prevSchedules => {
            const existingIndex = prevSchedules.findIndex(s => s.id === scheduleData.id);
            
            if (existingIndex >= 0) {
                // 기존 일정 수정
                const updatedSchedules = [...prevSchedules];
                updatedSchedules[existingIndex] = scheduleData;
                return updatedSchedules;
            } else {
                // 새 일정 추가
                return [...prevSchedules, scheduleData];
            }
        });
    };

    // 일정 삭제 핸들러
    const handleDeleteSchedule = (scheduleId) => {
        setSchedules(prevSchedules => 
            prevSchedules.filter(schedule => schedule.id !== scheduleId)
        );
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setModalVisible(false);
        setExistingSchedule(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
            
            {/* 메인 콘텐츠 - 스크롤 불가 */}
            <View style={styles.mainContent}>
                <ItineraryBlock
                    periodType={periodType}
                    startDate={startDate}
                    endDate={endDate}
                    nights={nights}
                    days={days}
                    schedules={schedules}
                    onTimeBlockClick={handleTimeBlockClick}
                />
            </View>

            <AddSchedule
                visible={modalVisible}
                onClose={handleCloseModal}
                onSave={handleSaveSchedule}
                onDelete={handleDeleteSchedule}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                existingSchedule={existingSchedule}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    mainContent: {
        flex: 1,
    },
});

export default ItineraryWithSchedule;