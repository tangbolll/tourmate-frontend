import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const defaultImage = require('../../assets/defaultFeed.png');

export default function AccompanyFeed({
    title,
    tags,
    location,
    currentParticipants,
    maxRecruit,
    mainImageUrl, // Changed prop name
    liked,
    onPressLike,
    onPress,
    tripStartDate,
    tripEndDate,
}) {
    console.log('mainImageUrl:', mainImageUrl);
    
    const formattedDate = tripStartDate && tripEndDate
        ? `${dayjs(tripStartDate).locale('ko').format('MM.DD')} ~ ${dayjs(tripEndDate).locale('ko').format('MM.DD')}`
        : '날짜 미정';
    
    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <View style={styles.contentRow}>
            {/* 왼쪽 텍스트 영역 */}
            <View style={styles.textSection}>
            <Text style={styles.date}>{formattedDate}</Text>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                </View>
                ))}
            </View>

            <View style={styles.infoContainer}>
                <Icon name="map-marker" size={16} color="#666" style={{ marginBottom: -4 }} />
                <Text style={styles.infoText}>{location}</Text>
                <Icon name="account-multiple" size={16} color="#666" style={{ marginLeft: 12, marginBottom: -4 }} />
                <Text style={styles.infoText}>{currentParticipants}/{maxRecruit}</Text>
            </View>
            </View>

            {/* 오른쪽 이미지 영역 */}
            <View style={styles.imageContainer}>
            <Image source={mainImageUrl ? { uri: mainImageUrl } : defaultImage} style={styles.image} />
            <TouchableOpacity onPress={onPressLike} style={styles.heartIcon}>
                <Icon name="heart" size={30} color={liked ? '#ff3040' : 'lightgray'} />
            </TouchableOpacity>
            </View>
        </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 10,
        marginLeft: 14,
        marginRight: 12,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    date: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        backgroundColor: '#f1f1f1',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagText: {
        fontSize: 12,
        color: '#555',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    infoText: {
        marginBottom: -4,
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    heartIcon: {
        position: 'absolute',
        bottom: -10,
        right: -7,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textSection: {
        flex: 1,
        paddingRight: 10, // 이미지와 간격
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 4,
    },
    imageContainer: {
        width: 80,
        height: 80,
        position: 'relative', // 이미지와 하트 아이콘을 겹치게 하기 위해 relative로 설정
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
});
