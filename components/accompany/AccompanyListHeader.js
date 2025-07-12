import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccompanyListHeader({ onPressAlarm, onPressDM, onPressFilter, searchText, setSearchText }) {
    return (
        <View style={styles.container}>
        {/* Top Row */}
        <View style={styles.topRow}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="관심 여행지, 카테고리를 검색해보세요"
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity onPress={onPressFilter}>
                <Ionicons name="options-outline" size={20} color="#666" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onPressDM} style={styles.iconButton}>
                <Ionicons name="paper-plane-outline" size={24}/> 
            </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 2,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconRow: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 12,
        marginBottom: 5,
    },
    searchContainer: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        height: 40,
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
});
