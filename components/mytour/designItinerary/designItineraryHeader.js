import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DesignItineraryHeader = ({ 
    title, 
    dateRange, 
    startDate, 
    endDate,
    days,
    nights, 
    periodType, 
    onBackPress,
    onMemberPress, 
    tourId,  
    onEditPress,
}) => {
    const router = useRouter();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getMonth() + 1}.${date.getDate()}`;
    };

    const getDisplayDate = () => {
        if (periodType === 'date' && startDate && endDate) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
        return dateRange || '';
    };

    // 지도 아이콘 클릭 핸들러
    const handleMapPress = () => {
        if (!tourId) {
            console.warn('tourId가 없습니다!');
            return;
        }

        // ✅ 1. 전달받은 개별 props로 period 객체를 직접 만듭니다.
        const period = {
            type: periodType,
            startDate: startDate,
            endDate: endDate,
            days: days,
            nights: nights
            // '기간' 타입일 경우를 대비해 dateRange도 포함 (선택 사항)
            // nights, days 등 다른 정보도 있다면 여기에 추가할 수 있습니다.
        };

        router.push({
            pathname: '/mytour/designItinerary/itineraryMap',
            params: { 
                tourId: tourId, 
                itineraryTitle: title,
                // ✅ 2. 여기서 위에서 만든 period 객체를 사용합니다.
                periodData: JSON.stringify(period) 
            }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={onEditPress} style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.dateRange}>
                        {getDisplayDate()}
                    </Text>
                </TouchableOpacity>
                
                <View style={styles.rightIcons}>
                    <TouchableOpacity 
                        style={styles.iconContainer}
                        onPress={onMemberPress}
                    >
                        <Ionicons name="people-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.iconContainer}
                        onPress={handleMapPress}
                    >
                        <Ionicons name="map-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'flex-start',
        marginHorizontal: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    dateRange: {
        fontSize: 14,
        color: '#666',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        padding: 8,
        marginLeft: 4,
    },
});

export default DesignItineraryHeader;
