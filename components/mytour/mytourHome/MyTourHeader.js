import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SortToggle } from './SortToggle';
import FilterPopup from './FilterPopup';

export default function MyTourHeader({ onSortChange, onFilterPress, onFilterApply }) {
    const [filterVisible, setFilterVisible] = useState(false);
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
        setFilterVisible(true);
        if (onFilterPress) {
            onFilterPress();
        }
    };

    const handleFilterClose = () => {
        setFilterVisible(false);
    };

    const handleFilterApply = (appliedFilters) => {
        console.log('Filters applied:', appliedFilters);
        if (onFilterApply) {
            onFilterApply(appliedFilters);
        }
        setFilterVisible(false);
    };

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
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                </View>
            </View>

            <FilterPopup
                visible={filterVisible}
                onClose={handleFilterClose}
                onApply={handleFilterApply}
                filters={filters}
                setFilters={setFilters}
                onOpenCalendar={null}
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