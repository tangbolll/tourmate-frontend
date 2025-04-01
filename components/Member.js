import React from 'react';
import { View, Text, Image } from 'react-native';

const Member = ({ profileImage, nickname, gender, age, isHost, hashtags }) => {
    return (
        <View className="flex-row items-center p-3">
            {/* 프로필 이미지 */}
            <Image 
                source={{ uri: profileImage }} 
                className="w-12 h-12 rounded-full mr-3"
            />
            
            {/* 사용자 정보 */}
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className="font-bold text-black mr-1">{nickname}</Text>
                    <Text className="text-gray-600">{gender} · {age}세</Text>
                    
                    {/* 호스트 표시 */}
                    {isHost && (
                        <View className="ml-2 px-2 py-1 bg-gray-200 rounded-lg">
                            <Text className="text-xs font-bold text-gray-600">호스트</Text>
                        </View>
                    )}
                </View>

                {/* 해시태그 */}
                <View className="flex-row flex-wrap mt-1">
                    {hashtags.slice(0, 4).map((tag, index) => (
                        <Text key={index} className="text-gray-500 text-sm mr-2">#{tag}</Text>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default Member;
