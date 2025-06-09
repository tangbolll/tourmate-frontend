import React from 'react';

const DateSelectButton = ({ dayNumber, date, dayOfWeek, isSelected = false, onClick }) => {
    return (
        <button
        onClick={onClick}
        style={isSelected ? selectedStyle : unselectedStyle}
        >
        <div style={dayNumberStyle}>
            {dayNumber}일차
        </div>
        <div style={dateStyle}>
            {date} ({dayOfWeek})
        </div>
        </button>
    );
};


const selectedStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #000000',
    backgroundColor: '#000000',
    color: '#ffffff',
    minWidth: '80px',
    height: '60px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

const unselectedStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#000000',
    minWidth: '80px',
    height: '60px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};

const dayNumberStyle = {
    fontSize: '14px',
    fontWeight: '600'
};

const dateStyle = {
    fontSize: '12px',
    marginTop: '4px'
};