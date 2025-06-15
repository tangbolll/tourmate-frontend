import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

const TourPlace = ({ selectedRegion = [] }) => {
    const formatRegionText = () => {
        return selectedRegion.map(item => {
            const regionList = item.regions.join(', ');
            return `${item.country}(${regionList})`;
        }).join(', ');
    };

    const handleClick = () => {
        console.log('지역선택화면으로 이동');
    };

    return (
        <div style={styles.container}>
        <h2 style={styles.heading}>여행장소</h2>
        <div style={styles.inputContainer} onClick={handleClick}>
            <MaterialIcons name="location-pin" color="black" style={styles.icon} />
            <span style={styles.text}>{formatRegionText()}</span>
        </div>
        </div>
    );
};

export default TourPlace;

    const styles = {
    container: {
        marginBottom: '24px'
    },
    heading: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '16px',
    },
    inputContainer: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    icon: {
        marginRight: '8px',
        fontSize: '16px'
    },
    text: {
        flex: 1
    }
};