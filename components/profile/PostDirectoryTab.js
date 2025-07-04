import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

// 목 데이터
const mockDirectories = [
    {
        id: 1,
        title: '강릉 여행',
        startDate: '2021-03-04',
        endDate: '2021-03-06',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        postcardCount: 12
    },
    {
        id: 2,
        title: '서울 여행',
        startDate: '2021-05-01',
        endDate: '2021-05-02',
        image: 'https://images.unsplash.com/photo-1534274867514-d5b47ef22043?w=400&h=300&fit=crop',
        postcardCount: 8
    },
    {
        id: 3,
        title: '싸우지말자 부산여행',
        startDate: '2023-05-05',
        endDate: '2023-05-07',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
        postcardCount: 15
    },
    {
        id: 4,
        title: '강릉 푸른바다 여행',
        startDate: '2022-01-03',
        endDate: '2022-01-08',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        postcardCount: 6
    },
    {
        id: 5,
        title: '이태원 나들이',
        startDate: '2024-10-13',
        endDate: '2024-10-13',
        image: 'https://images.unsplash.com/photo-1617085222613-49c7a5a8e5cb?w=400&h=300&fit=crop',
        postcardCount: 4
    },
    {
        id: 6,
        title: '홍천오크 골프치러',
        startDate: '2024-05-03',
        endDate: '2024-05-05',
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
        postcardCount: 3
    }
];

export const PostDirectoryTab = () => {
    router = useRouter();
    const handleDirectoryPress = (directory) => {
    router.push({
        pathname: '/profile/postDirectory',
        params: {
            title: directory.title,
            startDate: directory.startDate,
            endDate: directory.endDate,
        }
    });
};

    const formatPeriod = (startDate, endDate) => {
        // yyyy-mm-dd 형식을 yy.mm.dd 형식으로 변환
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const year = date.getFullYear().toString().slice(-2);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}.${month}.${day}`;
        };

        if (startDate === endDate) {
            return formatDate(startDate);
        }

        const startYear = new Date(startDate).getFullYear();
        const endYear = new Date(endDate).getFullYear();
        
        const formattedStart = formatDate(startDate);
        
        if (startYear === endYear) {
            // 같은 연도면 끝날짜는 연도 생략
            const endDateObj = new Date(endDate); // 변수명 변경
            const month = String(endDateObj.getMonth() + 1).padStart(2, '0');
            const day = String(endDateObj.getDate()).padStart(2, '0');
            return `${formattedStart}~${month}.${day}`;
        } else {
            // 다른 연도면 둘 다 표시
            return `${formattedStart}~${formatDate(endDate)}`;
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <View style={styles.grid}>
                    {mockDirectories.map((directory) => (
                        <View key={directory.id} style={styles.directoryCard}>
                            <TouchableOpacity
                                style={styles.imageContainer}
                                onPress={() => handleDirectoryPress(directory)}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri: directory.image }}
                                    style={styles.directoryImage}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                            <View style={styles.textContainer}>
                                <Text style={styles.period}>
                                    {formatPeriod(directory.startDate, directory.endDate)}
                                </Text>
                                <Text style={styles.title}>{directory.title}</Text>
                            </View>
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
        backgroundColor: '#ffffff',
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    directoryCard: {
        width: '31%',
        marginBottom: 20,
        marginRight: 5,
        backgroundColor: '#fff',
        overflow: 'hidden',
        
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1.2,
        backgroundColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: {
            width: 2,   // 오른쪽 그림자
            height: 2,  // 하단 그림자
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // Android 그림자
    },
    directoryImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        padding: 6,
        alignItems: 'center',
    },
    period: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2,
        fontWeight: '400',
        textAlign: 'center',
    },
    title: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        lineHeight: 14,
        textAlign: 'center',
    },
});