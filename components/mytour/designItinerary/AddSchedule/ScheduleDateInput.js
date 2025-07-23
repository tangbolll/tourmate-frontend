import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ScheduleDateInput = ({ 
    currentSelectedDate, 
    availableDates, 
    showDateDropdown, 
    setShowDateDropdown, 
    handleDateSelect 
}) => {
    const getSelectedDateLabel = () => {
        if (!currentSelectedDate) {
            return '날짜 선택';
        }
        const selectedDateObj = availableDates.find(date => date.value === currentSelectedDate);
        const label = selectedDateObj ? selectedDateObj.label : currentSelectedDate;
        return label;
    };

    const renderDateDropdown = () => (
        <View style={commonStyles.dropdown}>
            <ScrollView style={commonStyles.dropdownScroll} nestedScrollEnabled>
                {availableDates.map((date, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            commonStyles.dropdownItem,
                            currentSelectedDate === date.value && commonStyles.dropdownItemSelected
                        ]}
                        onPress={() => {
                            handleDateSelect(date.value);
                            setShowDateDropdown(false); // Close dropdown after selection
                        }}
                    >
                        <Text style={[
                            commonStyles.dropdownItemText,
                            currentSelectedDate === date.value && commonStyles.dropdownItemTextSelected
                        ]}>
                            {date.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.inputRow}>
                <View style={commonStyles.iconContainer}>
                    <Feather name="calendar" size={16} color="#666" />
                </View>
                <TouchableOpacity
                    style={commonStyles.dropdownButton}
                    onPress={() => setShowDateDropdown(!showDateDropdown)}
                >
                    <Text style={[
                        commonStyles.dropdownText,
                        !currentSelectedDate && commonStyles.dropdownPlaceholder
                    ]}>
                        {getSelectedDateLabel()}
                    </Text>
                    <Feather 
                        name={showDateDropdown ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#666" 
                    />
                </TouchableOpacity>
            </View>
            
            {showDateDropdown && renderDateDropdown()}
        </View>
    );
};

const commonStyles = StyleSheet.create({
    section: {
        marginBottom: 16,
        position: 'relative',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        marginRight: 12,
        marginTop: 12,
    },
    dropdownButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    dropdownPlaceholder: {
        color: '#CCCCCC',
    },
    dropdown: {
        position: 'absolute',
        top: 38,
        left: 36,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        zIndex: 100000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    dropdownScroll: {
        maxHeight: 168,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemSelected: {
        backgroundColor: '#f8f9fa',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownItemTextSelected: {
        color: '#000',
        fontWeight: '600',
    },
});

export default ScheduleDateInput;