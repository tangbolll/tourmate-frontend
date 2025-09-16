import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image,
    RefreshControl // 새로고침을 위해 추가
} from 'react-native';
import { useRouter } from 'expo-router';

export const PostDirectoryTab = ({ folders, onEditFolder, onRefresh }) => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false); // 새로고침 상태 관리

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

    // 새로고침 핸들러 추가
    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setRefreshing(false);
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
        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#000']} 
                    tintColor={'#000'}
                    progressViewOffset={400}
                    refreshThreshold={400}
                    distanceToRefresh={400}
                />
            }
            scrollEventThrottle={16}
        >
            <View style={styles.content}>
                <View style={styles.grid}>
                    {folders.length > 0 ? (
                        folders.map((folder, index) => {
                            const isLastInRow = (index + 1) % 3 === 0;

                            return (
                                <View 
                                    key={folder.folderId ? folder.folderId : `folder-${index}`}
                                    style={[
                                        styles.directoryCardShadow,
                                        isLastInRow && { marginRight: 0 }
                                    ]}
                                >
                                    <TouchableOpacity
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
                                </View>
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
    // 그림자 효과를 위한 외부 뷰 스타일
    directoryCardShadow: {
        width: '30%',
        marginRight: '5%',
        marginBottom: 20, // 간격 조정
        backgroundColor: '#fff', // Android 그림자 렌더링을 돕기 위해 추가
        borderRadius: 8, // 그림자 모양을 둥글게 하기 위해 추가
        // iOS 전용 그림자 속성
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4, // 수직 그림자 강조
        },
        shadowOpacity: 0.30, // 불투명도 증가
        shadowRadius: 4.65, // 퍼짐 효과 조정
        // Android 전용 그림자 속성
        elevation: 8, // 입체감 증가
    },
    // 실제 콘텐츠를 담는 내부 뷰 스타일
    directoryCard: {
        backgroundColor: '#fff',
        overflow: 'hidden',
        borderRadius: 8, // 콘텐츠를 둥글게 자르기 위해 유지
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
