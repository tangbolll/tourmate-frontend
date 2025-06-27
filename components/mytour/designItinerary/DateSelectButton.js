import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DateSelectButton = ({ 
    dayNumber, 
    date, 
    dayOfWeek, 
    isSelected = false, 
    onPress 
}) => {
    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                isSelected && styles.selectedButton
            ]} 
            onPress={() => onPress && onPress(dayNumber)}
        >
            <Text style={[
                styles.dayText, 
                isSelected && styles.selectedDayText
            ]}>
                {dayNumber}일차
            </Text>
            {date && (
                <Text style={[
                    styles.dateText, 
                    isSelected && styles.selectedDateText
                ]}>
                    {date} ({dayOfWeek})
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginRight: 8,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedButton: {
        backgroundColor: '#000',
        borderWidth: 0,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    selectedDayText: {
        color: '#fff',
    },
    dateText: {
        fontSize: 12,
        color: '#6b7280',
    },
    selectedDateText: {
        color: '#fff',
    },
});

export default DateSelectButton;