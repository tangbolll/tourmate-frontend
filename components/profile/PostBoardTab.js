import React, { useState } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Text,
    RefreshControl // 새로고침 기능을 위해 추가합니다.
} from 'react-native';
import PostExpanded from './PostExpanded'; // 기존 경로를 유지합니다.

const PostBoardTab = ({ 
    userEmail, 
    favoritePostcards, 
    currentUserId,
    onDataUpdate, // 부모 컴포넌트의 데이터 업데이트 함수를 prop으로 받습니다.
    onRefresh // 새로고침 기능을 위한 prop을 추가합니다.
}) => {
    const [selectedPostcard, setSelectedPostcard] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리합니다.

    const handlePostcardPress = (postcard) => {
        setSelectedPostcard(postcard);
        setShowDetail(true);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedPostcard(null);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setRefreshing(false);
    };

    // PostExpanded에서 스크랩/좋아요 상태가 변경될 때 호출
    const handleDataUpdate = (postcardId, actionType, wasActive) => {
        // 상위 컴포넌트에 전달 (스크랩 목록에서 제거 등을 위해)
        if (onDataUpdate) {
            onDataUpdate(postcardId, actionType, wasActive);
        }

        // 로컬 상태 업데이트 (선택된 엽서 데이터)
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
                    />
                }
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {renderPostcardItems()}
            </ScrollView>

            {showDetail && selectedPostcard && (
                <PostExpanded
                    visible={showDetail}
                    postData={selectedPostcard}
                    onClose={handleCloseDetail}
                    onDataUpdate={handleDataUpdate} 
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
