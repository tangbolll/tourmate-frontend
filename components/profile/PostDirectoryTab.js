import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

// Dimensions는 더 이상 필요 없으므로 삭제합니다.

export const PostDirectoryTab = ({ folders, onEditFolder }) => {
    const router = useRouter();

    const handleDirectoryPress = (folder) => {
        router.push({
            pathname: '/profile/postDirectory',
            params: {
                directoryId: folder.id,
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
                        folders.map((folder, index) => { // ✨ 1. map 함수에 index를 추가합니다.
                            // ✨ 2. 한 줄의 마지막 아이템인지 확인하는 로직을 추가합니다.
                            const isLastInRow = (index + 1) % 3 === 0;

                            return (
                                <TouchableOpacity
                                    key={folder.folderId ? folder.folderId : `folder-${index}`}
                                    // ✨ 3. 마지막 아이템일 경우 오른쪽 마진을 제거하는 스타일을 적용합니다.
                                    style={[
                                        styles.directoryCard,
                                        isLastInRow && { marginRight: 0 }
                                    ]}
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
                            );
                        })
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

// ✨ 4. 스타일시트를 PostBoardTab과 동일한 방식으로 수정합니다.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        paddingTop: 16,
        paddingBottom: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
    },
    directoryCard: {
        width: '30%',
        marginRight: '5%',
        marginBottom: 16,
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
        borderRadius: 8,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1.48,
        backgroundColor: '#f0f0f0',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden',
    },
    directoryImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        paddingVertical: 8,
        paddingHorizontal: 6,
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
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

