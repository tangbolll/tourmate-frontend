import React from 'react';
import { View, Text } from 'react-native';
import Member from './Member';

const MemberList = ({ members, totalCapacity }) => {
    return (
        <View className="bg-white rounded-2xl p-5 shadow-lg w-80">
            {/* 제목 */}
            <Text className="text-lg font-bold text-center mb-2">동행 목록</Text>
            
            {/* 인원 수 */}
            <View className="flex-row items-center mb-3">
                <Text className="text-black text-lg">👤 {members.length}명 / {totalCapacity}명</Text>
            </View>

            {/* 동행 멤버 목록 */}
            {members.map((member, index) => (
                <Member
                    key={index}
                    profileImage={member.profileImage}
                    nickname={member.nickname}
                    gender={member.gender}
                    age={member.age}
                    isHost={member.isHost}
                    hashtags={member.hashtags}
                />
            ))}
        </View>
    );
};

export default MemberList;
