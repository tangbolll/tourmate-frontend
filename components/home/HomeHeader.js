import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeHeader = () => {
    const handleNotificationPress = () => {
        // TODO: 알림 페이지로 이동하는 로직 구현
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>TOURMATE</Text>
        <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationPress}
        >
            <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        fontStyle: 'italic',
    },
    notificationButton: {
        padding: 5,
    },
});

export default HomeHeader;