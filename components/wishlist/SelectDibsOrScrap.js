import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SortToggle } from './SortToggle';

const { width } = Dimensions.get('window');

const SelectDibsOrScrap = ({ selectedTab, setSelectedTab, onSortChange }) => {

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {selectedTab === '찜' ? '동행' : '여행 엽서'}
                </Text>
            </View>

            {/* 탭 메뉴와 정렬 토글을 같은 행에 배치 */}
            <View style={styles.tabAndSortContainer}>
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
                
                {/* 정렬 토글 */}
                <SortToggle
                    selectedTab={selectedTab}
                    onSortChange={onSortChange}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
    tabAndSortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    tabContainer: {
        flexDirection: 'row',
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