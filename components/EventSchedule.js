import React from 'react';
import { View, Text } from 'react-native';
import Wrapper from './Wrapper';
import Icon from 'react-native-vector-icons/Feather'; // Feather 아이콘셋

const EventSchedule = ({
    eventDate = '3월4일(월)',
    eventTimeStart = '15:00',
    eventTimeEnd = '19:00',
    recruitStart = '3월1일(금)',
    recruitEnd = '3월3일(일)'
}) => {
    return (
        <View style={{ gap: 8 }}>
            {/* 여행기간 */}
            <Wrapper>
                <View className="flex-row items-center p-4 bg-white rounded-lg shadow">
                    <Icon name="check-square" size={20} color="black" style={{ marginRight: 8 }} />
                    <Text className="text-base">
                        <Text className="font-bold">여행기간</Text> {eventDate} {eventTimeStart} - {eventTimeEnd}
                    </Text>
                </View>
            </Wrapper>

            {/* 모집기간 */}
            <Wrapper>
                <View className="flex-row items-center p-4 bg-white rounded-lg shadow">
                    <Icon name="hourglass" size={20} color="black" style={{ marginRight: 8 }} />
                    <Text className="text-base">
                        <Text className="font-bold">모집기간</Text> {recruitStart} - {recruitEnd}
                    </Text>
                </View>
            </Wrapper>
        </View>
    );
};

export default EventSchedule;

