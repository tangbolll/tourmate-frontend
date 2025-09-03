import React, { useState, Alert } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Text,
    RefreshControl 
} from 'react-native';
import PostExpanded from '../home/PostExpanded';

const PostcardGridView = ({
    refreshing,
    onRefresh,
    loading,
    postcardList,
    onPostcardPress,
    currentUserId, // currentUserId를 prop으로 받음
    onDataUpdate, // 상위 컴포넌트의 데이터 업데이트 함수
}) => {
    const [selectedPostcard, setSelectedPostcard] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const handlePostcardPress = (postcardId) => {
    
    // postcardId가 undefined인 경우를 대비한 처리
    if (!postcardId || postcardId === 'undefined') {
        return;
    }
    
    // 선택된 엽서 데이터 찾기
    const postcardData = postcardList.find(p => {
        const pId = p.id || p.postcardId;

        return pId === postcardId;
    });
    
    
    if (postcardData) {
        // 새로운 객체를 만들어서 React가 변경을 감지하도록 함
        const newPostcardData = {
            ...postcardData,
            _timestamp: Date.now()
        };
        
        setSelectedPostcard(newPostcardData);
        setShowDetail(true);
    } else {
    }
    
    if (onPostcardPress) {
        onPostcardPress(postcardId);
    }
};

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedPostcard(null);
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

    // 엽서 아이템 렌더링
    const renderPostcardItems = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>로딩 중...</Text>
                </View>
            );
        }

        if (!postcardList || postcardList.length === 0) {
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
                {postcardList.map((postcard, index) => {
                    const postcardId = postcard.postcardId || postcard.id;
                    const imageUrl = postcard.image || postcard.imageUrl;
                    
                    // 3개씩 나누어 배치하므로 마지막 아이템(index % 3 === 2)에는 marginRight 0
                    const isLastInRow = (index + 1) % 3 === 0;
                    
                    return (
                        <TouchableOpacity
                            key={postcardId}
                            style={[
                                styles.postcardContainer,
                                isLastInRow && { marginRight: 0 }
                            ]}
                            onPress={() => handlePostcardPress(postcardId)}
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
    <PostExpanded
        key={`postcard-${selectedPostcard.postcardId || selectedPostcard.id}-${Date.now()}`}
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

export default PostcardGridView;