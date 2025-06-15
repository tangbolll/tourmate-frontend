import React from 'react';

export const ItineraryTitleInput = ({ selectedRegion }) => {
    const cities = selectedRegion.reduce((acc, region) => {
        return acc.concat(region.regions);
    }, []);
    const getPlaceholder = () => {
        if (cities.length === 1) return `${cities[0]} 여행`;
        return `${cities[0]} 외 ${cities.length - 1}개 도시 여행`;
    };

    return (
        <div style={styles.container}>
        <h2 style={styles.heading}>여행 제목</h2>
        <input
            type="text"
            placeholder={getPlaceholder()}
            style={styles.input}
        />
        </div>
    );
};

const styles = {
    container: {
        marginBottom: '24px'
    },
    heading: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '16px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s ease'
    }
};