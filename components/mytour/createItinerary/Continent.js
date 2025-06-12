import React, { useState } from 'react';
import { MockRegion } from './MockRegion';

const Continent = () => {
    const [selectedContinent, setSelectedContinent] = useState('국내');
    
    const continents = MockRegion.map(region => region.continent);

    const handleContinentClick = (continent) => {
        setSelectedContinent(continent);
    };

    return (
        <div className="continent-container">
            <div className="continent-chips-container">
            {continents.map((continent, index) => (
                <button
                key={index}
                onClick={() => handleContinentClick(continent)}
                className={`continent-chip ${
                    selectedContinent === continent ? 'selected' : ''
                }`}
                >
                {continent}
                </button>
            ))}
            </div>
        </div>
    );
};

export default Continent;

/* Styles */
const styles = `
    .continent-container {
        width: 100%;
        padding: 16px;
    }

    .continent-chips-container {
        display: flex;
        gap: 12px;
        min-width: max-content;
        padding: 4px 0;
    }

    .continent-chip {
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid #d1d5db;
        background-color: white;
        color: black;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
    }

    .continent-chip:hover {
        border-color: #9ca3af;
        background-color: #f9fafb;
    }

    .continent-chip.selected {
        background-color: black;
        color: white;
        border-color: black;
    }

    .continent-chip.selected:hover {
        background-color: #374151;
    }
`;

// 스타일 주입
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}