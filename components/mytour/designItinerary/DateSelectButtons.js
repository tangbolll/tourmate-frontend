import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateSelectButton from './DateSelectButton';

const DateSelectButtons = ({ 
    periodType, 
    startDate, 
    endDate, 
    nights, 
    days, 
    onDaySelect,
    onGridToggle // 그리드 토글 콜백 추가
}) => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [isGridMode, setIsGridMode] = useState(false); // 그리드 모드 상태

    // 날짜 문자열을 Date 객체로 변환
    const parseDate = (dateString) => {
        if (!dateString) return null;
        // YYYY-MM-DD 형식이라고 가정
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // 요일 한글 변환
    const getDayOfWeek = (date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
    };

    // 날짜 포맷팅 (M.D 형식)
    const formatDate = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}.${day}`;
    };

    // 날짜 기반으로 버튼 데이터 생성
    const generateDateBasedButtons = () => {
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        
        if (!start || !end) return [];

        const buttons = [];
        const currentDate = new Date(start);
        let dayCount = 1;

        while (currentDate <= end) {
            buttons.push({
                dayNumber: dayCount,
                date: formatDate(currentDate),
                dayOfWeek: getDayOfWeek(currentDate)
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
            dayCount++;
        }

        return buttons;
    };

    // 기간 기반으로 버튼 데이터 생성
    const generateDurationBasedButtons = () => {
        const totalDays = parseInt(days) || 0;
        const buttons = [];

        for (let i = 1; i <= totalDays; i++) {
            buttons.push({
                dayNumber: i,
                date: null,
                dayOfWeek: null
            });
        }

        return buttons;
    };

    // 버튼 데이터 생성
    const buttonData = periodType === 'date' 
        ? generateDateBasedButtons() 
        : generateDurationBasedButtons();

    const handleDayPress = (dayNumber) => {
        setSelectedDay(dayNumber);
        setIsGridMode(false); // 날짜 선택 시 그리드 모드 해제
        onDaySelect && onDaySelect(dayNumber);
    };

    // 그리드 아이콘 클릭 핸들러
    const handleGridPress = () => {
        const newGridMode = !isGridMode;
        setIsGridMode(newGridMode);
        
        if (newGridMode) {
            setSelectedDay(null); // 그리드 모드 활성화 시 날짜 선택 해제
            onDaySelect && onDaySelect(null);
        }
        
        onGridToggle && onGridToggle(newGridMode);
    };

    // 그리드 아이콘 배경색 결정
    const getIconBackgroundColor = () => {
        return selectedDay ? '#9ca3af' : '#000';
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.iconContainer, 
                    { backgroundColor: getIconBackgroundColor() }
                ]}
                onPress={handleGridPress}
                activeOpacity={1}
            >
                <Ionicons name="grid-outline" size={20} color="#fff" />
            </TouchableOpacity>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {buttonData.map((item) => (
                    <DateSelectButton
                        key={item.dayNumber}
                        dayNumber={item.dayNumber}
                        date={item.date}
                        dayOfWeek={item.dayOfWeek}
                        isSelected={selectedDay === item.dayNumber}
                        onPress={handleDayPress}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingRight: 16,
    },
});

export default DateSelectButtons;