import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CreateAccompanyButton({ onPress }) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
        <Icon name="plus" size={18} color="#fff" />
        <Text style={styles.text}>동행생성</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 80,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowColor: '#000',
        shadowOpacity: 0.7,
        shadowRadius: 3,
        elevation: 8,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
    },
});
