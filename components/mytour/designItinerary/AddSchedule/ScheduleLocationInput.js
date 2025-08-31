import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ScheduleLocationInput = ({ location, setLocation, onChangeText }) => {
    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.inputRow}>
                <View style={commonStyles.iconContainer}>
                    <Feather name="map-pin" size={16} color="#666" />
                </View>
                <TextInput
                    style={commonStyles.input}
                    value={location}
                    onChangeText={onChangeText}
                    placeholder="위치 추가 *"
                    placeholderTextColor="#CCCCCC"
                />
            </View>
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
    input: {
        flex: 1,
        fontSize: 14,
        height: 40,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
});

export default ScheduleLocationInput;