import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Wrapper from './Wrapper';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

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
                    <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
                    <Text style={styles.text}>
                        <Text style={styles.bold}>여행기간  </Text> {eventDate} {eventTimeStart} - {eventTimeEnd}
                    </Text>
                </View>
            </Wrapper>

            {/* 모집기간 - 한 줄에 모든 정보 표시 */}
            <Wrapper>
                <View style={styles.row}>
                <FontAwesome6 name="hourglass-2" size={16} color="black" style={styles.icon} />
                    <Text style={styles.text}>
                        <Text style={styles.bold}>모집기간  </Text> {recruitStart} - {recruitEnd}
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
        fontSize: 14,
    },
    bold: {
        fontWeight: 'bold',
    }
});

export default EventSchedule;