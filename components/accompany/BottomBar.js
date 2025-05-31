import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

export default function BottomBar({ currentTab, onTabPress }) {
    const tabs = [
        { key: 'accompany', label: '동행', icon: 'account-multiple' },
        { key: 'zzim', label: '찜', icon: 'heart' },
        { key: 'home', label: '', icon: 'home-circle' },
        { key: 'myTrip', label: '내 여행', icon: 'airplane' },
        { key: 'profile', label: '프로필', icon: 'account' },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab, index) => (
                <TouchableOpacity 
                    key={tab.key} 
                    onPress={() => onTabPress(tab.key)} 
                    style={styles.tabItem}
                >
                    <Icon
                        name={tab.icon}
                        size={tab.key === 'home' ? 60 : 24}
                        color={currentTab === tab.key ? '#000' : '#ccc'}
                        style={tab.key === 'home' ? styles.homeIcon : null}
                    />
                    {tab.label !== '' && (
                        <Text style={[styles.label, currentTab === tab.key && styles.activeLabel]}>
                            {tab.label}
                        </Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        flexDirection: 'row',
        height: 80,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // elevation: 0,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    label: {
        marginTop: 4,
        fontSize: 12,
        color: '#ccc',
    },
    activeLabel: {
        color: '#000',
        fontWeight: 'bold',
    },
    homeIcon: {
        marginBottom: 8,
    },
});
