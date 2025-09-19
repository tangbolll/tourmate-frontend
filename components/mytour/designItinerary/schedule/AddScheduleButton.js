import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddScheduleButton = ({ onPress, dayNumber }) => {
    const handlePress = () => {
        onPress && onPress(dayNumber);
    };

    return (
        <TouchableOpacity 
            style={styles.button}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Ionicons name="add-circle" size={20} color="#666" />
            <Text style={styles.buttonText}>일정 추가</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingVertical: 16,
        marginTop: 8,
        marginBottom: 80,
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderStyle: 'dashed',
    },
    buttonText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        fontWeight: '500',
    },
});

export default AddScheduleButton;