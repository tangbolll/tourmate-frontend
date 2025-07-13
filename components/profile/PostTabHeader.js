import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PostTabHeader = ({ activeTab, onTabPress }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.tab}
                onPress={() => onTabPress('board')}
            >
                <Text style={[styles.text, activeTab === 'board' && styles.selectedText]}>
                    엽서 보드
                </Text>
                {activeTab === 'board' && <View style={styles.underline} />}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => onTabPress('directory')}
            >
                <Text style={[styles.text, activeTab === 'directory' && styles.selectedText]}>
                    모든 엽서
                </Text>
                {activeTab === 'directory' && <View style={styles.underline} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingBottom: 12,
    },
    text: {
        fontSize: 18,
        color: '#aaa',
        fontWeight: 'bold',
    },
    selectedText: {
        color: '#000',
    },
    underline: {
        position: 'absolute',
        bottom: -1,
        width: '80%',
        height: 3,
        backgroundColor: '#000',
    },
});

export default PostTabHeader;