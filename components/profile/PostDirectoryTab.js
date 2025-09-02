import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export const PostDirectoryTab = ({ folders, onEditFolder }) => {
    const router = useRouter();

    const handleDirectoryPress = (folder) => {
        router.push({
            pathname: '/profile/postDirectory',
            params: {
                directoryId: folder.folderId, 
                title: folder.title,
                startDate: folder.startDate,
                endDate: folder.endDate,
            }
        });
    };

    const formatPeriod = (startDate, endDate) => {
        const formatDate = (dateString) => {
            if (!dateString) return '';
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
            const endDateObj = new Date(endDate);
            const month = String(endDateObj.getMonth() + 1).padStart(2, '0');
            const day = String(endDateObj.getDate()).padStart(2, '0');
            return `${formattedStart}~${month}.${day}`;
        } else {
            return `${formattedStart}~${formatDate(endDate)}`;
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <View style={styles.grid}>
                    {folders.length > 0 ? (
                        folders.map((folder) => (
                            <TouchableOpacity
                                key={folder.folderId} 
                                style={styles.directoryCard}
                                onPress={() => handleDirectoryPress(folder)}
                                onLongPress={() => onEditFolder(folder)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: folder.thumbnailUrl || 'https://via.placeholder.com/400x300.png?text=No+Image' }}
                                        style={styles.directoryImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.period}>
                                        {formatPeriod(folder.startDate, folder.endDate)}
                                    </Text>
                                    <Text style={styles.title}>{folder.title}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>아직 폴더가 없습니다.</Text>
                        </View>
                    )}
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
        justifyContent: 'flex-start',
        gap: 12,
    },
    directoryCard: {
        width: '31%',
        backgroundColor: '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 8, // 카드 모서리를 둥글게
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1.48,
        backgroundColor: '#f0f0f0',
        borderRadius: 8, // 이미지 컨테이너 모서리를 둥글게
        overflow: 'hidden',
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
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
        fontWeight: '400',
        textAlign: 'center',
    },
    title: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
        lineHeight: 14,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});