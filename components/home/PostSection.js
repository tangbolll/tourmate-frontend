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
import { fetchPostcardFeedApi } from '../../utils/HomePostApi';

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

    // 게시물 데이터 업데이트 (좋아요, 북마크 등)
    const handleDataUpdate = (postcardId, actionType, newValue) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.postcardId === postcardId 
                    ? {
                        ...post,
                        [actionType === 'like' ? 'likeCount' : 'scrapCount']: 
                            actionType === 'like' 
                                ? (newValue ? post.likeCount + 1 : post.likeCount - 1)
                                : (newValue ? post.scrapCount + 1 : post.scrapCount - 1)
                    }
                    : post
            )
        );
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

            {/* 포스트 리스트 */}
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.postcardId?.toString() || Math.random().toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={posts.length === 0 ? styles.emptyList : styles.postList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#666']}
                        tintColor="#666"
                    />
                }
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.3}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={10}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 60,
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
});

export default PostSection;