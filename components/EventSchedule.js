import React from 'react';
import { View, Text } from 'react-native';
import Wrapper from './Wrapper';
import { CheckSquare, Hourglass } from 'lucide-react-native';

const EventSchedule = ({
    eventDate = '3월4일(월)',
    eventTimeStart = '15:00',
    eventTimeEnd = '19:00',
    recruitStart = '3월1일(금)',
    recruitEnd = '3월3일(일)'
}) => {
    return (
        <View className="space-y-2">
            {/* 여행기간 */}
            <Wrapper>
                <View className="flex-row items-center p-4 bg-white rounded-lg shadow">
                    <CheckSquare size={20} className="mr-2 text-black" />
                    <Text className="text-base">
                        <Text className="font-bold">여행기간</Text> {eventDate} {eventTimeStart} - {eventTimeEnd}
                    </Text>
                </View>
            </Wrapper>

            {/* 모집기간 */}
            <Wrapper>
                <View className="flex-row items-center p-4 bg-white rounded-lg shadow">
                    <Hourglass size={20} className="mr-2 text-black" />
                    <Text className="text-base">
                        <Text className="font-bold">모집기간</Text> {recruitStart} - {recruitEnd}
                    </Text>
                </View>
            </Wrapper>
        </View>
    );
};

export default EventSchedule;
