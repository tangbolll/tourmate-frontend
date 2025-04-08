import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Wrapper from './Wrapper';
import Icon from 'react-native-vector-icons/Feather';

const EventHeader = ({
    title = '화천 산천어 축제에서 놀아요',
    location = '강원도 화천',
    participantsCurrent = 3,
    participantsTotal = 5,
    newApplication = false, // ← 새로운 동행 신청 여부
    }) => {
    return (
        <Wrapper>
        <View style={styles.container}>
            {/* 제목 */}
            <Text style={styles.title}>{title}</Text>

            {/* 위치 및 인원 정보 */}
            <View style={styles.infoRow}>
            <Icon name="map-pin" size={16} color="black" style={styles.icon} />
            <Text style={styles.infoText}>{location}</Text>

            <Icon name="user" size={16} color="black" style={[styles.icon, { marginLeft: 12 }]} />
            <Text style={styles.infoText}>
                {participantsCurrent}명 / {participantsTotal}명
            </Text>

            {/* 새로운 신청이 있을 때만 빨간 점 표시 */}
            {newApplication && (
                <View style={styles.redDot} />
            )}
            </View>
        </View>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontSize: 14,
        color: '#000',
        marginHorizontal: 4,
    },
    icon: {
        marginRight: 4,
    },
    redDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
        marginLeft: 8,
    },
});

export default EventHeader;
