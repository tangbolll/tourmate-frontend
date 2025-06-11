import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SortToggle } from './SortToggle';

export default function MyTourHeader({ onSortChange, onFilterPress }) {
    const handleSortChange = (sortKey) => {
        // 정렬 변경 처리
        if (onSortChange) {
            onSortChange(sortKey);
        }
        console.log('Sort changed to:', sortKey);
    };

    const handleFilterPress = () => {
        // 필터 기능 추후 구현
        if (onFilterPress) {
            onFilterPress();
        }
        console.log('Filter pressed');
    };

    return (
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
                            size={24} 
                            color="#333" 
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.divider} />
        </View>
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
        paddingVertical: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 8,
    },
    divider: {
        height: 2,
        backgroundColor: '#333',
        width: '100%',
    },
});