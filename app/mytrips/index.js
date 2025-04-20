import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyTripsScreen() {
    return (
        <View style={styles.container}>
        <Text style={styles.text}>내 여행 페이지입니다</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        fontWeight: '500',
    },
});