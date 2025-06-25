import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const ApplicationButton = ({ title, onPress, closed}) => {

    return (
        <View style={styles.container}>
        <TouchableOpacity 
            style={[styles.button, closed && styles.disabledButton]} 
            onPress={onPress}
            disabled={closed}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, 
        
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    button: {
        flex: 1,
        backgroundColor: 'black',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconWrapper: {
        position: 'relative',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ApplicationButton;