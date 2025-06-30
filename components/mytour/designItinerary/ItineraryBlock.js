import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Dimensions, 
    TouchableOpacity 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width - 32; // 좌우 패딩 제외

const ItineraryBlock = ({ 
    periodType, 
    startDate, 
    endDate, 
    nights, 
    days, 
    schedules = [],
    onTimeBlockClick
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

    // 시간 배열 생성 (7시부터 23시까지)
    const timeSlots = [];
    for (let hour = 7; hour <= 23; hour++) {
        timeSlots.push(hour);
    }

    const dates = generateDates();

    // 특정 날짜와 시간에 해당하는 일정 찾기
    const findScheduleForTimeSlot = (dateInfo, hour) => {
        const targetDate = periodType === 'date' ? dateInfo.fullDate : dateInfo.displayText;
        
        return schedules.find(schedule => {
            const scheduleDate = schedule.date;
            const scheduleHour = parseInt(schedule.startTime.split(':')[0]);
            
            return scheduleDate === targetDate && scheduleHour === hour;
        });
    };

    // 카테고리별 색상 반환
    const getCategoryStyle = (category) => {
        const categoryStyles = {
            '숙소': { backgroundColor: '#FFF5CC', borderColor: '#FFD965', textColor: '#000' },
            '식사': { backgroundColor: '#FFE5D5', borderColor: '#FF9E6D', textColor: '#000' },
            '관광': { backgroundColor: '#E6F1FB', borderColor: '#A3C8E9', textColor: '#000' },
            '휴식': { backgroundColor: '#EFF5EC', borderColor: '#C6D6C3', textColor: '#000' }
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
                <View style={styles.timeLabel}>
                    <Text style={styles.timeText}>{hour}</Text>
                </View>
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
                    {schedule ? (
                        <View style={styles.scheduleContent}>
                            <Text style={[
                                styles.scheduleTitle,
                                { color: categoryStyle.textColor }
                            ]} numberOfLines={1}>
                                {schedule.title}
                            </Text>
                            {schedule.location && (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialIcons name="location-pin" size={12} color={categoryStyle.textColor} />
                                    <Text
                                        style={[styles.scheduleLocation, { color: categoryStyle.textColor, marginLeft: 4 }]}
                                        numberOfLines={1}
                                    >
                                        {schedule.location}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text style={styles.emptyBlockText}>일정 추가</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const renderDateColumn = (dateInfo, index) => {
        return (
            <View key={index} style={styles.dateColumn}>
                {/* 고정된 날짜 헤더 */}
                <View style={styles.dateHeader}>
                    {periodType === 'date' ? (
                        <Text style={styles.dateText}>
                            {dateInfo.month}.{dateInfo.date} ({dateInfo.dayName})
                        </Text>
                    ) : (
                        <Text style={styles.dateText}>{dateInfo.displayText}</Text>
                    )}
                </View>
                
                {/* 스크롤 가능한 시간 블록 영역 */}
                <ScrollView 
                    style={styles.timeSlotContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                >
                    {timeSlots.map((hour) => renderTimeSlot(hour, dateInfo))}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* 상단 슬라이드바 */}
            {dates.length > 1 && (
                <View style={styles.slideBar}>
                    <View style={styles.slideTrack}>
                        <View 
                            style={[
                                styles.slideIndicator, 
                                { 
                                    left: dates.length > 1 ? 
                                        `${(currentIndex / (dates.length - 1)) * (100 - (40 / (width - 32)) * 100)}%` : 0
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
            )}

            {/* 메인 스크롤 영역 (좌우 스크롤만) */}
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
                style={styles.horizontalScrollView}
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
        height: 30,
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
        marginBottom: 8,
    },
    slideIndicator: {
        position: 'absolute',
        top: 0,
        width: 40,
        height: 4,
        backgroundColor: '#000000',
        borderRadius: 2,
    },
    slideButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 20,
    },
    slideButton: {
        flex: 1,
        marginHorizontal: 2,
    },
    horizontalScrollView: {
        flex: 1,
    },
    scrollContent: {
        flexDirection: 'row',
    },
    dateColumn: {
        width: COLUMN_WIDTH,
        paddingHorizontal: 16,
        flex: 1,
    },
    dateHeader: {
        marginVertical: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    timeSlotContainer: {
        flex: 1,
        paddingTop: 8,
    },
    timeSlot: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        minHeight: 70,
    },
    timeLabel: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '600',
    },
    timeBlock: {
        flex: 1,
        minHeight: 60,
        backgroundColor: '#f9fafb',
        marginLeft: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 12,
        justifyContent: 'center',
    },
    scheduleContent: {
        flex: 1,
    },
    scheduleTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    scheduleTime: {
        fontSize: 12,
        marginBottom: 2,
        fontWeight: '500',
    },
    scheduleLocation: {
        padding: 2,
        fontSize: 11,
        opacity: 0.8,
    },
    emptyBlockText: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default ItineraryBlock;