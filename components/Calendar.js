import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../utils/dateUtils';

// 달력 컴포넌트 - 시작일과 종료일을 나란히 표시
const Calendar = ({ onSelect, visible, startDate, endDate }) => {
    const [tempStartDate, setTempStartDate] = useState(startDate || new Date());
    const [tempEndDate, setTempEndDate] = useState(endDate || new Date());
    
    if (!visible) return null;
    
    const handleStartDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') return;
        const currentDate = selectedDate || tempStartDate;
        setTempStartDate(currentDate);
        
        // 종료일이 시작일보다 이전인 경우 종료일을 시작일로 설정
        if (tempEndDate < currentDate) {
            setTempEndDate(currentDate);
        }
    };
    
    const handleEndDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') return;
        const currentDate = selectedDate || tempEndDate;
        
        // 종료일이 시작일보다 이전인 경우 경고
        if (currentDate < tempStartDate) {
            Alert.alert("날짜 오류", "종료일은 시작일 이후여야 합니다.");
            return;
        }
        setTempEndDate(currentDate);
    };
    
    const handleConfirm = () => {
        onSelect(formatDate(tempStartDate), formatDate(tempEndDate));
    };
    
    return (
        <View style={styles.calendarContainer}>
            <View style={styles.calendarRow}>
                <View style={styles.calendarColumn}>
                    <Text style={styles.calendarTitle}>시작일 선택</Text>
                    <DateTimePicker
                        value={tempStartDate}
                        mode="date"
                        display="default"
                        onChange={handleStartDateChange}
                        fontColor="#000"
                    />
                </View>
                <View style={styles.calendarColumn}>
                    <Text style={styles.calendarTitle}>종료일 선택</Text>
                    <DateTimePicker
                        value={tempEndDate}
                        mode="date"
                        display="default"
                        onChange={handleEndDateChange}
                        minimumDate={tempStartDate}
                    />
                </View>
            </View>
            <TouchableOpacity style={styles.calendarConfirmButton} onPress={handleConfirm}>
                <Text style={styles.calendarConfirmText}>확인</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    calendarContainer: {
        marginVertical: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    calendarColumn: {
        flex: 1,
        alignItems: 'center',
    },
    calendarTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    calendarConfirmButton: {
        backgroundColor: '#000',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignSelf: 'center',
        marginTop: 15
    },
    calendarConfirmText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});

export default Calendar;