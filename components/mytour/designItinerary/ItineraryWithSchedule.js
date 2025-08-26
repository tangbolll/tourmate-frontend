import React from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import ItineraryBlock from './ItineraryBlock';

const ItineraryWithSchedule = ({ 
    periodType, 
    startDate, 
    endDate, 
    nights, 
    days,
    scheduleData = {},
    onAddSchedule,
    onScheduleDelete,
    onTimeBlockClick,
    showAddButtons = false
}) => {
    // 시간 블록 클릭 핸들러
    const handleTimeBlockClick = (blockData) => {
        console.log('Time block clicked with data:', blockData);
        
        // 부모 컴포넌트의 핸들러 호출
        if (onTimeBlockClick) {
            onTimeBlockClick(blockData);
        }
    };

    // 일정 추가 핸들러
    const handleAddSchedule = (selectedDay, selectedDate = null, selectedHour = null) => {
        console.log('Add schedule clicked:', selectedDay, selectedDate, selectedHour);
        
        // 부모 컴포넌트의 핸들러 호출
        if (onAddSchedule) {
            onAddSchedule(selectedDay, selectedDate, selectedHour);
        }
    };

    // 일정 삭제 핸들러
    const handleDeleteSchedule = (scheduleId, day) => {
        console.log('Schedule delete requested:', scheduleId, day);
        
        // 부모 컴포넌트의 삭제 핸들러 호출
        if (onScheduleDelete) {
            onScheduleDelete(scheduleId, day);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
            
            {/* 메인 콘텐츠 */}
            <View style={styles.mainContent}>
                <ItineraryBlock
                    periodType={periodType}
                    startDate={startDate}
                    endDate={endDate}
                    nights={nights}
                    days={days}
                    scheduleData={scheduleData}
                    onTimeBlockClick={handleTimeBlockClick}
                    onAddSchedule={handleAddSchedule}
                    onScheduleDelete={handleDeleteSchedule}
                    showAddButtons={showAddButtons}
                />
            </View>
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