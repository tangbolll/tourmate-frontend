import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BookmarkedEvent from './BookMarkedEvent';
import Constants from 'expo-constants';


const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};


export default function BookmarkedTab({ bookmarkedEvents = [], onBookmarkUpdate }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleEventPress = (event) => {
        // 이벤트 상세 페이지로 이동하는 로직
        console.log('Event pressed:', event);
    };

    const handleBookmarkPress = async (event) => {
        console.log('handleBookmarkPress called', event.id); 
    try {
        const userId = 1; // 로그인 유저 ID
        const response = await fetch(
            `${getBaseURL()}/api/myTour/${event.id}/favorite?userId=${userId}`,
            { method: 'POST' }
        );

        if (!response.ok) throw new Error('즐겨찾기 업데이트 실패');

        // 상태 업데이트
        if (onBookmarkUpdate) onBookmarkUpdate(event.id);

        console.log('✅ 즐겨찾기 토글 완료:', event.id);
    } catch (error) {
        console.error('Bookmark update error:', error);
    }
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
                            name={isExpanded ? "chevron-down" : "chevron-up"} 
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
                            {bookmarkedEvents.map((event, index) => {
                                // 기본값
                                let locationString = '지역 정보 없음';

                                const area = event.areaName?.[0];            // 예: "광주"
                                const sigungus = event.sigunguName || [];    // 예: ["광산구", "남구"]

                                if (sigungus.length > 0) {
                                    const firstSigungu = sigungus[0];
                                    if (sigungus.length > 1) {
                                        locationString = `${area} ${firstSigungu} 외 ${sigungus.length - 1}개 지역`;
                                    } else {
                                        locationString = `${area} ${firstSigungu}`;
                                    }
                                } else if (area) {
                                    locationString = area;
                                }

                                return (
                                    <BookmarkedEvent
                                        key={event.id || index}
                                        tourStartDate={event.startDate ?? '날짜 없음'}
                                        tourEndDate={event.endDate ?? '날짜 없음'}
                                        title={event.title}
                                        location={locationString} // 최종 문자열 전달
                                        imageUrl={event.imageUrl || null}
                                        isBookmarked={event.isBookmarked}
                                        onPress={() => handleEventPress(event)}
                                        onBookmarkPress={() => handleBookmarkPress(event)}
                                    />
                                );
                            })}
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
        width: '100%',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        // borderBottomWidth: 1,
        // borderBottomColor: '#f0f0f0',
    },
    titleContainer: {
        marginLeft: 8,
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