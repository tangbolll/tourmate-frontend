import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlarmItem from '../components/home/AlarmItem';
import { Ionicons } from '@expo/vector-icons';

const Alarm = () => {
    // 샘플 데이터
    const alarmData = [
        {
            id: '1',
            userName: '동행거절',
            userImage: require('../assets/defaultProfile.png'), // 실제 이미지 경로로 수정
            timeAgo: '30분 전',
            message: '아쉽게도, 동행 신청이 거절되었어요.\n다른 동행을 찾아볼까요?',
            actionType: 'reject',
            actionText: '동행 둘러보기'
        },
        {
            id: '2',
            userName: '동행승인',
            userImage: require('../assets/defaultProfile1.png'),
            timeAgo: '1시간 전',
            message: '동행 신청이 수락되었어요!\n그룹채팅에 참여해보세요.',
            actionType: 'accept',
            actionText: '그룹채팅 입장'
        },
        {
            id: '3',
            userName: '동행신청',
            userImage: require('../assets/defaultProfile2.png'),
            timeAgo: '1일 전',
            message: '주리를 틀어라 · 여 · 21세\n#맛집조아 #맛집탐방',
            actionType: 'request',
            actionText: '수락',
            secondActionText: '거절'
        },
        {
            id: '4',
            userName: '리마인드',
            userImage: require('../assets/defaultProfile.png'),
            timeAgo: '12일 전',
            message: '[여라미]님 동행 마감까지 6시간 남았어요.\n동행을 마감하고 여행 준비를 시작해볼까요?',
            actionType: 'reminder',
        },
        {
            id: '5',
            userName: '코멘트',
            userImage: require('../assets/defaultProfile.png'),
            timeAgo: '6개월 전',
            message: '[말랑콩떡] 댓글을 남겼습니다.\n궁금한게 있는데요~ 같이 여행가면 밥도 사주시나요?',
            actionType: 'comment',
        }
    ];

    const renderAlarmItem = ({ item }) => (
        <AlarmItem 
            userName={item.userName}
            userImage={item.userImage}
            timeAgo={item.timeAgo}
            message={item.message}
            actionType={item.actionType}
            actionText={item.actionText}
            secondActionText={item.secondActionText}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>알람</Text>
                <View style={styles.placeholder} />
            </View>
            <FlatList
                data={alarmData}
                renderItem={renderAlarmItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    placeholder: {
        width: 32, // backButton과 같은 크기로 중앙 정렬
    },
    list: {
        flex: 1,
    },
});

export default Alarm;