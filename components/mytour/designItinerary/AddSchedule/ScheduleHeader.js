import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ScheduleHeader = ({ title, onClose }) => {
    return (
        <View style={commonStyles.header}>
            <Text style={commonStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={commonStyles.closeButton}>
                <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    );
};

const commonStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    }
});

export default ScheduleHeader;