import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PostTabHeader = ({ activeTab, onTabPress }) => {
    return (
        <View style={styles.container}>
        <TouchableOpacity 
            style={[
            styles.tabButton, 
            activeTab === 'board' && styles.activeTab
            ]}
            onPress={() => onTabPress('board')}
        >
            <Text style={[
            styles.tabText, 
            activeTab === 'board' && styles.activeTabText
            ]}>
            엽서 보드
            </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={[
            styles.tabButton, 
            activeTab === 'directory' && styles.activeTab
            ]}
            onPress={() => onTabPress('directory')}
        >
            <Text style={[
            styles.tabText, 
            activeTab === 'directory' && styles.activeTabText
            ]}>
            모든 엽서
            </Text>
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabButton: {
        flex: 1,
        paddingBottom: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#333',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#999',
    },
    activeTabText: {
        color: '#333',
        fontWeight: '600',
    },
});

export default PostTabHeader;