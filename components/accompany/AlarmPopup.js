import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AlarmPopup = ({ alarmText, onClose }) => {
    return (
        <View style={styles.container}>
        <View style={styles.card}>
            <View style={styles.headerContainer}>
            <Text style={styles.headerText}>알림</Text>
            </View>
            
            <View style={styles.contentContainer}>
            <Text style={styles.contentText}>{alarmText || '알림 내용'}</Text>
            </View>
            
            <TouchableOpacity 
            style={styles.buttonContainer} 
            onPress={onClose}
            >
            <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
    },
    card: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerContainer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    contentContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    contentText: {
        fontSize: 16,
        lineHeight: 20,
        color: '#333',
    },
    buttonContainer: {
        alignItems: 'center',
        padding: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
});

export default AlarmPopup;