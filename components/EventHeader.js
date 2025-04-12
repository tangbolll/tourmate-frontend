import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const EventHeader = ({
    title = '화천 산천어 축제에서 놀아요',
    location = '강원도 화천',
    participantsCurrent = 3,
    participantsTotal = 5,
    newApplication = false,
    onParticipantsClick
    }) => {
    return (
        <HeaderWrapper>
        <View style={styles.container}>
            {/* 제목 */}
            <Text style={styles.title}>{title}</Text>

            {/* 위치 및 인원 정보 */}
            <View style={styles.infoRow}>
                <Icon name="map-pin" size={14} color="black" style={styles.icon} />
                <Text style={styles.infoText}>{location}</Text>

                <TouchableOpacity 
                    style={styles.participantsContainer} 
                    onPress={onParticipantsClick}
                    activeOpacity={0.7}
                >
                    <Icon name="user" size={14} color="black" style={[styles.icon, { marginLeft: 12 }]} />
                    <Text style={styles.infoText}>
                        {participantsCurrent}명 / {participantsTotal}명
                    </Text>

                    {/* 새로운 신청이 있을 때만 빨간 점 표시 */}
                    {newApplication && (
                        <View style={styles.redDot} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
        </HeaderWrapper>
    );
};

function HeaderWrapper({ children }) {
    return (
        <View style={HeaderWrapperStyles.container}>
            {children}
        </View>
    );
}

const HeaderWrapperStyles = StyleSheet.create({
    container: {
        width: '80%',
        alignSelf: 'center',
        marginTop: 0,       // 위쪽 여백
        marginBottom: 22,   // 아래쪽 여백
        borderWidth: 0,     // 테두리 없이 그림자로 표현
        padding: 12,        // 내부 여백 (텍스트와 테두리 사이 간격)
        borderRadius: 20,
        backgroundColor: 'white',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 4,
        shadowOpacity: 0.2,
    },
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 0,
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
    participantsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 2,
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