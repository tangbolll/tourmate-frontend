import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import DayPicker from './DayPicker';

const TourPeriod = ({ onPeriodChange }) => {
    const [selectedType, setSelectedType] = useState('date');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [nights, setNights] = useState('');
    const [days, setDays] = useState('');
    
    // 달력 모달 상태
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectingDateType, setSelectingDateType] = useState('start'); // 'start' or 'end'
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);

    // 날짜 형식 변환 함수
    const formatDateToString = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 문자열을 Date 객체로 변환
    const parseStringToDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        // 타입이 변경될 때마다 부모 컴포넌트에 알림
        onPeriodChange({
            type,
            startDate: type === 'date' ? startDate : '',
            endDate: type === 'date' ? endDate : '',
            nights: type === 'duration' ? nights : '',
            days: type === 'duration' ? days : ''
        });
    };

    const handleDateInputPress = (field) => {
        if (selectedType === 'date') {
            setSelectingDateType(field);
            setShowCalendar(true);
        }
    };

    const handleDateChange = (field, value) => {
        const newData = {
            type: selectedType,
            startDate: field === 'start' ? value : startDate,
            endDate: field === 'end' ? value : endDate,
            nights: '',
            days: ''
        };
        
        if (field === 'start') {
            setStartDate(value);
            setSelectedStartDate(parseStringToDate(value));
            // 시작일이 종료일보다 늦으면 종료일 초기화
            if (endDate && value > endDate) {
                setEndDate('');
                setSelectedEndDate(null);
                newData.endDate = '';
            }
        }
        if (field === 'end') {
            setEndDate(value);
            setSelectedEndDate(parseStringToDate(value));
        }
        
        onPeriodChange(newData);
    };

    const handleDurationChange = (field, value) => {
        const newData = {
            type: selectedType,
            startDate: '',
            endDate: '',
            nights: field === 'nights' ? value : nights,
            days: field === 'days' ? value : days
        };
        
        if (field === 'nights') setNights(value);
        if (field === 'days') setDays(value);
        
        onPeriodChange(newData);
    };

    // 달력에서 날짜 선택 핸들러
    const handleDateSelect = (selectedDay) => {
        // 현재 달력의 연도와 월을 가져와서 Date 객체 생성
        const currentDate = new Date();
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
        const formattedDate = formatDateToString(selectedDate);

        if (selectingDateType === 'start') {
            handleDateChange('start', formattedDate);
        } else {
            handleDateChange('end', formattedDate);
        }
        
        setShowCalendar(false);
    };

    const renderDateInputs = () => (
        <View style={styles.dateInputsContainer}>
            <TouchableOpacity 
                style={styles.dateInputWrapper}
                onPress={() => handleDateInputPress('start')}
            >
                <FontAwesome6 name="calendar-check" size={14} color="black" style={styles.icon} />
                <TextInput
                    placeholder="여행시작일"
                    style={styles.dateInput}
                    placeholderTextColor="#9ca3af"
                    value={startDate}
                    editable={false}
                    pointerEvents="none"
                />
            </TouchableOpacity>
            <Text style={styles.separator}>-</Text>
            <TouchableOpacity 
                style={styles.dateInputWrapper}
                onPress={() => handleDateInputPress('end')}
            >
                <FontAwesome6 name="calendar-check" size={14} color="black" style={styles.icon} />
                <TextInput
                    placeholder="여행종료일"
                    style={styles.dateInput}
                    placeholderTextColor="#9ca3af"
                    value={endDate}
                    editable={false}
                    pointerEvents="none"
                />
            </TouchableOpacity>
        </View>
    );

    const renderDurationInputs = () => (
        <View style={styles.durationInputsContainer}>
            <TextInput
                keyboardType="numeric"
                style={styles.durationInput}
                placeholderTextColor="#9ca3af"
                value={nights}
                onChangeText={(value) => handleDurationChange('nights', value)}
            />
            <Text style={styles.durationText}>박</Text>
            <TextInput
                keyboardType="numeric"
                style={styles.durationInput}
                placeholderTextColor="#9ca3af"
                value={days}
                onChangeText={(value) => handleDurationChange('days', value)}
            />
            <Text style={styles.durationText}>일</Text>
        </View>
    );

    return (
        <View style={styles.inputSection}>
            <Text style={styles.heading}>여행기간</Text>
            
            <View style={styles.typeSelectionContainer}>
                <TouchableOpacity style={styles.typeOption} onPress={() => handleTypeChange('date')}>
                    <View style={selectedType === 'date' ? styles.radioSelected : styles.radioUnselected}>
                        {selectedType === 'date' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.typeText}>날짜로 등록</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.typeOption} onPress={() => handleTypeChange('duration')}>
                    <View style={selectedType === 'duration' ? styles.radioSelected : styles.radioUnselected}>
                        {selectedType === 'duration' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.typeText}>기간으로 등록</Text>
                </TouchableOpacity>
            </View>

            {selectedType === 'date' ? renderDateInputs() : renderDurationInputs()}

            {/* 달력 모달 */}
            <DayPicker
                visible={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={handleDateSelect}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                selectingDateType={selectingDateType}
                title={selectingDateType === 'start' ? '시작일 선택' : '종료일 선택'}
            />
        </View>
    );
};

export default TourPeriod;

const styles = StyleSheet.create({
    inputSection: {
        padding: 12,
        marginBottom: 12,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    typeSelectionContainer: {
        flexDirection: 'row',
        gap: 24,
        marginLeft: 4,
        marginBottom: 16,
    },
    typeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioSelected: {
        width: 15,
        height: 15,
        borderRadius: 10,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioUnselected: {
        width: 15,
        height: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#d1d5db',
        backgroundColor: 'white',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
    },
    typeText: {
        color: 'black',
        fontSize: 16,
    },
    dateInputsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: 'white',
        flex: 1,
        height: 44,
    },
    icon: {
        marginRight: 8,
    },
    dateInput: {
        flex: 1,
        color: 'black',
        fontSize: 16,
    },
    separator: {
        color: 'black',
        fontSize: 16,
    },
    durationInputsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    durationInput: {
        width: 80,
        height: 44,
        padding: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        textAlign: 'center',
        color: 'black',
        fontSize: 16,
        backgroundColor: 'white',
    },
    durationText: {
        color: 'black',
        fontSize: 16,
    },
});