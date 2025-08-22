import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    onBookmarkPress,
    // ✅ 편집 모드 관련 prop 추가
    isEditMode,
    isSelected,
    onSelect
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
        if (isEditMode) {
            if (onSelect) {
                onSelect();
            }
        } else if (onPress) {
            onPress();
        }
    };

    const handleBookmarkPress = (event) => {
        event.stopPropagation(); // ✅ 카드 클릭 이벤트가 전파되지 않도록 막습니다.
        console.log("1단계: MyTourFeed의 별 버튼 클릭됨!"); 
        if (onBookmarkPress) {
            onBookmarkPress();
        }
    };

    return (
        <TouchableOpacity onPress={handleCardPress} style={[styles.card, isSelected && styles.selectedCard]}>
            {/* ✅ 편집 모드일 때만 체크박스 표시 */}
            {isEditMode && (
                <View style={styles.checkboxContainer}>
                    <MaterialCommunityIcons
                        name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                        size={24}
                        color={isSelected ? "#007BFF" : "white"}
                    />
                </View>
            )}

            {/* 이미지 영역 */}
            <View style={styles.imageContainer}>
                <Image 
                    source={imageUrl ? { uri: imageUrl } : defaultImage}
                    style={styles.image}
                    resizeMode="cover"
                />
                {/* 그라데이션 오버레이 */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']}
                    style={styles.gradientOverlay}
                />
            </View>

            {/* 컨텐츠 영역 */}
            <View style={styles.contentContainer}>
                {/* 날짜 + 북마크 한 줄 */}
                <View style={styles.dateRow}>
                    <Text style={styles.date}>{getDateRange()}</Text>
                    <TouchableOpacity onPress={handleBookmarkPress}>
                        <MaterialIcons 
                            name={isBookmarked ? "star" : "star-border"} 
                            size={24} 
                            color={isBookmarked ? "#FFD700" : "#ccc"} 
                        />
                    </TouchableOpacity>
                </View>

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
                            size={16} 
                            color="black" 
                            style={[styles.icon]} 
                        />
                        <Text style={styles.infoText}>{getMemberDisplay()}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: (width - 48) / 2,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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
        position: 'relative',
    },
    // ✅ 선택되었을 때 스타일 추가
    selectedCard: {
        borderColor: '#007BFF',
        borderWidth: 2,
    },
    imageContainer: {
        width: '100%',
        height: 120,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    contentContainer: {
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#666',
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
        // marginRight: 4,
    },
    bookmarkButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        padding: 4,
    },
    // ✅ 체크박스 스타일 추가
    checkboxContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 1,
    },
});
