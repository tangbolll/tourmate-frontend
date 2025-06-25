import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const TourPlace = ({ selectedRegion = [] }) => {
    const formatRegionText = () => {
        if (selectedRegion.length === 0) return '여행 장소를 선택하세요';
        
        // 나라별로 지역들을 그룹화
        const countryGroups = selectedRegion.reduce((acc, item) => {
            const country = item.country || '';
            const region = item.region || '';
            
            if (!acc[country]) {
                acc[country] = [];
            }
            acc[country].push(region);
            
            return acc;
        }, {});
        
        // 각 나라별로 "나라(지역1, 지역2)" 형태로 만들기
        return Object.entries(countryGroups).map(([country, regions]) => {
            const regionList = regions.join(', ');
            return `${country}(${regionList})`;
        }).join(', ');
    };

    const handlePress = () => {
        console.log('지역선택화면으로 이동');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>여행장소</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={handlePress}>
                <MaterialIcons name="location-pin" size={16} color="black" style={styles.icon} />
                <Text style={styles.text}>{formatRegionText()}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default TourPlace;

const styles = StyleSheet.create({
    container: {
        padding: 12,
        marginBottom: 12,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    inputContainer: {
        width: '100%',
        padding: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
});