import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

const SearchRegionHeader = ({ searchText, onSearchChange, onBack, onSearch, onKeyPress }) => {
    return (
        <div style={styles.header}>
        <FontAwesome 
            name="chevron-left" 
            size={16} 
            color="black" 
            style={styles.backIcon}
            onPress={onBack}
        />
        <input
            type="text"
            placeholder="원하는 여행 지역을 검색해보세요"
            value={searchText}
            onChange={onSearchChange}
            onKeyPress={onKeyPress}
            style={styles.searchInput}
        />
        </div>
    );
};

export default SearchRegionHeader;

const styles = {
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '16px',
        paddingVertical: '12px',
        borderBottomWidth: '1px',
        borderBottomColor: '#f0f0f0'
    },
    backIcon: {
        marginRight: '12px',
        cursor: 'pointer'
    },
    searchInput: {
        flex: 1,
        padding: '12px 16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '16px',
        color: '#333',
        outline: 'none'
    }
};