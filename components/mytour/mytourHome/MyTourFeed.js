import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const defaultImage = require('../../../assets/defaultBackground.png');
const { width } = Dimensions.get('window');

export default function MyTourFeed({
    imageUrl,
    tourStartDate,
    tourEndDate,
    title,
    location,
    members = [],
    isBookmarked = false,
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

    // 날짜 범위 포맷팅
    const getDateRange = () => {
        const startFormatted = formatDate(tourStartDate);
        const endFormatted = formatDate(tourEndDate);
        
        if (tourStartDate === tourEndDate) {
            return startFormatted; // 당일치기
        }
        return `${startFormatted} - ${endFormatted}`;
    };

    // 멤버 표시 함수
    const getMemberDisplay = () => {
        if (members.length === 0) return '';
        if (members.length === 1) return members[0];
        return `${members[0]} 외 ${members.length - 1}명`;
    };

    const handleCardPress = () => {
        // 상세 페이지로 이동
        if (onPress) {
            onPress();
        }
    };

    const handleBookmarkPress = () => {
        // 북마크 토글
        if (onBookmarkPress) {
            onBookmarkPress();
        }
    };

    return (
        <TouchableOpacity onPress={handleCardPress} style={styles.card}>
            {/* 이미지 영역 */}
            <View style={styles.imageContainer}>
                <Image 
                    source={imageUrl ? { uri: imageUrl } : defaultImage}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            {/* 컨텐츠 영역 */}
            <View style={styles.contentContainer}>
                {/* 날짜 */}
                <Text style={styles.date}>{getDateRange()}</Text>

                {/* 제목 */}
                <Text 
                    style={styles.title}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {title}
                </Text>

                {/* 위치와 멤버 정보 */}
                <View style={styles.infoContainer}>
                    {/* 위치 */}
                    <View style={styles.infoRow}>
                        <MaterialIcons name="location-pin" size={16} color="black" />
                        <Text style={styles.infoText}>{location}</Text>
                    </View>

                    {/* 멤버 */}
                    <View style={styles.infoRow}>
                        <Ionicons 
                            name="person" 
                            size={15} 
                            color="black" 
                            style={[styles.icon]} 
                        />
                        <Text style={styles.infoText}>{getMemberDisplay()}</Text>
                    </View>
                </View>

                {/* 북마크 버튼 */}
                <TouchableOpacity 
                    onPress={handleBookmarkPress} 
                    style={styles.bookmarkButton}
                >
                    <MaterialIcons 
                        name={isBookmarked ? "star" : "star-border"} 
                        size={24} 
                        color={isBookmarked ? "#FFD700" : "#ccc"} 
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: (width - 32) / 2, // 양쪽 마진 16씩, 두 개가 들어가도록
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 120,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        padding: 12,
        position: 'relative',
    },
    date: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        lineHeight: 18,
    },
    infoContainer: {
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        flex: 1,
    },
    icon: {
        marginRight: 4,
    },
    bookmarkButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4,
    },
});