import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SearchRegionHeader from './SearchRegionHeader';

const SearchRegionHistory = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedRegions, setSearchedRegions] = useState(['부산', '제주도', '도쿄', '오사카']);

    const handleBack = () => {
        console.log('뒤로가기');
    };

    const handleRemoveRegion = (index) => {
        const newRegions = searchedRegions.filter((_, i) => i !== index);
        setSearchedRegions(newRegions);
    };

    const handleSearchChange = (text) => {
        setSearchText(text);
    };

    const handleSearch = () => {
        if (searchText.trim() !== '') {
            console.log('지도에서 검색:', searchText);
            
            // 검색 기록에 추가 (중복 제거 후 맨 앞에 추가)
            const newSearchedRegions = [searchText, ...searchedRegions.filter(region => region !== searchText)];
            setSearchedRegions(newSearchedRegions);
            
            // 검색어 초기화
            setSearchText('');
        }
    };

    return (
        <View style={styles.container}>
            <SearchRegionHeader 
                searchText={searchText}
                onSearchChange={handleSearchChange}
                onBack={handleBack}
                onSearch={handleSearch}
            />
            
            <ScrollView style={styles.scrollView}>
                {/* 최근 검색 */}
                <View style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>최근 검색</Text>
                    <View style={styles.regionList}>
                        {searchedRegions.map((region, index) => (
                            <View key={index} style={styles.regionItem}>
                                <Text style={styles.regionText}>{region}</Text>
                                <TouchableOpacity
                                    onPress={() => handleRemoveRegion(index)}
                                    style={styles.removeButton}
                                    activeOpacity={0.7}
                                >
                                    <FontAwesome
                                        name="times"
                                        size={16}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollView: {
        flex: 1,
    },
    recentSection: {
        padding: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    regionList: {
        gap: 4,
    },
    regionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    regionText: {
        fontSize: 16,
        color: '#333',
    },
    removeButton: {
        padding: 4,
    },
});

export default SearchRegionHistory;