import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const Comment = ({ profileImage, nickname, time, content }) => {
    return (
        <View className="flex-row items-start p-3 border-b border-gray-200">
            {/* 프로필 이미지 */}
            <Image 
                source={{ uri: profileImage }} 
                className="w-10 h-10 rounded-full mr-3"
            />
            
            {/* 댓글 내용 */}
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className="font-bold mr-2">{nickname}</Text>
                    <Text className="text-gray-500 text-sm">{time}</Text>
                </View>
                <Text className="mt-1">{content}</Text>

                {/* 답글 버튼 */}
                <TouchableOpacity className="mt-2">
                    <Text className="text-blue-500">답글</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Comment;
