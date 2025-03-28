import React from 'react';
import { View, Text } from 'react-native';

const EventHeader = ({ 
    location = '강원도 화천', 
    participantsCurrent = 3, 
    participantsTotal = 5 
}) => {
    return (
        <View className="bg-white p-4 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
                <Text className="text-lg font-bold">화천 산천어 축제에서 놀아요</Text>
            </View>
        <View className="flex-row items-center space-x-2">
            <Text className="text-sm text-gray-600">
                {location} • {participantsCurrent}명 / {participantsTotal}명
            </Text>
        </View>
        </View>
    );
};

export default EventHeader;