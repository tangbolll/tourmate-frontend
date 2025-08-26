import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const FindTour = () => {
    const handleAccompanyPress = () => {
        router.push('/(tab)/accompany');
    };

    const handleTourDesignPress = () => {
        router.push('/mytour/tourDesign');
    };

    return (
        <View style={styles.container}>
        <View style={styles.card}>
            <View style={styles.cardContent}>
            <Text style={styles.buttonText}>실시간으로 함께할 동행을 찾아 보세요.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleAccompanyPress}>
                <Text style={styles.actionButtonText}>동행 둘러보기</Text>
            </TouchableOpacity>
            </View>
        </View>

        <View style={styles.card}>
            <View style={styles.cardContent}>
            <Text style={styles.buttonText}>지금 바로 새로운 여행을 계획해 보세요.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleTourDesignPress}>
                <Text style={styles.actionButtonText}>여행 계획하기</Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        flex: 1,
        marginRight: 12,
    },
    actionButton: {
        height: 30,
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default FindTour;