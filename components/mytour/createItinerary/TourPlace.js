import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TourPlace = ({ selectedRegion = [] }) => {
    const router = useRouter();

    const formatRegionText = () => {
        if (selectedRegion.length === 0) return '여행 장소를 선택하세요';
        
        const countryGroups = selectedRegion.reduce((acc, item) => {
            const country = item.country || '';
            const region = item.name || ''; // 수정: name 속성을 사용
            
            if (!acc[country]) {
                acc[country] = [];
            }
            acc[country].push(region);
            
            return acc;
        }, {});
        
        return Object.entries(countryGroups)
            .map(([country, regions]) => {
                const regionList = regions.join(', ');
                return `${country}(${regionList})`;
            })
            .join(', ');
    };

    const handlePress = () => {
        // 지역 선택 페이지로 이동
        router.back();
    };

    return (
        <View style={styles.inputSection}>
            <Text style={styles.heading}>여행 장소</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={handlePress}>
                <MaterialIcons name="location-pin" size={16} color="black" style={styles.icon} />
                <Text 
                    style={styles.text}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {formatRegionText()}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default TourPlace;

const styles = StyleSheet.create({
    inputSection: {
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
        height: 44,
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
