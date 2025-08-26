import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const ItineraryTitleInput = ({ placeholder, onTitleChange }) => {
    return (
        <View style={styles.inputSection}>
            <Text style={styles.heading}>여행 제목</Text>
            <TextInput
                placeholder={placeholder}
                style={styles.input}
                placeholderTextColor="#9ca3af"
                onChangeText={onTitleChange}
            />
        </View>
    );
};

export default ItineraryTitleInput;

const styles = StyleSheet.create({
    inputSection: {
        padding: 12,
        marginBottom: 12,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        height: 44,
        padding: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#000',
    },
});