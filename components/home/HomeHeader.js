import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeHeader = () => {
    const handleNotificationPress = () => {
        // TODO: 알림 페이지로 이동하는 로직 구현
        console.log('알림 페이지로 이동');
    };

    return (
        <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
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
        backgroundColor: '#fff',
    },
    logo: {
        width: 150,
        height: 50,
        resizeMode: 'contain',
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