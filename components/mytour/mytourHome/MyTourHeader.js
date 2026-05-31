import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SortToggle } from './SortToggle';
import FilterPopup from './FilterPopup';
import CalendarPopup from './CalendarPopup';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

export default function MyTourHeader({ onSortChange, onFilterPress, onFilterApply }) {
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [calendarVisible, setCalendarVisible] = useState(false); 
    const [filters, setFilters] = useState({
        travelPeriod: '',
        travelLocation: '',
    });

    const handleSortChange = (sortKey) => {
        if (onSortChange) {
            onSortChange(sortKey);
        }
    };

    const handleFilterPress = () => {
        setShowFilterPopup(true);
        if (onFilterPress) {
            onFilterPress();
        }
    };

    const handleFilterClose = () => {
        setShowFilterPopup(false);
    };

    const handleFilterApply = (appliedFilters) => {
        setFilters(appliedFilters);
        if (onFilterApply) {
            onFilterApply(appliedFilters);
        }
        setShowFilterPopup(false);
    };

    const handleCalendarSelect = (range) => {
        const { startDate, endDate } = range; 

        if (!startDate || !endDate) {
            setFilters(prev => ({ ...prev, travelPeriod: '' }));
        } else {
            // startDate가 있으면 기존 방식대로 날짜를 포맷합니다.
            const formatted = `${dayjs(startDate).locale('ko').format('M월 D일(ddd)')} ~ ${dayjs(endDate).locale('ko').format('M월 D일(ddd)')}`;
            setFilters(prev => ({ ...prev, travelPeriod: formatted }));
        }
        
        setCalendarVisible(false);
        setTimeout(() => {
            setShowFilterPopup(true);
        }, 300);
    };

    const isLocalFilterActive = !!(filters.travelPeriod || filters.travelLocation);
    const filterIconColor = isLocalFilterActive ? '#007BFF' : '#666'; 

    return (
        <>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>나의 여행</Text>
                    <View style={styles.iconContainer}>
                        <SortToggle 
                            onSortChange={handleSortChange}
                            defaultSort="latest"
                        />
                        <TouchableOpacity 
                            onPress={handleFilterPress}
                            style={styles.iconButton}
                            activeOpacity={0.7}
                        >
                            <Icon 
                                name="tune-variant" 
                                size={20} 
                                color={filterIconColor} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                </View>
            </View>

            <FilterPopup
                visible={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                onApply={(filters) => {
                    setFilters(filters);
                    setShowFilterPopup(false);
                    if (onFilterApply) {
                        onFilterApply(filters);
                    }
                }}
                filters={filters}
                setFilters={setFilters}
                onOpenCalendar={() => {
                    setShowFilterPopup(false);
                    setTimeout(() => setCalendarVisible(true), 300);
                }}
            />

            <CalendarPopup
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDates={handleCalendarSelect}
                initialPeriod={filters.travelPeriod}
            />  
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    title: {
        marginLeft: 8,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 4,
        marginRight: 4,
    },
    dividerContainer: {
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        width: '90%',
    },
});