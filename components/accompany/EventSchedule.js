import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Wrapper from './Wrapper';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const EventSchedule = ({ travelStartDate, travelEndDate, recruitStartDate, recruitEndDate }) => {
    return (
        <View style={{ gap: 8 }}>
            <Wrapper>
                <View style={styles.row}>
                    <View style={styles.iconContainer}>
                        <FontAwesome6 name="calendar-check" size={16} color="black" />
                    </View>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>여행기간 </Text> {travelStartDate} - {travelEndDate}
                    </Text>
                </View>
            </Wrapper>

            <Wrapper>
                <View style={styles.row}>
                    <View style={styles.iconContainer}>
                        <FontAwesome6 name="hourglass-2" size={16} color="black" />
                    </View>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>모집기간  </Text> 
                        {(recruitStartDate === '기간미정' || !recruitEndDate) 
                            ? '호스트에게 직접 문의해주세요.' 
                            : `${recruitStartDate} - ${recruitEndDate}`}
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
    iconContainer: {
        width: 16,          
        height: 16,        
        justifyContent: 'center', 
        alignItems: 'center',    
        marginRight: 8,
    },
    text: {
        fontSize: 14,
        flex: 1,
    },
    bold: {
        fontWeight: 'bold',
    }
});

export default EventSchedule;