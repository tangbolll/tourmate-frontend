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
import PostcardDetailView from './PostcardDetailView';

const PostcardGridView = ({
    refreshing,
    onRefresh,
    loading,
    postcardList,
    onPostcardPress,
}) => {
    const [selectedPostcard, setSelectedPostcard] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const handlePostcardPress = (postcardId) => {
        // 선택된 엽서 데이터 찾기
        const postcardData = postcardList.find(p => p.id === postcardId);
        setSelectedPostcard(postcardData);
        setShowDetail(true);
        
        // 부모 컴포넌트에도 알림
        if (onPostcardPress) {
            onPostcardPress(postcardId);
        }
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedPostcard(null);
    };

    const handleLike = (postcardId) => {
        console.log('좋아요:', postcardId);
        // TODO: 좋아요 API 호출
    };

    const handleScrap = (postcardId) => {
        console.log('스크랩:', postcardId);
        // TODO: 스크랩 API 호출
    };

    // 엽서 아이템 렌더링
    const renderPostcardItems = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>로딩 중...</Text>
                </View>
            );
        }

        if (postcardList.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                        아직 스크랩한 엽서가 없습니다.{'\n'}
                        여행 중에 엽서를 만들어보세요!
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.grid}>
                {postcardList.map((postcard) => (
                    <TouchableOpacity
                        key={postcard.id}
                        style={styles.postcardContainer}
                        onPress={() => handlePostcardPress(postcard.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: postcard.image }}
                                style={styles.postcardImage}
                                resizeMode="cover"
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#000']} // Android
                        tintColor={'#000'} // iOS
                    />
                }
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {renderPostcardItems()}
            </ScrollView>

            {/* 엽서 상세 모달 */}
            {showDetail && selectedPostcard && (
                <PostcardDetailView
                    postcardData={selectedPostcard}
                    onClose={handleCloseDetail}
                    onLikePress={handleLike}
                    onScrapPress={handleScrap}
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
        padding: 16,
        justifyContent: 'space-between',
    },
    postcardContainer: {
        width: '31%',
        marginBottom: 12,
        // aspectRatio: 1,
    },
    imageContainer: {
        width: 148 * 0.85,
        height: 100 * 0.85,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    postcardImage: {
        width: '100%',
        height: '100%',
    },
});

export default PostcardGridView;