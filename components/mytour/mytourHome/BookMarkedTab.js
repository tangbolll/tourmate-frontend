import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BookmarkedEvent from './BookMarkedEvent';
import Constants from 'expo-constants';
import { handleBookmarkPress } from '../../../utils/MyTourApi';
import imageMap from '../../../utils/imageMap';

const defaultImage = require('../../../assets/grayicon.png');



export default function BookmarkedTab({ bookmarkedEvents = [], onBookmarkUpdate, onTourPress }) {
    if (bookmarkedEvents.length === 0) {
        return null; // 즐겨찾기가 없으면 아무것도 표시하지 않음
    }

    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleEventPress = (event) => {
        // 이벤트 상세 페이지로 이동하는 로직
        console.log('Event pressed:', event);
    };

    const handleBookmarkChange = (eventId) => {
        if (onBookmarkUpdate) {
            onBookmarkUpdate(eventId); // 부모에게 이벤트 ID를 전달하며 알림
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
                                const imageCode = event.regions?.[0]?.areaCode;
                                const imageSource = imageMap[imageCode] || defaultImage;

                                if (event.regions && event.regions.length > 0) {
                                    const firstRegion = event.regions[0];
                                    const areaName = firstRegion.areaName || '지역 정보 없음';
                                    const sigungus = firstRegion.sigungu || [];

                                    const firstSigungu = sigungus[0]?.name || '';

                                    const totalRegions = event.regions.reduce((sum, region) => sum + (region.sigungu?.length || 0), 0);
                                    const otherCount = totalRegions - 1; // 첫 지역 첫 시군 제외

                                    if (firstSigungu) {
                                        locationString = otherCount > 0
                                            ? `${areaName} ${firstSigungu} 외 ${otherCount}개 지역`
                                            : `${areaName} ${firstSigungu}`;
                                    } else {
                                        locationString = areaName;
                                    }
                                }

                                return (
                                    <BookmarkedEvent
                                        key={event.id || index}
                                        tourStartDate={event.startDate ?? '날짜 없음'}
                                        tourEndDate={event.endDate ?? '날짜 없음'}
                                        dayCount = {event.dayCount}
                                        nightCount = {event.nightCount}
                                        periodType = {event.periodType}
                                        title={event.title}
                                        location={locationString} // 최종 문자열 전달
                                        imageSource={imageSource}
                                        isBookmarked={event.isBookmarked}
                                        onPress={() => onTourPress && onTourPress(event.id)}
                                        onBookmarkPress={() => handleBookmarkChange(event.id)}
                                        

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