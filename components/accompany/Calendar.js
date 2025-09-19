import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../../utils/dateUtils';

const Calendar = ({ onSelect, visible, startDate, endDate }) => {
    const [tempStartDate, setTempStartDate] = useState(startDate || new Date());
    const [tempEndDate, setTempEndDate] = useState(endDate || new Date());
    
    if (!visible) return null;
    
    const handleStartDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') return;
        const currentDate = selectedDate || tempStartDate;
        setTempStartDate(currentDate);
        
        if (tempEndDate < currentDate) {
            setTempEndDate(currentDate);
        }
    };
    
    const handleEndDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') return;
        const currentDate = selectedDate || tempEndDate;
        
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
                    <View style={styles.datePickerWrapper}>
                        <DateTimePicker
                            value={tempStartDate}
                            mode="date"
                            display="spinner"
                            onChange={handleStartDateChange}
                            textColor="#000000"
                            accentColor="#007AFF"
                            themeVariant="light"
                            style={[
                                styles.datePicker,
                                Platform.OS === 'ios' && styles.iosDatePicker
                            ]}
                        />
                    </View>
                </View>
                <View style={styles.calendarColumn}>
                    <Text style={styles.calendarTitle}>종료일 선택</Text>
                    <View style={styles.datePickerWrapper}>
                        <DateTimePicker
                            value={tempEndDate}
                            mode="date"
                            display="spinner"
                            onChange={handleEndDateChange}
                            minimumDate={tempStartDate}
                            textColor="#000000"
                            accentColor="#007AFF"
                            themeVariant="light"
                            style={[
                                styles.datePicker,
                                Platform.OS === 'ios' && styles.iosDatePicker
                            ]}
                        />
                    </View>
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
        borderRadius: 8,
        backgroundColor: '#ffffff', // 배경색 명시
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
        textAlign: 'center',
        color: '#000000', // 텍스트 색상 명시
    },
    datePickerWrapper: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: Platform.OS === 'ios' ? 5 : 0,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
            },
        }),
    },
    datePicker: {
        backgroundColor: '#ffffff',
        ...Platform.select({
            android: {
                color: '#000000',
            },
        }),
    },
    iosDatePicker: {
        height: 120, // iOS에서 높이 명시
        width: 150,  // iOS에서 너비 명시
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