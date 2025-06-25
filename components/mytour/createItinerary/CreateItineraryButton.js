import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CreateItineraryButton({ isActive, onPress }) {
    const buttonStyle = [
        styles.button,
        { backgroundColor: isActive ? '#000' : '#ccc' },
    ];

    return (
        <TouchableOpacity 
            style={buttonStyle} 
            onPress={onPress}
            disabled={!isActive}
        >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.text}>여행일정 생성</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 20,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 3,
        fontWeight: '500',
    },
});