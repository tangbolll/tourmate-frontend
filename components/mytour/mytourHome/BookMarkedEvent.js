import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const defaultImage = require('../../../assets/defaultBackground.png');

export default function BookmarkedEvent({
    tourStartDate, 
    tourEndDate,
    title, 
    location, 
    imageUrl, 
    isBookmarked = true,
    onPress, 
    onBookmarkPress
}) {
    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}.${day}`;
    };

    const formattedDateRange = `${formatDate(tourStartDate)} ~ ${formatDate(tourEndDate)}`;

    const handleCardPress = () => {
        // 상세 여행일정 페이지로 라우팅
        // navigation.navigate('TravelDetailScreen', { travelId });
        if (onPress) {
            onPress();
        }
    };

    const handleBookmarkPress = () => {
        // 즐겨찾기 토글 처리
        if (onBookmarkPress) {
            onBookmarkPress();
        }
    };

    return (
        <TouchableOpacity onPress={handleCardPress} style={styles.card}>
            <ImageBackground
                source={imageUrl ? { uri: imageUrl } : defaultImage}
                style={styles.image}
            >
                <View style={styles.darkOverlay} />

                <View style={styles.overlay}>
                    {/* 상단 날짜와 즐겨찾기 버튼 */}
                    <View style={styles.topRow}>
                        <Text style={styles.date}>{formattedDateRange}</Text>
                            <Icon 
                                name={isBookmarked ? "star" : "star-outline"} 
                                size={25} 
                                color="#FFD700" 
                                onPress={handleBookmarkPress}
                            />
                    </View>

                    {/* 타이틀 */}
                    <Text
                        style={styles.title}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {title}
                    </Text>

                    {/* 장소 */}
                    <View style={styles.locationRow}>
                        <Icon name="map-marker" size={16} color="#fff" />
                        <Text style={styles.location}>{location}</Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        opacity: 0.4,
        borderRadius: 8,
    },
    card: {
        width: 120,
        height: 100,
        marginRight: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 8,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    date: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '500',
    },
    bookmarkButton: {
        padding: 2,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    title: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 16,
        lineHeight: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    location: {
        color: '#fff',
        marginLeft: 4,
        fontWeight: 'bold',
        fontSize: 10,
    },
});