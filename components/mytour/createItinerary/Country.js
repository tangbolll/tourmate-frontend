import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { MockRegion } from './MockRegion';

const defaultImage = require('../../../assets/defaultBackground.png');

const Country = ({ selectedContinent, onRegionSelect, selectedRegions = [] }) => {
    const [expandedCountries, setExpandedCountries] = useState({});

    // 선택된 지역 키들을 Set으로 변환 (빠른 조회를 위해)
    const selectedRegionKeys = new Set(selectedRegions.map(r => r.key));

    // 선택된 대륙에 해당하는 국가들 필터링
    const getCountriesByContinent = () => {
        if (!selectedContinent) return [];
        
        const continentData = MockRegion.find(region => region.continent === selectedContinent);
        return continentData ? continentData.countries : [];
    };

    const countries = getCountriesByContinent();

    const toggleCountry = (countryName) => {
        setExpandedCountries(prev => ({
            ...prev,
            [countryName]: !prev[countryName]
        }));
    };

    const toggleRegion = (countryName, regionName) => {
        const regionKey = `${countryName}-${regionName}`;
        if (onRegionSelect) {
            onRegionSelect(regionKey, countryName, regionName);
        }
    };

    const getDisplayRegions = (regions) => {
        if (regions.length <= 3) {
            return { display: regions, remaining: 0 };
        }
        return { 
            display: regions.slice(0, 3), 
            remaining: regions.length - 3 
        };
    };

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
            bounces={true}
        >
            <View style={styles.contentContainer}>
                {countries.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>해당 대륙의 국가 정보가 없습니다</Text>
                    </View>
                ) : (
                    countries.map((country, index) => {
                        const isExpanded = expandedCountries[country.country];
                        const { display, remaining } = getDisplayRegions(country.regions);
                        
                        return (
                            <View key={index} style={styles.countryItem}>
                                <TouchableOpacity 
                                    style={styles.countryHeader}
                                    onPress={() => toggleCountry(country.country)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.countryInfo}>
                                        <View style={styles.imageContainer}>
                                            <Image 
                                                source={defaultImage}
                                                style={styles.countryImage}
                                                resizeMode="cover"
                                            />
                                        </View>
                                        <View style={styles.countryDetails}>
                                            {!isExpanded ? (
                                                <View style={styles.countryPreviewContainer}>
                                                    <Text style={styles.countryName} numberOfLines={1}>{country.country}</Text>
                                                    <Text style={styles.separator}> | </Text>
                                                    <Text style={styles.regionPreviewText} numberOfLines={1}>
                                                        {display.join(', ')}
                                                        {remaining > 0 && ` 외 ${remaining}개 도시`}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <Text style={styles.countryName}>{country.country}</Text>
                                            )}
                                        </View>
                                    </View>
                                    
                                    <AntDesign 
                                        name={isExpanded ? "up" : "down"} 
                                        style={styles.chevronIcon} 
                                    />
                                </TouchableOpacity>
                                
                                {isExpanded && (
                                    <View style={styles.regionsContainer}>
                                        <View style={styles.regionsGrid}>
                                            {country.regions.map((region, regionIndex) => (
                                                <TouchableOpacity
                                                    key={regionIndex}
                                                    onPress={() => toggleRegion(country.country, region)}
                                                    style={[
                                                        styles.regionChip,
                                                        selectedRegionKeys.has(`${country.country}-${region}`) && styles.regionChipSelected
                                                    ]}
                                                    activeOpacity={0.8}
                                                >
                                                    <Text style={[
                                                        styles.regionChipText,
                                                        selectedRegionKeys.has(`${country.country}-${region}`) && styles.regionChipTextSelected
                                                    ]}>
                                                        {region}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
    },
    contentContainer: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    countryItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingVertical: 16,
    },
    countryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    countryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    imageContainer: {
        marginRight: 12,
    },
    countryImage: {
        width: 36,
        height: 36,
        borderRadius: 8,
    },
    countryDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    countryPreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    countryPreviewText: {
        fontSize: 14,
        lineHeight: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flexShrink: 0,
    },
    countryNameExpanded: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    separator: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '400',
        flexShrink: 0,
    },
    regionPreviewText: {
        fontSize: 14,
        color: '#6b7280',
        flex: 1,
    },
    chevronIcon: {
        fontSize: 16,
        color: '#6b7280',
    },
    regionsContainer: {
        paddingTop: 16,
        paddingLeft: 40,
        paddingBottom: 8,
    },
    regionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    regionChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#ffffff',
        marginBottom: 4,
        marginRight: 4,
    },
    regionChipSelected: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    regionChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
    },
    regionChipTextSelected: {
        color: '#ffffff',
    },
});

export default Country;