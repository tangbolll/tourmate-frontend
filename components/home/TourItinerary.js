import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TourItinerary = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // 목데이터
    const mockSchedule = [
        { 
        id: 1, 
        title: '웨스트민스터 사원에서 구경', 
        time: '07:00 - 08:00', 
        category: '관광',
        startHour: 7,
        endHour: 8
        },
        { 
        id: 2, 
        title: '버로우마켓에서 리조또 먹기', 
        time: '08:00 - 10:00', 
        category: '식사',
        startHour: 8,
        endHour: 10
        },
        { 
        id: 3, 
        title: '여유시간', 
        time: '10:00 - 12:00', 
        category: '휴식',
        startHour: 10,
        endHour: 12
        },
        { 
        id: 4, 
        title: '숙소 체크아웃', 
        time: '12:00 - 13:00', 
        category: '숙소',
        startHour: 12,
        endHour: 13
        },
        { 
        id: 5, 
        title: '대영박물관 관람', 
        time: '13:00 - 15:00', 
        category: '관광',
        startHour: 13,
        endHour: 15
        },
        { 
        id: 6, 
        title: '런던아이 탑승', 
        time: '15:00 - 17:00', 
        category: '관광',
        startHour: 15,
        endHour: 17
        },
        { 
        id: 7, 
        title: '피시앤칩스 저녁식사', 
        time: '17:00 - 19:00', 
        category: '식사',
        startHour: 17,
        endHour: 19
        },
        { 
        id: 8, 
        title: '호텔 체크인', 
        time: '19:00 - 20:00', 
        category: '숙소',
        startHour: 19,
        endHour: 20
        }
    ];

    const categoryColors = {
        '숙소': '#FFD965',
        '식사': '#FF9E6D',
        '관광': '#A3C8E9',
        '휴식': '#C6D6C3'
    };

    // 현재 시간 (테스트용 - 실제로는 new Date()를 사용)
    const getCurrentHour = () => {
        return new Date().getHours();
    };

    const isCurrentSchedule = (startHour, endHour) => {
        const currentHour = getCurrentHour();
        return currentHour >= startHour && currentHour < endHour;
    };

    const getDisplayedSchedule = () => {
        return isExpanded ? mockSchedule : mockSchedule.slice(0, 4);
    };

    const getDayOfWeek = () => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[new Date().getDay()];
    };

    const getFormattedDate = () => {
        const date = new Date();
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    const renderScheduleItem = (item) => {
        const isActive = isCurrentSchedule(item.startHour, item.endHour);
        const categoryColor = categoryColors[item.category];
        
        return (
        <View 
            key={item.id} 
            style={[
            styles.scheduleItem,
            isActive && { backgroundColor: categoryColor + '20' }
            ]}
        >
            <View 
            style={[
                styles.categoryBar, 
                { backgroundColor: categoryColor }
            ]} 
            />
            <View style={styles.scheduleContent}>
            <Text style={styles.scheduleTitle}>{item.title}</Text>
            <Text style={styles.scheduleTime}>{item.time}</Text>
            </View>
        </View>
        );
    };

    return (
        <View style={styles.container}>
        <View style={styles.leftSection}>
            <Text style={styles.dayText}>{getDayOfWeek()}</Text>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
        </View>
        
        <View style={styles.rightSection}>
            <View style={styles.scheduleContainer}>
            {getDisplayedSchedule().map(renderScheduleItem)}
            </View>
            
            <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
            >
            <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
            />
            </TouchableOpacity>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    leftSection: {
        width: 40,
        marginLeft: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 8,
    },
    dayText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    rightSection: {
        flex: 1,
        marginLeft: 20,
    },
    scheduleContainer: {
        flex: 1,
    },
    scheduleItem: {
        flexDirection: 'row',
        borderRadius: 8,
        padding: 4,
        backgroundColor: '#fff',
    },
    categoryBar: {
        width: 4,
        borderRadius: 2,
        marginRight: 12,
    },
    scheduleContent: {
        flex: 1,
    },
    scheduleTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    scheduleTime: {
        fontSize: 10,
        color: '#666',
    },
    expandButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
});

export default TourItinerary;