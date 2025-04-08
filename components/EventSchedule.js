import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Wrapper from './Wrapper';
import Icon from 'react-native-vector-icons/Feather'; // Feather 아이콘셋

const EventSchedule = ({
    eventDate,
    eventTimeStart,
    eventTimeEnd,
    recruitStart,
    recruitEnd
}) => {
    return (
        <View style={{ gap: 8 }}>
            {/* 여행기간 */}
            <Wrapper>
                <View style={styles.row}>
                    <Icon name="calendar" size={20} color="black" style={styles.icon} />
                    <Text style={styles.text}>
                        <Text style={styles.bold}>여행기간</Text> {eventDate} {eventTimeStart} - {eventTimeEnd}
                    </Text>
                </View>
            </Wrapper>

            {/* 모집기간 - 한 줄에 모든 정보 표시 */}
            <Wrapper>
                <View style={styles.row}>
                    <Icon name="edit" size={20} color="black" style={styles.icon} />
                    <Text style={styles.text}>
                        <Text style={styles.bold}>모집기간</Text> {recruitStart} - {recruitEnd}
                    </Text>
                </View>
            </Wrapper>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontSize: 16,
    },
    bold: {
        fontWeight: 'bold',
    }
});

export default EventSchedule;