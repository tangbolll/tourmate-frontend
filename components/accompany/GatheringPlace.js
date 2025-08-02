import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';

const GatheringPlace = ({ location }) => {
    const handleCopy = async () => {
        if (!location) {
            Alert.alert('알림', '복사할 장소 정보가 없습니다.');
            return;
        }

        await Clipboard.setStringAsync(location);
        Alert.alert('복사 완료', '장소 주소가 클립보드에 복사되었습니다.');
    };

    return (
        <View>
            {/* 제목 */}
            <Text style={styles.title}>모이는 장소</Text>

            {/* 주소 */}
            <View style={styles.locationContainer}>
                <MaterialCommunityIcons 
                    name="map-marker-radius" 
                    size={18} 
                    color="black" 
                    style={styles.icon}
                />
                <Text style={styles.location}>{location}</Text>
                <TouchableOpacity onPress={handleCopy}>
                    <Text style={styles.copy}>복사</Text>
                </TouchableOpacity>
            </View>

            {/* 지도 */}
            <View style={styles.mapBox}>
                <Text>지도</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 22,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 4,
    },
    location: {
        fontSize: 14,
        color: '#333',
    },
    copy: {
        fontSize: 14,
        color: '#999',
        marginLeft: 8,
        textDecorationLine: 'underline',
    },
    mapBox: {
        height: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default GatheringPlace;