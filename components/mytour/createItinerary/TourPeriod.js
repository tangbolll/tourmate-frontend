import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

const TourPeriod = () => {
    const [selectedType, setSelectedType] = useState('date'); // 'date' or 'duration'

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    const renderDateInputs = () => (
        <View style={styles.dateInputsContainer}>
            <View style={styles.dateInputWrapper}>
                <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
                <TextInput
                    placeholder="여행시작일"
                    style={styles.dateInput}
                    placeholderTextColor="#9ca3af"
                />
            </View>
            <Text style={styles.separator}>-</Text>
            <View style={styles.dateInputWrapper}>
                <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
                <TextInput
                    placeholder="여행종료일"
                    style={styles.dateInput}
                    placeholderTextColor="#9ca3af"
                />
            </View>
        </View>
    );

    const renderDurationInputs = () => (
        <View style={styles.durationInputsContainer}>
            <TextInput
                keyboardType="numeric"
                style={styles.durationInput}
                placeholderTextColor="#9ca3af"
            />
            <Text style={styles.durationText}>박</Text>
            <TextInput
                keyboardType="numeric"
                style={styles.durationInput}
                placeholderTextColor="#9ca3af"
            />
            <Text style={styles.durationText}>일</Text>
        </View>
    );

    return (
        <View style={styles.container}>
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
        </View>
    );
};

export default TourPeriod;

const styles = StyleSheet.create({
    container: {
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
        height: 40,
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