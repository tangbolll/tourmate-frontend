import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DesignItineraryHeader = ({ 
    title, 
    dateRange, 
    startDate, 
    endDate, 
    periodType, 
    onBackPress,
    onMemberPress // 멤버 아이콘 클릭 핸들러 props로 받기
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}.${day}`;
    };

    // 날짜 표시 로직
    const getDisplayDate = () => {
        if (periodType === 'date' && startDate && endDate) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
        return dateRange || '';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.dateRange}>
                        {getDisplayDate()}
                    </Text>
                </View>
                
                <View style={styles.rightIcons}>
                    <TouchableOpacity 
                        style={styles.iconContainer}
                        onPress={onMemberPress}
                    >
                        <Ionicons name="people-outline" size={24} color="black" style={styles.peopleIcon} />
                    </TouchableOpacity>
                    <View style={styles.iconContainer}>
                        <Ionicons name="map-outline" size={24} color="black" />
                    </View>
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
        marginLeft: 8,
        marginRight: 4,
    },
    peopleIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    personIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#000',
        marginLeft: -8,
    },
});

export default DesignItineraryHeader;