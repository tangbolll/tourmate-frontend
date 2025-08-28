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
    fetchPostcardFeedWithUserInteractionsApi,
    fetchPostcardFeedApi, 
    toggleLikePostcard, 
    toggleScrapPostcard 
} from '../../utils/HomePostApi';
import { useAuth } from '../../context/AuthContext';

const PostSection = () => {
    const { currentUserId } = useAuth(); // 사용자 ID 가져오기
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // 초기 데이터 로드 - 사용자 상호작용 정보 포함
    const loadInitialData = async () => {
        setLoading(true);
        try {
            // 로그인한 사용자가 있으면 통합 API 사용, 없으면 기본 API 사용
            const result = currentUserId 
                ? await fetchPostcardFeedWithUserInteractionsApi(0, 20, currentUserId)
                : await fetchPostcardFeedApi(0, 20);
            
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

    // 새로고침 - 사용자 상호작용 정보 포함
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // 로그인한 사용자가 있으면 통합 API 사용, 없으면 기본 API 사용
            const result = currentUserId 
                ? await fetchPostcardFeedWithUserInteractionsApi(0, 20, currentUserId)
                : await fetchPostcardFeedApi(0, 20);
            
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

    // 더 많은 데이터 로드 (무한 스크롤) - 사용자 상호작용 정보는 추가 로드시에는 제외
    const loadMoreData = async () => {
        if (!hasMoreData || loadingMore) return;

        setLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            // 추가 로드시에는 기본 API 사용 (성능 최적화)
            const result = await fetchPostcardFeedApi(nextPage, 20);
            
            if (result.success) {
                const { content, last } = result.data;
                
                // 새로운 엽서에 사용자 상호작용 정보 추가 (로그인 사용자인 경우)
                let enhancedContent = content || [];
                if (currentUserId && content && content.length > 0) {
                    enhancedContent = content.map(postcard => ({
                        ...postcard,
                        isLiked: false, // 새로 로드된 것들은 기본값으로 설정
                        isScraped: false
                    }));
                }
                
                setPosts(prevPosts => [...prevPosts, ...enhancedContent]);
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

    // API 호출 없이 UI 상태만 동기화
    const handleDataUpdate = (postcardId, actionType, wasActive) => {
        console.log(`[PostSection] UI 상태 동기화 - PostCard ${postcardId}, ${actionType}, 이전상태: ${wasActive}`);
        
        // API 호출 없이 UI 상태만 업데이트
        setPosts(prevPosts => 
            prevPosts.map(post => {
                if (post.postcardId === postcardId) {
                    if (actionType === 'like') {
                        return {
                            ...post,
                            isLiked: !wasActive,
                            likeCount: wasActive 
                                ? Math.max(0, post.likeCount - 1) 
                                : post.likeCount + 1
                        };
                    } else if (actionType === 'scrap') {
                        return {
                            ...post,
                            isScraped: !wasActive,
                            scrapCount: wasActive 
                                ? Math.max(0, post.scrapCount - 1) 
                                : post.scrapCount + 1
                        };
                    }
                }
                return post;
            })
        );
    };

    // 무한 스크롤을 위한 함수 - 상위 컴포넌트에서 호출 가능
    const handleLoadMore = () => {
        if (hasMoreData && !loadingMore) {
            loadMoreData();
        }
    };

    // currentUserId 변경시 데이터 다시 로드
    useEffect(() => {
        loadInitialData();
    }, [currentUserId]);

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
                scrollEnabled={false}
                contentContainerStyle={posts.length === 0 ? styles.emptyList : styles.postList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#666']}
                        tintColor="#666"
                    />
                }
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                removeClippedSubviews={false} 
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