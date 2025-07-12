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

const ItineraryBlock = ({ 
    periodType, 
    startDate, 
    endDate, 
    nights, 
    days, 
    scheduleData = {},
    onTimeBlockClick
}) => {
    const horizontalScrollViewRef = useRef(null);
    const verticalScrollViewRef = useRef(null);
    const blocksHorizontalScrollViewRef = useRef(null);
    const blocksVerticalScrollViewRef = useRef(null);
    
    // 스크롤 동기화를 위한 플래그
    const isHeaderScrolling = useRef(false);
    const isBlocksScrolling = useRef(false);

    // 날짜 배열 생성 함수 - 사용하기 전에 정의
    const generateDates = () => {
        const dateArray = [];
        
        if (periodType === 'date' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            let dayNumber = 1;
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const month = d.getMonth() + 1;
                const date = d.getDate();
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const dayName = dayNames[d.getDay()];
                
                dateArray.push({
                    month,
                    date,
                    dayName,
                    fullDate: new Date(d).toISOString().split('T')[0],
                    dayNumber: dayNumber++
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

    // 한 화면에 보이는 시간대 수 (18시간, 7시~24시)
    const VISIBLE_HOURS_START = 7;
    const VISIBLE_HOURS_COUNT = 18;
    const VISIBLE_HOURS_END = VISIBLE_HOURS_START + VISIBLE_HOURS_COUNT - 1;

    // 날짜 블록 너비 설정 (화면 크기에 맞춰 조정) - 3일치로 변경
    const dates = generateDates();
    const availableWidth = width - 52; // 시간 컬럼(35px) + 패딩(16px) + 마진 여유분 제외
    const DATE_BLOCK_WIDTH = dates.length <= 3 ? availableWidth / dates.length - 8 : availableWidth / 3 - 8;

    // 현재 화면에 보이는 시간대 배열 생성
    const getVisibleTimeSlots = () => {
        const timeSlots = [];
        for (let hour = VISIBLE_HOURS_START; hour <= VISIBLE_HOURS_END; hour++) {
            timeSlots.push(hour);
        }
        return timeSlots;
    };

    const visibleTimeSlots = getVisibleTimeSlots();
    
    // 현재 보이는 날짜 범위 계산 (위치 표시바용) - 3일치로 변경
    const [currentVisibleRange, setCurrentVisibleRange] = useState({ start: 1, end: Math.min(3, dates.length) });
    
    // 스크롤 위치에 따른 현재 보이는 날짜 범위 업데이트
    const updateVisibleRange = (scrollX) => {
        if (dates.length <= 3) {
            setCurrentVisibleRange({ start: 1, end: dates.length });
            return;
        }
        
        const currentIndex = Math.round(scrollX / DATE_BLOCK_WIDTH);
        const visibleCount = Math.min(3, dates.length);
        const start = Math.max(1, currentIndex + 1);
        const end = Math.min(dates.length, start + visibleCount - 1);
        
        setCurrentVisibleRange({ start, end });
    };

    // 특정 날짜와 시간에 해당하는 일정 찾기
    const findScheduleForTimeSlot = (dateInfo, hour) => {
        const dayKey = `day${dateInfo.dayNumber}`;
        const daySchedules = scheduleData[dayKey] || [];
        
        return daySchedules.find(schedule => {
            const scheduleHour = parseInt(schedule.startTime.split(':')[0]);
            return scheduleHour === hour;
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
        const existingSchedule = findScheduleForTimeSlot(dateInfo, hour);
        
        if (onTimeBlockClick) {
            onTimeBlockClick({
                day: dateInfo.dayNumber,
                date: periodType === 'date' ? dateInfo.fullDate : dateInfo.displayText,
                hour: hour,
                existingSchedule: existingSchedule
            });
        }
    };

    // 가로 스크롤 동기화 핸들러
    const handleHeaderHorizontalScroll = (event) => {
        if (isBlocksScrolling.current) return;
        
        isHeaderScrolling.current = true;
        const scrollX = event.nativeEvent.contentOffset.x;
        
        updateVisibleRange(scrollX);
        
        if (blocksHorizontalScrollViewRef.current) {
            blocksHorizontalScrollViewRef.current.scrollTo({ 
                x: scrollX, 
                animated: false 
            });
        }
        
        setTimeout(() => {
            isHeaderScrolling.current = false;
        }, 50);
    };

    const handleBlocksHorizontalScroll = (event) => {
        if (isHeaderScrolling.current) return;
        
        isBlocksScrolling.current = true;
        const scrollX = event.nativeEvent.contentOffset.x;
        
        updateVisibleRange(scrollX);
        
        if (horizontalScrollViewRef.current) {
            horizontalScrollViewRef.current.scrollTo({ 
                x: scrollX, 
                animated: false 
            });
        }
        
        setTimeout(() => {
            isBlocksScrolling.current = false;
        }, 50);
    };

    // 세로 스크롤 동기화 핸들러
    const handleVerticalScroll = (event) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        
        if (verticalScrollViewRef.current) {
            verticalScrollViewRef.current.scrollTo({ 
                y: scrollY, 
                animated: false 
            });
        }
    };
    
    // 시간 블록 렌더링
    const renderTimeBlock = (dateInfo, hour) => {
        const schedule = findScheduleForTimeSlot(dateInfo, hour);
        const categoryStyle = schedule ? getCategoryStyle(schedule.category) : null;
        
        return (
            <TouchableOpacity
                key={`${dateInfo.dayNumber}-${hour}`}
                style={[
                    styles.timeBlock,
                    { width: DATE_BLOCK_WIDTH },
                    schedule && {
                        backgroundColor: categoryStyle.backgroundColor,
                        borderColor: categoryStyle.borderColor,
                        borderWidth: 1.5,
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
                            <View style={styles.locationContainer}>
                                <MaterialIcons name="location-pin" size={10} color={categoryStyle.textColor} />
                                <Text
                                    style={[styles.scheduleLocation, { color: categoryStyle.textColor }]}
                                    numberOfLines={1}
                                >
                                    {schedule.location}
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <Text style={styles.emptyBlockText}>+</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* 상단 위치 표시바 */}
            <View style={styles.positionBar}>
                {dates.length > 3 && (
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressIndicator,
                                { 
                                    width: `${(3 / dates.length) * 100}%`,
                                    left: `${((currentVisibleRange.start - 1) / dates.length) * 100}%`
                                }
                            ]}
                        />
                    </View>
                )}
            </View>
            
            <View style={styles.gridContainer}>
                {/* 날짜 헤더 영역 */}
                <View style={styles.headerRow}>
                    {/* 시간 컬럼 헤더 (고정) */}
                    <View style={styles.timeColumnHeader} />
                    
                    {/* 날짜 헤더 (스크롤 가능) */}
                    <ScrollView
                        ref={horizontalScrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.dateHeaderScrollView}
                        contentContainerStyle={styles.dateHeaderContent}
                        scrollEventThrottle={1}
                        onScroll={handleHeaderHorizontalScroll}
                        bounces={false}
                        decelerationRate="fast"
                    >
                        {dates.map((dateInfo, index) => (
                            <View key={index} style={[styles.dateColumnHeader, { width: DATE_BLOCK_WIDTH }]}>
                                <Text style={styles.dateHeaderText}>
                                    {periodType === 'date' ? (
                                        `${dateInfo.month}/${dateInfo.date}(${dateInfo.dayName})`
                                    ) : (
                                        `${dateInfo.dayNumber}일차`
                                    )}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 메인 그리드 영역 */}
                <View style={styles.mainGrid}>
                    {/* 시간 라벨 컬럼 (고정) */}
                    <View style={styles.timeColumn}>
                        <ScrollView
                            ref={verticalScrollViewRef}
                            showsVerticalScrollIndicator={false}
                            style={styles.timeColumnScrollView}
                            scrollEventThrottle={1}
                            bounces={false}
                            decelerationRate="fast"
                        >
                            {visibleTimeSlots.map((hour) => (
                                <View key={hour} style={styles.timeLabel}>
                                    <Text style={styles.timeText}>{hour}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 일정 블록 영역 (스크롤 가능) */}
                    <ScrollView
                        ref={blocksHorizontalScrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.blocksHorizontalScrollView}
                        scrollEventThrottle={1}
                        onScroll={handleBlocksHorizontalScroll}
                        bounces={false}
                        decelerationRate="fast"
                    >
                        <ScrollView
                            ref={blocksVerticalScrollViewRef}
                            showsVerticalScrollIndicator={false}
                            style={styles.blocksVerticalScrollView}
                            scrollEventThrottle={1}
                            onScroll={handleVerticalScroll}
                            bounces={false}
                            decelerationRate="fast"
                        >
                            {visibleTimeSlots.map((hour) => (
                                <View key={hour} style={styles.timeRow}>
                                    {dates.map((dateInfo, index) => (
                                        <View key={index} style={[styles.dateColumn, { width: DATE_BLOCK_WIDTH }]}>
                                            {renderTimeBlock(dateInfo, hour)}
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 60,
    },
    positionBar: {
        height: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        position: 'relative',
    },
    progressIndicator: {
        position: 'absolute',
        top: 0,
        height: 4,
        backgroundColor: '#6b7280',
        borderRadius: 2,
    },
    gridContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    headerRow: {
        flexDirection: 'row',
        height: 40,
    },
    timeColumnHeader: {
        width: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateHeaderScrollView: {
        flex: 1,
    },
    dateHeaderContent: {
        flexDirection: 'row',
    },
    dateColumnHeader: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    dateHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 16,
    },
    mainGrid: {
        flex: 1,
        flexDirection: 'row',
    },
    timeColumn: {
        width: 35,
    },
    timeColumnScrollView: {
        flex: 1,
    },
    timeLabel: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 2,
    },
    timeText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '600',
    },
    blocksHorizontalScrollView: {
        flex: 1,
    },
    blocksVerticalScrollView: {
        flex: 1,
    },
    timeRow: {
        flexDirection: 'row',
        height: 60,
        marginVertical: 2,
    },
    dateColumn: {
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    timeBlock: {
        height: 56,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleContent: {
        flex: 1,
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    scheduleTitle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
        textAlign: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    scheduleLocation: {
        fontSize: 9,
        marginLeft: 2,
        textAlign: 'center',
        opacity: 0.8,
    },
    emptyBlockText: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        fontWeight: '300',
    },
});

export default ItineraryBlock;