import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Post from './Post';
import { 
    fetchPostcardFeedApi, 
    toggleLikePostcard, 
    toggleScrapPostcard 
} from '../../utils/HomePostApi';

const PostSection = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // 초기 데이터 로드
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const result = await fetchPostcardFeedApi(0, 20);
            
            if (result.success) {
                const { content, totalPages, last } = result.data;
                setPosts(content || []);
                setCurrentPage(0);
                setHasMoreData(!last && totalPages > 1);
            } else {
                Alert.alert('오류', result.error);
                setPosts([]);
            }
        } catch (error) {
            console.error('초기 데이터 로드 오류:', error);
            Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // 새로고침
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const result = await fetchPostcardFeedApi(0, 20);
            
            if (result.success) {
                const { content, totalPages, last } = result.data;
                setPosts(content || []);
                setCurrentPage(0);
                setHasMoreData(!last && totalPages > 1);
            } else {
                Alert.alert('오류', result.error);
            }
        } catch (error) {
            console.error('새로고침 오류:', error);
            Alert.alert('오류', '새로고침 중 오류가 발생했습니다.');
        } finally {
            setRefreshing(false);
        }
    };

    // 더 많은 데이터 로드 (무한 스크롤)
    const loadMoreData = async () => {
        if (!hasMoreData || loadingMore) return;

        setLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const result = await fetchPostcardFeedApi(nextPage, 20);
            
            if (result.success) {
                const { content, last } = result.data;
                setPosts(prevPosts => [...prevPosts, ...(content || [])]);
                setCurrentPage(nextPage);
                setHasMoreData(!last);
            } else {
                Alert.alert('오류', result.error);
            }
        } catch (error) {
            console.error('추가 데이터 로드 오류:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // 좋아요/스크랩 처리 함수 (실제 API 호출)
    const handleDataUpdate = async (postcardId, actionType, currentValue) => {
        try {
            let result;
            
            if (actionType === 'like') {
                result = await toggleLikePostcard(postcardId, currentValue);
            } else if (actionType === 'scrap') {
                result = await toggleScrapPostcard(postcardId, currentValue);
            }

            if (result && result.success) {
                // API 호출 성공 시에만 UI 업데이트
                setPosts(prevPosts => 
                    prevPosts.map(post => {
                        if (post.postcardId === postcardId) {
                            if (actionType === 'like') {
                                return {
                                    ...post,
                                    isLiked: !currentValue,
                                    likeCount: currentValue 
                                        ? Math.max(0, post.likeCount - 1) 
                                        : post.likeCount + 1
                                };
                            } else if (actionType === 'scrap') {
                                return {
                                    ...post,
                                    isScraped: !currentValue,
                                    scrapCount: currentValue 
                                        ? Math.max(0, post.scrapCount - 1) 
                                        : post.scrapCount + 1
                                };
                            }
                        }
                        return post;
                    })
                );
            } else {
                // API 호출 실패 시 에러 메시지 표시
                Alert.alert('오류', result?.error || '처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('데이터 업데이트 오류:', error);
            Alert.alert('오류', '처리 중 오류가 발생했습니다.');
        }
    };

    // 무한 스크롤을 위한 함수 - 상위 컴포넌트에서 호출 가능
    const handleLoadMore = () => {
        if (hasMoreData && !loadingMore) {
            loadMoreData();
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const renderPost = ({ item }) => (
        <Post 
            postData={item} 
            onDataUpdate={handleDataUpdate}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.footerText}>더 많은 엽서를 불러오는 중...</Text>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 등록된 엽서가 없습니다.</Text>
            <Text style={styles.emptySubText}>첫 번째 여행 엽서를 만들어보세요!</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#666" />
                <Text style={styles.loadingText}>엽서를 불러오는 중...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 타이틀 */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>다른 유저의 여행엽서 엿보기</Text>
            </View>

            {/* 포스트 리스트 - ScrollView 내부에서 스크롤 비활성화 */}
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.postcardId?.toString() || Math.random().toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false} // 🔑 핵심: FlatList 자체 스크롤 비활성화
                contentContainerStyle={posts.length === 0 ? styles.emptyList : styles.postList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#666']}
                        tintColor="#666"
                    />
                }
                // onEndReached와 onEndReachedThreshold 제거 (ScrollView가 담당)
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                removeClippedSubviews={false} // ScrollView 내부에서는 false 권장
                maxToRenderPerBatch={10}
                windowSize={5}
            />
            
            {/* 무한 스크롤을 위한 더보기 버튼 (필요시) */}
            {hasMoreData && !loadingMore && posts.length > 0 && (
                <View style={styles.loadMoreContainer}>
                    <Text 
                        style={styles.loadMoreText}
                        onPress={handleLoadMore}
                    >
                        더 많은 엽서 보기
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginTop: 3,
    },
    titleContainer: {
        backgroundColor: '#fff',
        paddingTop: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 20,
    },
    postList: {
        paddingTop: 8,
        paddingBottom: 32,
    },
    emptyList: {
        minHeight: 200, // flex: 1 대신 minHeight 사용
    },
    loadingContainer: {
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    footerLoader: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 60,
        minHeight: 200,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    loadMoreContainer: {
        padding: 20,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    loadMoreText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default PostSection;