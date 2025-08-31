// BottomSheet.js
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

const BottomSheet = ({ 
    periodType, 
    startDate, 
    endDate, 
    days,
    itineraryData = {} 
}) => {
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const getCategoryColor = (category) => {
        const categoryInfo = categories.find(cat => cat.key === category);
        return categoryInfo ? categoryInfo.color : '#A3C8E9';
    };

    const handleDaySelect = (day) => {
        setSelectedDay(day);
        setSelectedLocation(null);
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location.id);
    };

    const daysList = Object.keys(itineraryData).map(d => parseInt(d, 10));
    const currentDayItinerary = itineraryData[selectedDay] || [];

    const leftColumnItems = currentDayItinerary.filter((_, idx) => idx % 2 === 0);
    const rightColumnItems = currentDayItinerary.filter((_, idx) => idx % 2 === 1);

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
                        style={[
                            styles.dayButton,
                            selectedDay === day && styles.selectedDayButton
                        ]}
                        onPress={() => handleDaySelect(day)}
                    >
                        <Text style={[
                            styles.dayButtonText,
                            selectedDay === day && styles.selectedDayButtonText
                        ]}>
                            {day}일차
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 스케줄 리스트 */}
            <ScrollView 
                style={styles.itineraryList} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }} // 아래 여백
            >
                {currentDayItinerary.length > 0 ? (
                    <View style={styles.twoColumnContainer}>
                        <View style={styles.column}>
                            {leftColumnItems.map(item => (
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
                            {rightColumnItems.map(item => (
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
        </View>
    );
};

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
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: height * 0.5, // 여전히 최대 높이는 제한
        flexGrow: 0,             // 내용 크기만큼만
    },
    dayButtonScrollView: { 
        paddingHorizontal: 16, 
        paddingBottom: 4, 
        height: 40, 
        marginTop: 10, 
        marginBottom: 16 // 버튼과 스케줄 사이 간격 ↑
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
        marginBottom: 8, // 아이템 간격 ↑
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
