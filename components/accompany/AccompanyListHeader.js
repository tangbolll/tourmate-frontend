import React from 'react';
import { View, Image, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GroupChats from '../../app/accompany/GroupChats';

export default function AccompanyListHeader({  onPressDM, onPressFilter, searchText, setSearchText }) {

    return (
        <View style={styles.container}>
        {/* Top Row */}
        <View style={styles.topRow}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <TouchableOpacity onPress={onPressDM} style={styles.iconButton}>
                <Ionicons name="chatbubbles-outline" size={26} color="black" />
            </TouchableOpacity>
        </View>
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
        </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 2,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    logo: {
        width: 150,
        height: 50,
        resizeMode: 'contain',
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
        width: '100%',
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