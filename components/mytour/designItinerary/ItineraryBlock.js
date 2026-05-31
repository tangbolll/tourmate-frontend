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

// 세로 간격: 블록들 사이의 수직 간격
const verticalItemSpacing = 8; // 이전 8에서 조금 더 늘림
// 가로 간격: 날짜 컬럼들 사이의 수평 간격 (이전과 동일하게 유지)
const horizontalItemSpacing = 4;

// 시간 단위를 시각적 픽셀 높이로 변환하는 스케일 (블록 높이 증가)
const minuteToPixelScale = 1.4; // 1분당 1.3픽셀로 매핑하여 블록 높이 증가 (이전 1.1에서 증가)

// 시간 관련 유틸리티
const timeUtils = {
    timeToMinutes: (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    },

    minutesToTime: (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
};

// 날짜 생성 유틸리티
const dateUtils = {
    generateDates: (periodType, startDate, endDate, days) => {
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
    }
};

// 시간 슬롯 생성 유틸리티
const timeSlotUtils = {
    // 특정 날짜에 30분 단위 일정이 있는지 확인
    hasHalfHourScheduleForDay: (dayNumber, scheduleData) => {
        const dayKey = `day${dayNumber}`;
        const daySchedules = scheduleData[dayKey] || [];

        for (const schedule of daySchedules) {
            const startMinutes = timeUtils.timeToMinutes(schedule.startTime);
            const endMinutes = timeUtils.timeToMinutes(schedule.endTime);

            // 스케줄이 30분 단위로 시작하거나 끝나거나, 30분 단위를 포함하는 경우
            // 해당 시간대에 30분 블록이 필요하다고 판단
            if (startMinutes % 60 !== 0 || endMinutes % 60 !== 0 || (endMinutes - startMinutes) % 60 !== 0) {
                return true;
            }
        }
        return false;
    },

    // 각 날짜별로 필요한 30분 슬롯 정보 생성
    generateTimeSlotsForAllDays: (dates, scheduleData) => {
        const startHour = 7;
        const endHour = 24;
        const baseSlots = [];

        // 기본 시간 슬롯 생성 (1시간 단위)
        for (let hour = startHour; hour <= endHour; hour++) {
            baseSlots.push({
                hour: hour,
                minute: 0,
                timeString: `${hour}:00`,
                displayTime: hour
            });
        }

        // 각 날짜별로 특정 시간에 30분 슬롯이 필요한지 (스케줄 때문에) 표시
        const daySlotInfo = {};
        dates.forEach(dateInfo => {
            daySlotInfo[dateInfo.dayNumber] = {};

            const dayKey = `day${dateInfo.dayNumber}`;
            const daySchedules = scheduleData[dayKey] || [];

            daySchedules.forEach(schedule => {
                const startMinutes = timeUtils.timeToMinutes(schedule.startTime);
                const endMinutes = timeUtils.timeToMinutes(schedule.endTime);

                // 30분 분할이 필요한 시간을 표시
                for (let m = Math.floor(startMinutes / 30) * 30; m < endMinutes; m += 30) {
                    const hour = Math.floor(m / 60);
                    daySlotInfo[dateInfo.dayNumber][hour] = true;
                }
            });
        });

        return { baseSlots, daySlotInfo };
    }
};

// 일정 관련 유틸리티
const scheduleUtils = {
    getCategoryStyle: (category) => {
        const categoryStyles = {
            '숙소': { backgroundColor: '#FFF5CC', borderColor: '#FFD965', textColor: '#000' },
            '식사': { backgroundColor: '#FFE5D5', borderColor: '#FF9E6D', textColor: '#000' },
            '관광': { backgroundColor: '#E6F1FB', borderColor: '#A3C8E9', textColor: '#000' },
            '휴식': { backgroundColor: '#EFF5EC', borderColor: '#C6D6C3', textColor: '#000' }
        };

        return categoryStyles[category] || categoryStyles['관광'];
    },

    getScheduleInfo: (dayNumber, timeSlot, scheduleData) => {
        const dayKey = `day${dayNumber}`;
        const daySchedules = scheduleData[dayKey] || [];

        const currentMinutes = timeUtils.timeToMinutes(timeSlot.timeString);

        for (const schedule of daySchedules) {
            const startMinutes = timeUtils.timeToMinutes(schedule.startTime);
            const endMinutes = timeUtils.timeToMinutes(schedule.endTime);

            // 현재 timeSlot이 특정 일정에 포함되는지 확인
            if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                const isFirstBlockOfSchedule = currentMinutes === startMinutes;

                return {
                    schedule,
                    isFirstBlockOfSchedule,
                    startMinutes,
                    endMinutes
                };
            }
        }
        return null;
    },

    calculateBlockHeight: (startMinutes, endMinutes, dayNumber, daySlotInfo) => {
        let totalMinutesDuration = 0;
        let currentTime = startMinutes;

        while (currentTime < endMinutes) {
            const currentHour = Math.floor(currentTime / 60);
            const needsHalfHour = daySlotInfo[dayNumber] && daySlotInfo[dayNumber][currentHour];

            if (needsHalfHour) {
                // 30분 단위로 계산 (현재 시간부터 30분 또는 종료 시간까지)
                const durationToAdd = Math.min(30, endMinutes - currentTime);
                totalMinutesDuration += durationToAdd;
                currentTime += durationToAdd;
            } else {
                // 1시간 단위로 계산 (현재 시간부터 60분 또는 종료 시간까지)
                const durationToAdd = Math.min(60, endMinutes - currentTime);
                totalMinutesDuration += durationToAdd;
                currentTime += durationToAdd;
            }
        }
        // 최소 높이 보장 (0분짜리 스케줄이 아니면 최소 30분 높이)
        if (totalMinutesDuration === 0 && (endMinutes - startMinutes) > 0) {
            return 30; // 30분으로 간주하여 최소 높이 보장
        }
        return totalMinutesDuration; // 분 단위로 반환
    }
};

// 시간 라벨 컴포넌트
const TimeLabel = ({ timeSlot, index }) => {
    // 1시간 블록의 기본 시각적 높이 (픽셀)
    const timeLabelUnitHeight = 60 * minuteToPixelScale; // 60분 * 스케일

    return (
        <View key={index} style={[
            styles.timeLabel,
            // 시간 라벨 컨테이너의 높이를 조정하고 상단 마진을 적용하여 블록과 간격 조정
            { height: timeLabelUnitHeight - verticalItemSpacing, marginTop: index === 0 ? 8 : verticalItemSpacing }
        ]}>
            <Text style={styles.timeText}>{timeSlot.displayTime}</Text>
        </View>
    );
};

// 시간 블록 컴포넌트
const TimeBlock = ({
    dateInfo,
    timeSlot,
    scheduleData,
    daySlotInfo,
    onTimeBlockClick,
    DATE_BLOCK_WIDTH
}) => {
    const scheduleInfo = scheduleUtils.getScheduleInfo(
        dateInfo.dayNumber,
        timeSlot,
        scheduleData
    );

    const needsHalfHourBlockForThisHour = daySlotInfo[dateInfo.dayNumber] && daySlotInfo[dateInfo.dayNumber][timeSlot.hour];
    const isThirtyMinuteSlot = timeSlot.minute === 30;

    // 빈 블록의 기본 높이 (픽셀)
    const emptyBlockBaseVisualHeight = (needsHalfHourBlockForThisHour || isThirtyMinuteSlot) ?
        (30 * minuteToPixelScale) : // 30분 블록 높이
        (60 * minuteToPixelScale);  // 1시간 블록 높이
    
    // 실제 렌더링될 빈 블록 높이 (간격 제외)
    const emptyBlockDisplayHeight = emptyBlockBaseVisualHeight - verticalItemSpacing;

    const handlePress = () => {
        if (onTimeBlockClick) {
            let clickedTimeString;
            let clickedHour;
            let clickedMinute;
            let clickedExistingSchedule = null;

            if (scheduleInfo && scheduleInfo.schedule) {
                // 기존 일정 블록을 클릭한 경우: 해당 일정의 시작 시간을 전달
                clickedTimeString = scheduleInfo.schedule.startTime;
                [clickedHour, clickedMinute] = clickedTimeString.split(':').map(Number);
                    clickedExistingSchedule = {
                    ...scheduleInfo.schedule,
                    date: dateInfo.fullDate || dateInfo.displayText
                };
            } else {
                // 빈 블록을 클릭한 경우: 클릭한 시간 슬롯의 정확한 시작 시간을 전달
                clickedHour = timeSlot.hour;
                clickedMinute = timeSlot.minute; // 00 또는 30
                clickedTimeString = timeUtils.minutesToTime(clickedHour * 60 + clickedMinute);
            }

                        onTimeBlockClick({
                day: dateInfo.dayNumber,
                date: dateInfo.fullDate || dateInfo.displayText,
                hour: clickedHour,
                minute: clickedMinute,
                timeString: clickedTimeString,
                existingSchedule: clickedExistingSchedule
            });
        }
    };

    // 현재 timeSlot이 어떤 일정에도 속하지 않는 경우 (빈 블록)
    if (!scheduleInfo) {
        return (
            <TouchableOpacity
                style={[
                    styles.timeBlock,
                    styles.emptyTimeBlock, // 빈 블록에만 적용될 스타일
                    {
                        width: DATE_BLOCK_WIDTH,
                        height: emptyBlockDisplayHeight,
                        marginTop: verticalItemSpacing
                    }
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Text style={styles.emptyBlockText}>+</Text>
            </TouchableOpacity>
        );
    }

    // 현재 timeSlot이 일정에 속하지만, 해당 일정의 첫 번째 블록이 아닌 경우 렌더링하지 않음
    // (하나의 일정이 여러 블록에 걸쳐 중복 렌더링되는 것을 방지)
    const { schedule, isFirstBlockOfSchedule, startMinutes, endMinutes } = scheduleInfo;
    if (!isFirstBlockOfSchedule) {
        return null;
    }

    const categoryStyle = scheduleUtils.getCategoryStyle(schedule.tag);
    // 일정 블록의 높이는 일정의 총 분 단위 길이를 픽셀 스케일로 변환하여 계산
    const calculatedHeight = (
        scheduleUtils.calculateBlockHeight(
            startMinutes,
            endMinutes,
            dateInfo.dayNumber,
            daySlotInfo
        ) * minuteToPixelScale
    ) - verticalItemSpacing; // 간격 제외

    return (
        <TouchableOpacity
            style={[
                styles.timeBlock,
                {
                    width: DATE_BLOCK_WIDTH,
                    height: calculatedHeight,
                    backgroundColor: categoryStyle.backgroundColor,
                    borderColor: categoryStyle.borderColor,
                    borderWidth: 1.5,
                    marginTop: verticalItemSpacing
                }
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.scheduleContent}>
                <Text style={[
                    styles.scheduleTitle,
                    { color: categoryStyle.textColor }
                ]} numberOfLines={2}>
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
        </TouchableOpacity>
    );
};

// 날짜 컬럼 컴포넌트
const DateColumn = ({
    dateInfo,
    baseSlots,
    scheduleData,
    daySlotInfo,
    onTimeBlockClick,
    DATE_BLOCK_WIDTH
}) => {
    const renderTimeSlots = () => {
        const slots = [];

        baseSlots.forEach((baseSlot, index) => {
            const needsHalfHourForThisHour = daySlotInfo[dateInfo.dayNumber] && daySlotInfo[dateInfo.dayNumber][baseSlot.hour];

            if (needsHalfHourForThisHour) {
                // 해당 시간대가 30분 단위로 분할되어야 하는 경우, 두 개의 30분 블록을 렌더링
                const firstHalf = {
                    ...baseSlot,
                    minute: 0,
                    timeString: `${baseSlot.hour}:00`,
                };
                const secondHalf = {
                    ...baseSlot,
                    minute: 30,
                    timeString: `${baseSlot.hour}:30`,
                };

                slots.push(
                    <TimeBlock
                        key={`${dateInfo.dayNumber}-${baseSlot.hour}-00`}
                        dateInfo={dateInfo}
                        timeSlot={firstHalf}
                        scheduleData={scheduleData}
                        daySlotInfo={daySlotInfo}
                        onTimeBlockClick={onTimeBlockClick}
                        DATE_BLOCK_WIDTH={DATE_BLOCK_WIDTH}
                    />
                );

                slots.push(
                    <TimeBlock
                        key={`${dateInfo.dayNumber}-${baseSlot.hour}-30`}
                        dateInfo={dateInfo}
                        timeSlot={secondHalf}
                        scheduleData={scheduleData}
                        daySlotInfo={daySlotInfo}
                        onTimeBlockClick={onTimeBlockClick}
                        DATE_BLOCK_WIDTH={DATE_BLOCK_WIDTH}
                    />
                );
            } else {
                // 1시간 단위로 유지되는 경우, 하나의 1시간 블록을 렌더링
                slots.push(
                    <TimeBlock
                        key={`${dateInfo.dayNumber}-${baseSlot.hour}-00`}
                        dateInfo={dateInfo}
                        timeSlot={baseSlot}
                        scheduleData={scheduleData}
                        daySlotInfo={daySlotInfo}
                        onTimeBlockClick={onTimeBlockClick}
                        DATE_BLOCK_WIDTH={DATE_BLOCK_WIDTH}
                    />
                );
            }
        });

        return slots;
    };

    return (
        <View style={styles.dateColumnContainer}>
            {renderTimeSlots()}
        </View>
    );
};

// 메인 컴포넌트
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

    const isHeaderScrolling = useRef(false);
    const isBlocksScrolling = useRef(false);

    const dates = dateUtils.generateDates(periodType, startDate, endDate, days);
    const { baseSlots, daySlotInfo } = timeSlotUtils.generateTimeSlotsForAllDays(dates, scheduleData);

    // 사용 가능한 너비에서 시간 라벨 컬럼 너비(35)와 좌우 패딩(8*2)을 제외
    const availableWidth = width - 35 - (8 * 2); // 8은 gridContainer의 paddingHorizontal
    // 날짜 블록의 너비 계산 (가로 간격은 horizontalItemSpacing * 2 적용)
    const DATE_BLOCK_WIDTH = dates.length <= 3 ? 
        availableWidth / dates.length - (horizontalItemSpacing * 2) : 
        availableWidth / 3 - (horizontalItemSpacing * 2);

    const [currentVisibleRange, setCurrentVisibleRange] = useState({
        start: 1,
        end: Math.min(3, dates.length)
    });

    const updateVisibleRange = (scrollX) => {
        if (dates.length <= 3) {
            setCurrentVisibleRange({ start: 1, end: dates.length });
            return;
        }

        // 스크롤 위치에 따라 현재 보이는 날짜 범위 업데이트 (블록 너비와 가로 마진 고려)
        const currentIndex = Math.round(scrollX / (DATE_BLOCK_WIDTH + horizontalItemSpacing * 2));
        const visibleCount = Math.min(3, dates.length);
        const start = Math.max(1, currentIndex + 1);
        const end = Math.min(dates.length, start + visibleCount - 1);

        setCurrentVisibleRange({ start, end });
    };

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

    const handleVerticalScroll = (event) => {
        const scrollY = event.nativeEvent.contentOffset.y;

        if (verticalScrollViewRef.current) {
            verticalScrollViewRef.current.scrollTo({
                y: scrollY,
                animated: false
            });
        }
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
                    <View style={styles.timeColumnHeader} />

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
                            <View key={index} style={[styles.dateColumnHeader, { width: DATE_BLOCK_WIDTH, marginRight: horizontalItemSpacing * 2 }]}>
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
                            // 👇 이 속성을 추가하여 스크롤을 비활성화합니다.
                            scrollEnabled={false} 
                        >
                            {baseSlots.map((timeSlot, index) => (
                                <TimeLabel
                                    key={index}
                                    timeSlot={timeSlot}
                                    index={index}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* 일정 블록 영역 */}
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
                            <View style={styles.dateColumnsContainer}>
                                {dates.map((dateInfo, index) => (
                                    <DateColumn
                                        key={index}
                                        dateInfo={dateInfo}
                                        baseSlots={baseSlots}
                                        scheduleData={scheduleData}
                                        daySlotInfo={daySlotInfo}
                                        onTimeBlockClick={onTimeBlockClick}
                                        DATE_BLOCK_WIDTH={DATE_BLOCK_WIDTH}
                                    />
                                ))}
                            </View>
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
        marginBottom: 8,
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
        paddingHorizontal: 8, // 이 패딩은 그대로 유지
    },
    headerRow: {
        flexDirection: 'row',
        height: 20,
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
        paddingRight: horizontalItemSpacing * 2, // 가로 간격 유지
    },
    dateColumnHeader: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: horizontalItemSpacing * 2, // 가로 간격 유지
    },
    dateHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 20,
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
        paddingTop: verticalItemSpacing, // 세로 간격 적용
    },
    timeLabel: {
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingTop: verticalItemSpacing, // 세로 간격 적용
    },
    dateColumnsContainer: {
        flexDirection: 'row',
    },
    dateColumnContainer: {
        marginRight: horizontalItemSpacing * 2, // 가로 간격 유지
    },
    timeBlock: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 6,
        justifyContent: 'flex-start', // 내용 좌측 정렬
        alignItems: 'flex-start',    // 내용 좌측 정렬
        overflow: 'hidden',
    },
    emptyTimeBlock: {
        justifyContent: 'center', // 빈 블록 '+'는 중앙 정렬 유지
        alignItems: 'center',
    },
    scheduleContent: {
        flex: 1,
        width: '100%',
        alignItems: 'flex-start', // 일정 내용 좌측 정렬
        justifyContent: 'center',
    },
    scheduleTitle: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'left', // 텍스트 좌측 정렬
        flexWrap: 'wrap',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // 위치 정보 좌측 정렬
        marginTop: 2,
    },
    scheduleLocation: {
        fontSize: 9,
        marginLeft: 2,
        textAlign: 'left', // 텍스트 좌측 정렬
        opacity: 0.8,
    },
    emptyBlockText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        fontWeight: '300',
    },
});

export default ItineraryBlock;