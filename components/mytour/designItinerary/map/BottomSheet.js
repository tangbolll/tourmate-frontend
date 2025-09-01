import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView,
    Dimensions
} from 'react-native';

const { height } = Dimensions.get('window');

const categories = [
    { key: '숙소', label: '숙소', color: '#FFD965' },
    { key: '식사', label: '식사', color: '#FF9E6D' },
    { key: '관광', label: '관광', color: '#A3C8E9' },
    { key: '휴식', label: '휴식', color: '#C6D6C3' }
];

// 부모로부터 onLocationSelect 함수를 props로 받습니다.
const BottomSheet = ({ 
    itineraryData = {}, 
    onLocationSelect = () => {},
    onDayChange = () => {}
}) => {
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedLocationInSheet, setSelectedLocationInSheet] = useState(null);

    

    const getCategoryColor = (category) => {
        const categoryInfo = categories.find(cat => cat.key === category);
        return categoryInfo ? categoryInfo.color : '#A3C8E9';
    };

    const handleDaySelect = (day) => {
        setSelectedDay(day);
        setSelectedLocationInSheet(null);
        onDayChange(day);
    };

    const handleLocationPress = (location) => {
        setSelectedLocationInSheet(location.id);
        onLocationSelect(location); // 부모에게 선택된 위치 정보를 전달
    };

    const daysList = Object.keys(itineraryData).map(d => parseInt(d, 10));
    const currentDayItinerary = itineraryData[selectedDay] || [];

    // --- 이 부분이 다시 추가되었습니다 ---
    // 현재 선택된 날짜의 일정을 왼쪽과 오른쪽 열로 나눕니다.
    const leftColumnItems = currentDayItinerary.filter((_, idx) => idx % 2 === 0);
    const rightColumnItems = currentDayItinerary.filter((_, idx) => idx % 2 === 1);
    // --- ---

    return (
        <View style={styles.container}>
            {/* Day 버튼 */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.dayButtonScrollView}
            >
                {daysList.map(day => (
                    <TouchableOpacity
                        key={day}
                        style={[styles.dayButton, selectedDay === day && styles.selectedDayButton]}
                        onPress={() => handleDaySelect(day)}
                    >
                        <Text style={[styles.dayButtonText, selectedDay === day && styles.selectedDayButtonText]}>
                            {day}일차
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 스케줄 리스트 */}
            <ScrollView 
                style={styles.itineraryList} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {currentDayItinerary.length > 0 ? (
                    // --- 이 부분도 2열 구조로 다시 수정되었습니다 ---
                    <View style={styles.twoColumnContainer}>
                        <View style={styles.column}>
                            {leftColumnItems.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.itineraryItem}
                                    onPress={() => handleLocationPress(item)}
                                >
                                    <View style={[styles.orderCircle, { backgroundColor: getCategoryColor(item.category) }]}>
                                        <Text style={styles.orderText}>{item.order}</Text>
                                    </View>
                                    <Text style={[styles.locationName, selectedLocationInSheet === item.id && styles.selectedLocationName]}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.column}>
                            {rightColumnItems.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.itineraryItem}
                                    onPress={() => handleLocationPress(item)}
                                >
                                    <View style={[styles.orderCircle, { backgroundColor: getCategoryColor(item.category) }]}>
                                        <Text style={styles.orderText}>{item.order}</Text>
                                    </View>
                                    <Text style={[styles.locationName, selectedLocationInSheet === item.id && styles.selectedLocationName]}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    // --- ---
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>이 날의 일정이 없습니다.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

// 스타일은 이전에 제공해주신 코드를 그대로 사용했습니다.
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        paddingTop: 8,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: height * 0.5,
        flexGrow: 0,
    },
    dayButtonScrollView: { 
        paddingHorizontal: 16, 
        paddingBottom: 4, 
        height: 40, 
        marginTop: 10, 
        marginBottom: 16
    },
    dayButton: {
        backgroundColor: '#F3F4F6',
        width: 60,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    selectedDayButton: { backgroundColor: '#000' },
    selectedDayButtonText: { color: '#fff' },
    itineraryList: { paddingHorizontal: 16 },
    twoColumnContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    column: { flex: 1, marginHorizontal: 4 },
    itineraryItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 8, 
        marginBottom: 8,
        borderRadius: 8 
    },
    orderCircle: { 
        width: 24, 
        height: 24, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 8 
    },
    orderText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
    locationName: { fontSize: 14, color: '#1F2937', flex: 1, lineHeight: 18 },
    selectedLocationName: { fontWeight: 'bold', color: '#000' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 16, color: '#9CA3AF' },
});

export default BottomSheet;
