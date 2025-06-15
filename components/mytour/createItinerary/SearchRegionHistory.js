import React, { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
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

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
        handleSearch();
        }
    };

    return (
        <div style={styles.container}>
        <SearchRegionHeader 
            searchText={searchText}
            onSearchChange={handleSearchChange}
            onBack={handleBack}
            onSearch={handleSearch}
            onKeyPress={handleKeyPress}
        />
        
        {/* 최근 검색 */}
        <div style={styles.recentSection}>
            <h3 style={styles.sectionTitle}>최근 검색</h3>
            <div style={styles.regionList}>
            {searchedRegions.map((region, index) => (
                <div key={index} style={styles.regionItem}>
                <span style={styles.regionText}>{region}</span>
                <FontAwesome
                    name="times"
                    size={16}
                    color="#666"
                    style={styles.removeIcon}
                    onPress={() => handleRemoveRegion(index)}
                />
                </div>
            ))}
            </div>
        </div>
        </div>
    );
};

export default SearchRegionHistory;

const styles = {
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: '20px'
    },
    recentSection: {
        padding: '20px 16px'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '16px'
    },
    regionList: {
        gap: '12px'
    },
    regionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: '12px',
        borderBottomWidth: '1px',
        borderBottomColor: '#f5f5f5'
    },
    regionText: {
        fontSize: '16px',
        color: '#333'
    },
    removeIcon: {
        cursor: 'pointer',
        padding: '4px'
    }
};