import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const defaultImage = require('../../assets/defaultBackground.png');

export default function AccompanyCard({
    date, 
    title, 
    location, 
    imageUrl, 
    onPress, 
    userApplicationStatus // 새로 추가된 status prop
}) {
    // status에 따른 버튼 라벨 결정
    const getButtonLabel = () => {
        if (userApplicationStatus) {
            switch (userApplicationStatus) {
                case 'PENDING':
                    return '대기중';
                case 'ACCEPTED':
                    return '수락됨';
                case 'REJECTED':
                    return '거절됨';
                case 'CANCELLED':
                    return '취소됨';
                default:
                    return "신청됨";
            }
        }
        return "신청됨";
    };

    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <ImageBackground
                source={imageUrl ? { uri: imageUrl } : defaultImage}
                style={styles.image}
            >
                <View style={styles.darkOverlay} />

                <View style={styles.overlay}>
                    {/* 상단 날짜 */}
                    <View style={styles.topRow}>
                        <Text style={styles.date}>{date}</Text>
                    </View>

                    {/* 타이틀 */}
                    <Text
                        style={styles.title}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {title}
                    </Text>

                    {/* 장소 */}
                    <View style={styles.locationRow}>
                        <Icon name="map-marker" size={16} color="#fff" />
                        <Text style={styles.location}>{location}</Text>
                    </View>

                    {/* 상태별 버튼 */}
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>{getButtonLabel()}</Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        opacity: 0.4,
        borderRadius: 8,
    },
    card: {
        width: 120,
        height: 120,
        marginRight: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 8,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tag: {
        backgroundColor: 'rgba(124, 132, 175, 0)',
        color: '#fff',
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    date: {
        color: '#fff',
        fontSize: 10,
    },
    title: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    location: {
        color: '#fff',
        marginLeft: 4,
        fontWeight: 'bold',
        fontSize: 10,
    },
    button: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 8,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 13,
    },
});