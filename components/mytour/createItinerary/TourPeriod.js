import React, { useState } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';

const TourPeriod = () => {
    const [selectedType, setSelectedType] = useState('date'); // 'date' or 'duration'

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    const renderDateInputs = () => (
        <div style={styles.dateInputsContainer}>
        <div style={styles.dateInputWrapper}>
            <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
            <input
            type="text"
            placeholder="여행시작일"
            style={styles.dateInput}
            />
        </div>
        <span style={styles.separator}>-</span>
        <div style={styles.dateInputWrapper}>
            <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
            <input
            type="text"
            placeholder="여행종료일"
            style={styles.dateInput}
            />
        </div>
        </div>
    );

    const renderDurationInputs = () => (
        <div style={styles.durationInputsContainer}>
        <input
            type="number"
            style={styles.durationInput}
        />
        <span style={styles.durationText}>박</span>
        <input
            type="number"
            style={styles.durationInput}
        />
        <span style={styles.durationText}>일</span>
        </div>
    );

    return (
        <div style={styles.container}>
        <h2 style={styles.heading}>여행기간</h2>
        
        <div style={styles.typeSelectionContainer}>
            <div style={styles.typeOption} onClick={() => handleTypeChange('date')}>
            <div style={selectedType === 'date' ? styles.radioSelected : styles.radioUnselected}>
                {selectedType === 'date' && <div style={styles.radioInner} />}
            </div>
            <span style={styles.typeText}>날짜로 등록</span>
            </div>
            
            <div style={styles.typeOption} onClick={() => handleTypeChange('duration')}>
            <div style={selectedType === 'duration' ? styles.radioSelected : styles.radioUnselected}>
                {selectedType === 'duration' && <div style={styles.radioInner} />}
            </div>
            <span style={styles.typeText}>기간으로 등록</span>
            </div>
        </div>

        {selectedType === 'date' ? renderDateInputs() : renderDurationInputs()}
        </div>
    );
};

export default TourPeriod;

const styles = {
    container: {
        marginBottom: '24px'
    },
    heading: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#374151'
    },
    typeSelectionContainer: {
        display: 'flex',
        gap: '24px',
        marginBottom: '16px'
    },
    typeOption: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        gap: '8px'
    },
    radioSelected: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioUnselected: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '2px solid #d1d5db',
        backgroundColor: 'white'
    },
    radioInner: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'white'
    },
    typeText: {
        color: 'black',
        fontSize: '16px'
    },
    dateInputsContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    dateInputWrapper: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: 'white',
        flex: 1
    },
    icon: {
        marginRight: '8px'
    },
    dateInput: {
        border: 'none',
        outline: 'none',
        flex: 1,
        color: 'black',
        fontSize: '16px'
    },
    separator: {
        color: 'black',
        fontSize: '16px'
    },
    durationInputsContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    durationInput: {
        width: '80px',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        textAlign: 'center',
        color: 'black',
        fontSize: '16px'
    },
    durationText: {
        color: 'black',
        fontSize: '16px'
    }
};