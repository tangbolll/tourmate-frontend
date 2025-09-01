import React, { useState, useCallback } from 'react';
import { 
    SafeAreaView, 
    ScrollView, 
    View, 
    StyleSheet, 
    Text, 
    RefreshControl 
} from 'react-native';

const Alarm = () => {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // 알림 데이터 새로고침 로직
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const renderFeedItems = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>로딩 중...</Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>새로운 알림이 없습니다.</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    알림
                </Text>
            </View>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#000']}
                        tintColor={'#000'}
                    />
                }
                contentContainerStyle={styles.scrollViewContent}
            >
                {renderFeedItems()}
            </ScrollView>
        </View>
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
    scrollViewContent: {
        paddingTop: 12,
        paddingBottom: 50,
    },
    emptyState: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        lineHeight: 24,
        marginTop: 20,
    },
});

export default Alarm;