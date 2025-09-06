import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const SearchRegionHeader = ({ searchText, onSearchChange, onBack, onSearch }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity 
                onPress={onBack}
                style={styles.backButton}
                activeOpacity={0.7}
            >
                <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <TextInput
                placeholder="원하는 여행 지역을 검색해보세요"
                value={searchText}
                onChangeText={onSearchChange}
                style={styles.searchInput}
                returnKeyType="search"
                onSubmitEditing={onSearch}
                placeholderTextColor="#9ca3af"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        marginRight: 8,
        padding: 4,
    },
    searchInput: {
        height: 38,
        flex: 1,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
});

export default SearchRegionHeader;