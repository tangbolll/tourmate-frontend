import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BookmarkedEvent from './BookMarkedEvent';

export default function BookmarkedTab({ bookmarkedEvents = [] }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleEventPress = (event) => {
        // 이벤트 상세 페이지로 이동하는 로직
        console.log('Event pressed:', event);
    };

    const handleBookmarkPress = (event) => {
        // 북마크 토글 로직
        console.log('Bookmark toggled:', event);
    };

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle}>즐겨찾기</Text>
                    <TouchableOpacity 
                        onPress={toggleExpanded}
                        activeOpacity={0.7}
                        style={styles.iconButton}
                    >
                        <Icon 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={24} 
                            color="#333" 
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 북마크된 이벤트들 */}
            {isExpanded && (
                <View style={styles.content}>
                    {bookmarkedEvents.length > 0 ? (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                            style={styles.scrollView}
                        >
                            {bookmarkedEvents.map((event, index) => (
                                <BookmarkedEvent
                                    key={event.id || index}
                                    tourStartDate={event.tourStartDate}
                                    tourEndDate={event.tourEndDate}
                                    title={event.title}
                                    location={event.location}
                                    imageUrl={event.imageUrl}
                                    isBookmarked={event.isBookmarked}
                                    onPress={() => handleEventPress(event)}
                                    onBookmarkPress={() => handleBookmarkPress(event)}
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Icon name="star-outline" size={40} color="#ccc" />
                            <Text style={styles.emptyText}>즐겨찾기한 이벤트가 없습니다</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginBottom: 16,
        width: '100%',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    iconButton: {
        padding: 4,
    },
    content: {
        paddingVertical: 12,
    },
    scrollView: {
        paddingLeft: 16,
    },
    scrollContent: {
        paddingRight: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});