import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const PostDirectoryTab = () => {
    return (
        <ScrollView style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.title}>모든 엽서</Text>
            <Text style={styles.description}>
            디렉토리 형태로 모든 엽서들을 표시합니다.
            </Text>
            
            {/* 임시 데이터로 그리드 형태 표시 */}
            <View style={styles.grid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <View key={item} style={styles.gridItem}>
                <View style={styles.postcardPreview}>
                    <Text style={styles.previewText}>엽서 {item}</Text>
                </View>
                <Text style={styles.itemTitle}>엽서 제목 {item}</Text>
                <Text style={styles.itemDate}>2024.07.0{item}</Text>
                </View>
            ))}
            </View>
        </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: 20,
    },
    postcardPreview: {
        aspectRatio: 1.4,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    previewText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 12,
        color: '#999',
    },
});