import React, { useState } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Text,
    RefreshControl
} from 'react-native';
import PostExpanded from './PostExpanded';

const PostBoardTab = ({ 
    userEmail, 
    favoritePostcards, 
    currentUserId,
    onDataUpdate,
    onRefresh
}) => {
    const [selectedPostcard, setSelectedPostcard] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 엽서 클릭 시 상세 보기
    const handlePostcardPress = (postcard) => {
        setSelectedPostcard(postcard);
        setShowDetail(true);
    };

    // 상세 보기 닫기
    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedPostcard(null);
    };

    // 당겨서 새로고침 핸들러 - 더 세게 당겨야 반응하도록 수정
    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setRefreshing(false);
    };

    // PostExpanded에서 스크랩/좋아요 상태가 변경될 때 호출
    const handleLocalDataUpdate = (postcardId, actionType, wasActive) => {
        if (onDataUpdate) {
            onDataUpdate(postcardId, actionType, wasActive);
        }

        if (selectedPostcard && (selectedPostcard.postcardId === postcardId || selectedPostcard.id === postcardId)) {
            setSelectedPostcard(prevData => {
                if (!prevData) return null;
                
                if (actionType === 'like') {
                    return {
                        ...prevData,
                        isLiked: !wasActive,
                        likeCount: wasActive 
                            ? Math.max(0, (prevData.likeCount || 0) - 1) 
                            : (prevData.likeCount || 0) + 1
                    };
                } else if (actionType === 'scrap') {
                    return {
                        ...prevData,
                        isScraped: !wasActive,
                        isScrapped: !wasActive, 
                        scrapCount: wasActive 
                            ? Math.max(0, (prevData.scrapCount || 0) - 1) 
                            : (prevData.scrapCount || 0) + 1
                    };
                }
                return prevData;
            });
        }
    };

    // 엽서 아이템을 렌더링하는 함수
    const renderPostcardItems = () => {
        if (!favoritePostcards || favoritePostcards.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                        아직 즐겨찾기한 엽서가 없습니다.{'\n'}
                        여행 중에 엽서를 만들어보세요!
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.grid}>
                {favoritePostcards.map((postcard, index) => {
                    const postcardId = postcard.postcardId || postcard.id;
                    const imageUrl = postcard.image || postcard.imageUrl;
                    
                    const isLastInRow = (index + 1) % 3 === 0;
                    
                    return (
                        <TouchableOpacity
                            key={postcardId}
                            style={[
                                styles.postcardContainer,
                                isLastInRow && { marginRight: 0 }
                            ]}
                            onPress={() => handlePostcardPress(postcard)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={styles.postcardImage}
                                    resizeMode="cover"
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#000']} 
                        tintColor={'#000'}
                        // 더 세게 당겨야 새로고침되도록 설정
                        progressViewOffset={400} // iOS: 150px 더 당겨야 새로고침 시작 (기본 60->150)
                        refreshThreshold={400} // Android: 새로고침 임계값을 150으로 증가 (기본 80->150)
                        distanceToRefresh={400} // Android: 새로고침까지 필요한 거리 증가 (기본 80->150)
                    />
                }
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
            >
                {renderPostcardItems()}
            </ScrollView>

            {showDetail && selectedPostcard && (
            <PostExpanded
                visible={showDetail}
                postData={selectedPostcard}
                onClose={handleCloseDetail}
                onDataUpdate={handleLocalDataUpdate}
                currentUserId={currentUserId}
            />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        paddingTop: 12,
        paddingBottom: 50,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        lineHeight: 24,
        marginTop: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    postcardContainer: {
        width: '30%', 
        marginBottom: 16, 
        marginRight: '5%', 
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 148 / 100, 
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    postcardImage: {
        width: '100%',
        height: '100%',
    },
});

export default PostBoardTab;