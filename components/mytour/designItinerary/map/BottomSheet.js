import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView,
    Dimensions,
    Animated
} from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

// 카테고리별 색상 정의
const categories = [
    { key: '숙소', label: '숙소', icon: 'home', color: '#FFD965' },
    { key: '식사', label: '식사', icon: 'coffee', color: '#FF9E6D' },
    { key: '관광', label: '관광', icon: 'camera', color: '#A3C8E9' },
    { key: '휴식', label: '휴식', icon: 'pause-circle', color: '#C6D6C3' }
];

// 목데이터 - 실제 사용 시 props로 받아올 데이터
const mockItineraryData = {
    1: [
        { id: 1, name: '숙소 이름', category: '숙소', order: 1 },
        { id: 2, name: '빅벤', category: '관광', order: 2 },
        { id: 3, name: '런던 아이', category: '관광', order: 3 },
        { id: 4, name: '브런치 카페', category: '식사', order: 4 },
        { id: 5, name: '세인트 제임스 파크', category: '휴식', order: 5 },
        { id: 6, name: '버킹엄 궁전', category: '관광', order: 6 },
        { id: 7, name: '테이트 모던', category: '관광', order: 7 },
        { id: 8, name: '숙소 이름', category: '숙소', order: 8 },
    ],
    2: [
        { id: 9, name: '숙소 이름', category: '숙소', order: 1 },
        { id: 10, name: '브런치 카페', category: '식사', order: 2 },
        { id: 11, name: '리젠트 스트리트', category: '관광', order: 3 },
        { id: 12, name: '내셔널 갤러리', category: '관광', order: 4 },
        { id: 13, name: '코벤트 가든', category: '관광', order: 5 },
        { id: 14, name: '저녁 식사', category: '식사', order: 6 }
    ],
};

const BottomSheet = ({ 
    periodType, 
    startDate, 
    endDate, 
    nights, 
    days,
    itineraryData = mockItineraryData
}) => {
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true); // 높이 대신 확장 상태 관리
    
    const scrollY = useRef(new Animated.Value(0)).current;

    // 요일 계산 함수
    const getDayOfWeek = (dateString) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const date = new Date(dateString);
        return days[date.getDay()];
    };

    // 날짜 계산 함수
    const calculateDayInfo = () => {
        if (periodType === 'date' && startDate && endDate) {
            const start = new Date(startDate);
            const daysList = [];
            const totalDays = Math.ceil((new Date(endDate) - start) / (1000 * 60 * 60 * 24)) + 1;
            
            for (let i = 0; i < totalDays; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + i);
                const dayOfWeek = getDayOfWeek(currentDate);
                daysList.push({
                    day: i + 1,
                    date: `${currentDate.getMonth() + 1}.${currentDate.getDate()}`,
                    dayOfWeek: dayOfWeek
                });
            }
            return daysList;
        } else if (periodType === 'duration' && days) {
            const daysList = [];
            for (let i = 1; i <= days; i++) {
                daysList.push({ day: i });
            }
            return daysList;
        }
        return [];
    };

    // 카테고리에 따른 색상 반환
    const getCategoryColor = (category) => {
        const categoryInfo = categories.find(cat => cat.key === category);
        return categoryInfo ? categoryInfo.color : '#A3C8E9';
    };

    // 일차 선택 핸들러
    const handleDaySelect = (day) => {
        setSelectedDay(day);
        setSelectedLocation(null);
    };

    // 위치 선택 핸들러
    const handleLocationSelect = (location) => {
        setSelectedLocation(location.id);
    };

    // 바텀시트 높이 토글
    const toggleSheetHeight = () => {
        setIsExpanded(!isExpanded);
        
        Animated.timing(scrollY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    // 제스처 핸들러 - 스크롤 제스처만 처리
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: scrollY } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.state === State.END) {
            const { translationY, velocityY } = event.nativeEvent;
            
            // 부드러운 애니메이션으로 변경
            if (translationY < -30 || velocityY < -500) {
                // 위로 스와이프 - 확장
                setIsExpanded(true);
            } else if (translationY > 30 || velocityY > 500) {
                // 아래로 스와이프 - 축소
                setIsExpanded(false);
            }
            
            // 부드러운 복원 애니메이션
            Animated.timing(scrollY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    };

    const daysList = calculateDayInfo();
    const currentDayItinerary = itineraryData[selectedDay] || [];

    // 2열로 나누기
    const leftColumnItems = currentDayItinerary.filter((_, index) => index % 2 === 0);
    const rightColumnItems = currentDayItinerary.filter((_, index) => index % 2 === 1);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <Animated.View 
                    style={[
                        styles.container,
                        { 
                            height: isExpanded ? height * 0.35 : height * 0.1,
                            transform: [{ translateY: scrollY }]
                        }
                    ]}
                >
                {/* 상단 핸들바 */}
                <TouchableOpacity onPress={toggleSheetHeight} style={styles.handleBarContainer}>
                    <View style={styles.handleBar} />
                </TouchableOpacity>
                
                {/* 일차 선택 버튼들 */}
                <View style={styles.dayButtonContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.dayButtonScrollView}
                    >
                        {daysList.map((dayInfo) => (
                            <TouchableOpacity
                                key={dayInfo.day}
                                style={[
                                    styles.dayButton,
                                    selectedDay === dayInfo.day && styles.selectedDayButton
                                ]}
                                onPress={() => handleDaySelect(dayInfo.day)}
                            >
                                <Text style={[
                                    styles.dayButtonText,
                                    selectedDay === dayInfo.day && styles.selectedDayButtonText
                                ]}>
                                    {dayInfo.day}일차
                                </Text>
                                {dayInfo.date && (
                                    <Text style={[
                                        styles.dayButtonDate,
                                        selectedDay === dayInfo.day && styles.selectedDayButtonDate
                                    ]}>
                                        {dayInfo.date} ({dayInfo.dayOfWeek})
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 일정 리스트 - 2열 구성 */}
                <ScrollView style={styles.itineraryList} showsVerticalScrollIndicator={false}>
                    {currentDayItinerary.length > 0 ? (
                        <View style={styles.twoColumnContainer}>
                            <View style={styles.column}>
                                {leftColumnItems.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.itineraryItem}
                                        onPress={() => handleLocationSelect(item)}
                                    >
                                        <View style={[
                                            styles.orderCircle,
                                            { backgroundColor: getCategoryColor(item.category) }
                                        ]}>
                                            <Text style={styles.orderText}>{item.order}</Text>
                                        </View>
                                        <Text style={[
                                            styles.locationName,
                                            selectedLocation === item.id && styles.selectedLocationName
                                        ]}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.column}>
                                {rightColumnItems.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.itineraryItem}
                                        onPress={() => handleLocationSelect(item)}
                                    >
                                        <View style={[
                                            styles.orderCircle,
                                            { backgroundColor: getCategoryColor(item.category) }
                                        ]}>
                                            <Text style={styles.orderText}>{item.order}</Text>
                                        </View>
                                        <Text style={[
                                            styles.locationName,
                                            selectedLocation === item.id && styles.selectedLocationName
                                        ]}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>이 날의 일정이 없습니다.</Text>
                        </View>
                    )}
                </ScrollView>
                </Animated.View>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    handleBarContainer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
    },
    dayButtonContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    dayButtonScrollView: {
        paddingRight: 16,
    },
    dayButton: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        alignItems: 'center',
        minWidth: 80,
    },
    selectedDayButton: {
        backgroundColor: '#000',
    },
    dayButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    selectedDayButtonText: {
        color: '#fff',
    },
    dayButtonDate: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    selectedDayButtonDate: {
        color: '#D1D5DB',
    },
    itineraryList: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    twoColumnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flex: 1,
        marginHorizontal: 4,
    },
    itineraryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginBottom: 4,
        borderRadius: 8,
    },
    orderCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    orderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    locationName: {
        fontSize: 14,
        color: '#1F2937',
        flex: 1,
        lineHeight: 18,
    },
    selectedLocationName: {
        fontWeight: 'bold',
        color: '#000',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
    },
});

export default BottomSheet;