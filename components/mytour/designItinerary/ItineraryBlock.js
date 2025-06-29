import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width - 32; // 좌우 패딩 제외

const ItineraryBlock = ({ 
    periodType, 
    startDate, 
    endDate, 
    nights, 
    days, 
    schedules = [], // 일정 데이터
    onTimeBlockClick // 시간 블록 클릭 핸들러
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef(null);

    // 날짜 배열 생성
    const generateDates = () => {
        const dateArray = [];
        
        if (periodType === 'date' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const month = d.getMonth() + 1;
                const date = d.getDate();
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const dayName = dayNames[d.getDay()];
                
                dateArray.push({
                    month,
                    date,
                    dayName,
                    fullDate: new Date(d).toISOString().split('T')[0]
                });
            }
        } else if (periodType === 'duration' && days) {
            for (let i = 1; i <= days; i++) {
                dateArray.push({
                    dayNumber: i,
                    displayText: `${i}일차`
                });
            }
        }
        
        return dateArray;
    };

    // 시간 배열 생성 (7시부터 24시까지)
    const timeSlots = [];
    for (let hour = 7; hour <= 23; hour++) {
        timeSlots.push(hour);
    }

    const dates = generateDates();

    // 특정 날짜와 시간에 해당하는 일정 찾기
    const findScheduleForTimeSlot = (dateInfo, hour) => {
        const targetDate = periodType === 'date' ? dateInfo.fullDate : dateInfo.displayText;
        
        return schedules.find(schedule => {
            const scheduleDate = periodType === 'date' ? schedule.date : schedule.date;
            const scheduleHour = parseInt(schedule.startTime.split(':')[0]);
            
            return scheduleDate === targetDate && scheduleHour === hour;
        });
    };

    // 카테고리별 색상 반환
    const getCategoryStyle = (category) => {
        const categoryStyles = {
            '숙소': { backgroundColor: '#e3f2fd', borderColor: '#2196f3', textColor: '#1976d2' },
            '식사': { backgroundColor: '#fff3e0', borderColor: '#ff9800', textColor: '#f57c00' },
            '관광': { backgroundColor: '#e8f5e8', borderColor: '#4caf50', textColor: '#388e3c' },
            '휴식': { backgroundColor: '#f3e5f5', borderColor: '#9c27b0', textColor: '#7b1fa2' }
        };
        
        return categoryStyles[category] || categoryStyles['관광'];
    };

    // 시간 블록 클릭 핸들러
    const handleTimeBlockPress = (dateInfo, hour) => {
        const targetDate = periodType === 'date' ? dateInfo.fullDate : dateInfo.displayText;
        const existingSchedule = findScheduleForTimeSlot(dateInfo, hour);
        
        if (onTimeBlockClick) {
            onTimeBlockClick(targetDate, hour, existingSchedule);
        }
    };

    // 슬라이드바 터치 핸들러
    const handleSlideBarPress = (index) => {
        setCurrentIndex(index);
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                x: index * COLUMN_WIDTH,
                animated: true
            });
        }
    };

    // 스크롤 이벤트 핸들러
    const handleScroll = (event) => {
        const scrollX = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollX / COLUMN_WIDTH);
        if (index !== currentIndex && index >= 0 && index < dates.length) {
            setCurrentIndex(index);
        }
    };

    const renderTimeSlot = (hour, dateInfo) => {
        const schedule = findScheduleForTimeSlot(dateInfo, hour);
        const categoryStyle = schedule ? getCategoryStyle(schedule.category) : null;
        
        return (
            <View key={hour} style={styles.timeSlot}>
                <Text style={styles.timeText}>{hour}</Text>
                <TouchableOpacity
                    style={[
                        styles.timeBlock,
                        schedule && {
                            backgroundColor: categoryStyle.backgroundColor,
                            borderColor: categoryStyle.borderColor,
                            borderWidth: 2,
                        }
                    ]}
                    onPress={() => handleTimeBlockPress(dateInfo, hour)}
                    activeOpacity={0.7}
                >
                    {schedule && (
                        <View style={styles.scheduleContent}>
                            <Text style={[
                                styles.scheduleTitle,
                                { color: categoryStyle.textColor }
                            ]} numberOfLines={1}>
                                {schedule.title}
                            </Text>
                            <Text style={[
                                styles.scheduleTime,
                                { color: categoryStyle.textColor }
                            ]}>
                                {schedule.startTime} - {schedule.endTime}
                            </Text>
                            {schedule.location && (
                                <Text style={[
                                    styles.scheduleLocation,
                                    { color: categoryStyle.textColor }
                                ]} numberOfLines={1}>
                                    📍 {schedule.location}
                                </Text>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const renderDateColumn = (dateInfo, index) => {
        const isLastColumn = index === dates.length - 1;
        
        return (
            <View key={index} style={[styles.dateColumn, isLastColumn && { marginRight: 64 }]}>
                <View style={styles.dateHeader}>
                    {periodType === 'date' ? (
                        <Text style={styles.dateText}>
                            {dateInfo.month}.{dateInfo.date} ({dateInfo.dayName})
                        </Text>
                    ) : (
                        <Text style={styles.dateText}>{dateInfo.displayText}</Text>
                    )}
                </View>
                
                <ScrollView 
                    style={styles.timeSlotContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                >
                    {timeSlots.map((hour) => renderTimeSlot(hour, dateInfo))}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* 상단 슬라이드바 */}
            <View style={styles.slideBar}>
                <View style={styles.slideTrack}>
                    <View 
                        style={[
                            styles.slideIndicator, 
                            { 
                                left: dates.length > 1 ? `${(currentIndex / (dates.length - 1)) * (100 - (40 / (width - 32)) * 100)}%` : 0
                            }
                        ]} 
                    />
                </View>
                <View style={styles.slideButtons}>
                    {dates.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.slideButton}
                            onPress={() => handleSlideBarPress(index)}
                        />
                    ))}
                </View>
            </View>

            {/* 메인 스크롤 영역 */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                onScrollEndDrag={handleScroll}
                contentContainerStyle={styles.scrollContent}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={COLUMN_WIDTH}
                snapToAlignment="start"
            >
                {dates.map((dateInfo, index) => renderDateColumn(dateInfo, index))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    slideBar: {
        height: 40,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        position: 'relative',
    },
    slideTrack: {
        height: 4,
        backgroundColor: '#f3f4f6',
        borderRadius: 2,
        position: 'relative',
        marginBottom: 6,
    },
    slideIndicator: {
        position: 'absolute',
        top: 0,
        width: 40,
        height: 4,
        backgroundColor: '#000',
        borderRadius: 2,
    },
    slideButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 18,
    },
    slideButton: {
        flex: 1,
        marginHorizontal: 2,
    },
    scrollContent: {
        flexDirection: 'row',
    },
    dateColumn: {
        width: COLUMN_WIDTH,
        paddingHorizontal: 16,
    },
    dateHeader: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    timeSlotContainer: {
        flex: 1,
    },
    timeSlot: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        minHeight: 60,
    },
    timeText: {
        fontSize: 14,
        color: '#6b7280',
        width: 30,
        textAlign: 'center',
    },
    timeBlock: {
        flex: 1,
        minHeight: 44,
        backgroundColor: '#f9fafb',
        marginLeft: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 8,
        justifyContent: 'center',
    },
    scheduleContent: {
        flex: 1,
    },
    scheduleTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    scheduleTime: {
        fontSize: 10,
        marginBottom: 2,
    },
    scheduleLocation: {
        fontSize: 10,
        opacity: 0.8,
    },
});

export default ItineraryBlock;