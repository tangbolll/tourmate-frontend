import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Image,
    Platform,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Constants from 'expo-constants';
import imageMap from '../../../utils/imageMap';
import { API_URL } from '../../../utils/apiConfig';

const defaultImage = require('../../../assets/grayicon.png');


export default function AllAreaToggle({ onRegionSelect, selectedRegions = [], searchText }) {
    const [areas, setAreas] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(false);
    const [filteredAreas, setFilteredAreas] = useState([]);


    

    

    useEffect(() => {
        const fetchAllAreas = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/myTour/allArea`);
                const text = await res.text();
                let json;
                try { json = JSON.parse(text); } catch { json = { response: { body: { items: { item: [] } } } }; }
                const items = json.response?.body?.items?.item || [];

                const areasWithRegions = await Promise.all(
                    items.map(async (area) => {
                        try {
                            const res2 = await fetch(`${API_URL}/api/myTour/areaByCode/${area.code}`);
                            const text2 = await res2.text();
                            let json2;
                            try { json2 = JSON.parse(text2); } catch { return { ...area, regions: [] }; }
                            
                            const subRegionsRaw = json2.response?.body?.items?.item || [];
                            const subRegionsArray = Array.isArray(subRegionsRaw) ? subRegionsRaw : [subRegionsRaw];
                            const regions = subRegionsArray.map((r) => ({
                                name: r.name,
                                code: r.code,
                                parentCode: area.code,
                            }));
                            return { ...area, regions };
                        } catch (err) {
                            return { ...area, regions: [] };
                        }
                    })
                );
                setAreas(areasWithRegions);
            } catch (err) {
                setAreas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllAreas();
    }, []);

    useEffect(() => {
        if (!searchText) {
            setFilteredAreas(areas);
            return;
        }
        const filtered = areas.filter(country => {
            const countryMatch = country.name.toLowerCase().includes(searchText.toLowerCase());
            const regionMatch = country.regions.some(region => 
                region.name.toLowerCase().includes(searchText.toLowerCase())
            );
            return countryMatch || regionMatch;
        });
        setFilteredAreas(filtered);
    }, [searchText, areas]);

    const toggleCountry = (countryCode) => {
        setExpanded((prev) => ({ ...prev, [countryCode]: !prev[countryCode] }));
    };

    const toggleRegion = (country, region) => {
        const key = `${country}-${region.name}`;
        if (onRegionSelect) {
            onRegionSelect(key, country, region.name, region.code, region.parentCode);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.contentContainer}>
                {filteredAreas.map((country, index) => {
                    const isExpanded = expanded[country.code];
                    const displayRegions = country.regions?.slice(0, 3) || [];
                    const remaining = (country.regions?.length || 0) - displayRegions.length;

                    return (
                        <View key={index} style={styles.countryItem}>
                            <TouchableOpacity
                                style={styles.countryHeader}
                                onPress={() => toggleCountry(country.code)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.countryInfo}>
                                    <View style={styles.imageContainer}>
                                         <Image
                                            // imageMap에서 country.code에 해당하는 이미지를 찾고,
                                            // 만약 없으면(undefined) defaultImage를 사용합니다.
                                            source={imageMap[country.code] || defaultImage}
                                            style={styles.countryImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <View style={styles.countryDetails}>
                                        {!isExpanded ? (
                                            <View style={styles.countryPreviewContainer}>
                                                <Text style={styles.countryName} numberOfLines={1}>{country.name}</Text>
                                                <Text style={styles.separator}> | </Text>
                                                <Text style={styles.regionPreviewText} numberOfLines={1}>
                                                    {displayRegions.map((r) => r.name).join(', ')}
                                                    {remaining > 0 && ` 외 ${remaining}개 도시`}
                                                </Text>
                                            </View>
                                        ) : (
                                            <Text style={styles.countryName}>{country.name}</Text>
                                        )}
                                    </View>
                                </View>
                                <AntDesign name={isExpanded ? 'up' : 'down'} style={styles.chevronIcon} />
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.regionsContainer}>
                                    <View style={styles.regionsGrid}>
                                        {(country.regions || []).map((region, regionIndex) => {
                                            // ✅ Step 1: 현재 지역이 선택되었는지 확인합니다.
                                            const key = `${country.name}-${region.name}`;
                                            const isSelected = selectedRegions.includes(key);

                                            return (
                                                <TouchableOpacity
                                                    key={regionIndex}
                                                    onPress={() => toggleRegion(country.name, region)}
                                                    // ✅ Step 2: isSelected 값에 따라 스타일을 동적으로 적용합니다.
                                                    style={[
                                                        styles.regionChip,
                                                        isSelected && styles.regionChipSelected
                                                    ]}
                                                    activeOpacity={0.8}
                                                >
                                                    <Text style={[
                                                        styles.regionChipText,
                                                        isSelected && styles.regionChipTextSelected
                                                    ]}>
                                                        {region.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16
    },
    contentContainer: {
        paddingVertical: 8
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 240,
    },
    countryItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingVertical: 16
    },
    countryHeader: {
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'space-between'
    },
    countryInfo: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1, 
        marginRight: 12 
    },
    imageContainer: { 
        marginRight: 12 
    },
    countryImage: { 
        width: 36, 
        height: 36, 
        borderRadius: 8 
    },
    countryDetails: { 
        flex: 1, 
        justifyContent: 'center' 
    },
    countryPreviewContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1 
    },
    countryName: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#111827', 
        flexShrink: 0 
    },
    separator: { 
        fontSize: 14, 
        color: '#6b7280', 
        fontWeight: '400', 
        flexShrink: 0 
    },
    regionPreviewText: { 
        fontSize: 14, 
        color: '#6b7280', 
        flex: 1 
    },
    chevronIcon: { 
        fontSize: 16, 
        color: '#6b7280' 
    },
    regionsContainer: { 
        paddingTop: 8, 
        paddingLeft: 40, 
        paddingBottom: 4 
    },
    regionsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 4 
    },
    regionChip: { 
        paddingHorizontal: 12, 
        paddingVertical: 6,
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: '#d1d5db', 
        marginBottom: 4,
        marginRight: 4,
        backgroundColor: '#fff', // 기본 배경색 (흰색)
    },
    regionChipText: { 
        fontSize: 14,
        color: '#000' // 기본 글자색 (검정)
    },
    // ✅ Step 3: 선택되었을 때 적용될 새로운 스타일을 추가합니다.
    regionChipSelected: {
        backgroundColor: '#111827', // 선택 시 배경색 (검정)
        borderColor: '#111827',     // 선택 시 테두리색 (검정)
    },
    regionChipTextSelected: {
        color: '#fff', // 선택 시 글자색 (흰색)
    },
});
