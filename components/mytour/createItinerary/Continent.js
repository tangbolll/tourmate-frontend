import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MockRegion } from './MockRegion';

const Continent = ({ selectedContinent, onContinentSelect }) => {
    const continents = MockRegion.map(region => region.continent);

    const handleContinentPress = (continent) => {
        onContinentSelect(continent);
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                bounces={false}
            >
                {continents.map((continent, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleContinentPress(continent)}
                        style={[
                            styles.continentChip,
                            selectedContinent === continent && styles.continentChipSelected
                        ]}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.continentChipText,
                            selectedContinent === continent && styles.continentChipTextSelected
                        ]}>
                            {continent}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingTop: 12,
        paddingHorizontal: 8,
    },
    scrollContainer: {
        paddingHorizontal: 8,
        gap: 8,
    },
    continentChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: 'white',
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continentChipSelected: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    continentChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
        textAlign: 'center',
    },
    continentChipTextSelected: {
        color: 'white',
    },
});

export default Continent;