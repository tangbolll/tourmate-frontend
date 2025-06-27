import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width - 32; // 좌우 패딩 제외

const ItineraryBlock = ({ periodType, startDate, endDate, nights, days }) => {
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

    // 시간 배열 생성 (7시부터 24시까지, 17개 시간대)
    const timeSlots = [];
    for (let hour = 7; hour <= 23; hour++) {
        timeSlots.push(hour);
    }

    const dates = generateDates();

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

    const renderDateColumn = (dateInfo, index) => {
        const isLastColumn = index === dates.length - 1;
        
        return (
            <View key={index} style={[styles.dateColumn, isLastColumn && { marginRight: 64 }]}>
                <View style={styles.dateHeader}>
                    {periodType === 'date' ? (
                        <>
                            <Text style={styles.dateText}>
                                {dateInfo.month}.{dateInfo.date} ({dateInfo.dayName})
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.dateText}>{dateInfo.displayText}</Text>
                    )}
                </View>
                
                <ScrollView 
                    style={styles.timeSlotContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                >
                    {timeSlots.map((hour) => (
                        <View key={hour} style={styles.timeSlot}>
                            <Text style={styles.timeText}>{hour}</Text>
                            <View style={styles.timeBlock} />
                        </View>
                    ))}
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
        height: 44,
        backgroundColor: '#f9fafb',
        marginLeft: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
});

export default ItineraryBlock;