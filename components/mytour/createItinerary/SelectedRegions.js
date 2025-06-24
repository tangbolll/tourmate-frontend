import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export const SelectedRegions = ({ selectedRegions, onRemoveRegion }) => {
    if (selectedRegions.length === 0) return null;

    const renderRegionItem = ({ item, index }) => (
        <View style={styles.regionItem}>
            <View style={styles.regionImage} />
            <View style={styles.regionInfo}>
                <Text style={styles.regionCountry}>{item.country}</Text>
                <Text style={styles.regionName}>{item.region}</Text>
            </View>
            <TouchableOpacity 
                onPress={() => onRemoveRegion(item.key)}
                style={styles.removeButton}
                activeOpacity={0.8}
            >
                <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>선택된 지역</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.count}>{selectedRegions.length}</Text>
                </View>
            </View>
            <FlatList
                data={selectedRegions}
                renderItem={renderRegionItem}
                keyExtractor={(item, index) => item.key || index.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.regionsGrid}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        margin: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginRight: 8,
    },
    countBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    count: {
        fontSize: 14,
        color: '#6b7280',
    },
    regionsGrid: {
        gap: 8,
    },
    regionItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        marginHorizontal: 4,
        marginVertical: 4,
        minWidth: 140,
        position: 'relative',
    },
    regionImage: {
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    regionInfo: {
        flex: 1,
    },
    regionCountry: {
        fontSize: 12,
        color: '#6b7280',
    },
    regionName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    removeButton: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});