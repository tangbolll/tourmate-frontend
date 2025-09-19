import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import CalendarPopup from '../../accompany/CalendarPopup';
import dayjs from 'dayjs';

const TourPeriod = ({ onPeriodChange, initialPeriod }) => {
    // initialPeriod가 있으면 해당 값으로 초기화, 없으면 기본값 사용
    const [selectedType, setSelectedType] = useState(initialPeriod?.type || 'date');
    const [startDate, setStartDate] = useState(initialPeriod?.startDate || '');
    const [endDate, setEndDate] = useState(initialPeriod?.endDate || '');
    const [nights, setNights] = useState(initialPeriod?.nights || '');
    const [days, setDays] = useState(initialPeriod?.days || '');
    
    const [calendarVisible, setCalendarVisible] = useState(false);

    // initialPeriod가 변경될 때 state 업데이트
    useEffect(() => {
        if (initialPeriod) {
            setSelectedType(initialPeriod.type || 'date');
            setStartDate(initialPeriod.startDate || '');
            setEndDate(initialPeriod.endDate || '');
            setNights(initialPeriod.nights || '');
            setDays(initialPeriod.days || '');
        }
    }, [initialPeriod]);

    const formatDate = (date) => {
        if (!date) return '';
        return dayjs(date).format('YYYY-MM-DD');
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        onPeriodChange({
            type,
            startDate: type === 'date' ? startDate : '',
            endDate: type === 'date' ? endDate : '',
            nights: type === 'duration' ? nights : '',
            days: type === 'duration' ? days : ''
        });
    };

    const handleDateInputPress = () => {
        if (selectedType === 'date') {
            setCalendarVisible(true);
        }
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

    const handleDateSelect = (range) => {
        const formattedStartDate = formatDate(range.startDate);
        const formattedEndDate = formatDate(range.endDate);

        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);

        onPeriodChange({
            type: 'date',
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            nights: '',
            days: ''
        });

        setCalendarVisible(false);
    };

    const renderDateInputs = () => (
    <View style={styles.dateInputsContainer}>
        <TouchableOpacity 
            style={styles.dateInputWrapper}
            onPress={handleDateInputPress}
            activeOpacity={0.7}
        >
            <FontAwesome6 name="calendar-check" size={14} color="black" style={styles.icon} />
            {/* TextInput 대신 Text 컴포넌트 사용 */}
            <Text style={[
                styles.dateInput, 
                !startDate && styles.placeholderText
            ]}>
                {startDate || "여행 시작일"}
            </Text>
        </TouchableOpacity>
        <Text style={styles.separator}>-</Text>
        <TouchableOpacity 
            style={styles.dateInputWrapper}
            onPress={handleDateInputPress}
            activeOpacity={0.7}
        >
            <FontAwesome6 name="calendar-check" size={14} color="black" style={styles.icon} />
            {/* TextInput 대신 Text 컴포넌트 사용 */}
            <Text style={[
                styles.dateInput, 
                !endDate && styles.placeholderText
            ]}>
                {endDate || "여행 종료일"}
            </Text>
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

            <CalendarPopup
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDates={handleDateSelect}
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
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: 'white',
        flex: 1,
        height: 44,
        zIndex: 1,  // zIndex 추가
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
    dateInput: {
        flex: 1,
        color: 'black',  // 명확한 텍스트 색상
        fontSize: 16,
        fontWeight: '400',  // 폰트 weight 명시
    },
    placeholderText: {
        color: '#9ca3af',  // placeholder 색상
    },
    
});