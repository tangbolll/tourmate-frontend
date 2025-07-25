import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SelectDibsOrScrap = ({ onClose, selectedTab, setSelectedTab }) => {

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>동행</Text>
                <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={handleClose}
                >
                    <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* 탭 메뉴 */}
            <View style={styles.tabContainer}>
                {['찜', '스크랩'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabButton,
                            selectedTab === tab && styles.tabButtonActive
                        ]}
                        onPress={() => {
                            setSelectedTab(tab);
                        }}
                    >
                        <Text style={[
                            styles.tabText,
                            selectedTab === tab && styles.tabTextActive
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 찜/스크랩 컨텐츠는 부모 컴포넌트에서 처리 */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        padding: 8,
        marginRight: -8,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 0, // 변경: paddingVertical: 16 → paddingBottom: 0
        paddingTop: 16,
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    tabButtonActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    tabText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#fff',
    },
});

export default SelectDibsOrScrap;