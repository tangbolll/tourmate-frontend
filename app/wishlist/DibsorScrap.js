import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import SelectDibsOrScrap from '../../components/wishlist/SelectDibsOrScrap';
import DibsScrapListView from '../../components/wishlist/DibsorScrapListView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    fetchAccompanyFeedWithCacheApi,
    fetchLikedAccompanyPostsApi, 
    getMultipleAccompanyLikesOptimizedApi, 
    toggleLikeApi,
    clearFeedCache,
    handleApiError
} from '../../utils/AccompanyListApi';
import { 
    fetchUserScrappedPostcardsApi 
} from '../../utils/HomePostApi';
import { useAuth } from '../../context/AuthContext';

const DibsorScrap = ({ router }) => {
    const { currentUserId } = useAuth();
    const [selectedTab, setSelectedTab] = useState('찜');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [dibsList, setDibsList] = useState([]);
    const [scrapList, setScrapList] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    
    const [dibsLoaded, setDibsLoaded] = useState(false);
    const [scrapLoaded, setScrapLoaded] = useState(false);

    // 🔥 API 호출 중복 방지를 위한 ref
    const loadingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // 🚀 최적화된 찜 데이터 로딩
    const fetchDibsDataOptimized = useCallback(async () => {
        if (loadingRef.current || (dibsLoaded && dibsList.length > 0)) return;
        
        try {
            loadingRef.current = true;
            setLoading(true);
            
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();
            
            console.log('🔍 찜 데이터 로딩 시작...');

            // 1단계: 찜한 포스트만 직접 가져오는 API 시도
            const likedPosts = await fetchLikedAccompanyPostsApi(currentUserId);
            
            if (likedPosts !== null) {
                // ✅ 전용 API가 성공한 경우
                console.log('✅ 전용 API로 찜 데이터 로드 완료:', likedPosts.length, '개');
                setDibsList(likedPosts);
                
                // 좋아요 상태 맵 생성
                const likesMap = {};
                likedPosts.forEach(post => {
                    likesMap[post.id] = true;
                });
                setLikedPosts(likesMap);
                setDibsLoaded(true);
                return;
            }
            
            // 2단계: 폴백 - 기존 방식이지만 최적화된 버전
            console.log('🔄 폴백: 전체 피드에서 찜한 포스트 필터링...');
            const allPosts = await fetchAccompanyFeedWithCacheApi(currentUserId);
            
            if (allPosts.length === 0) {
                setDibsList([]);
                setLikedPosts({});
                setDibsLoaded(true);
                return;
            }

            // 최대 30개만 처리 (성능 보호)
            const limitedPosts = allPosts.slice(0, 30);
            const accompanyIds = limitedPosts.map(post => post.id);
            
            // 🚀 최적화된 일괄 좋아요 조회
            const likesMap = await getMultipleAccompanyLikesOptimizedApi(
                accompanyIds, 
                currentUserId
            );
            
            // 좋아요한 포스트만 필터링
            const likedAccompanyPosts = limitedPosts.filter(post => 
                likesMap[post.id] === true
            );
            
            setDibsList(likedAccompanyPosts);
            setLikedPosts(likesMap);
            setDibsLoaded(true);

            console.log('✅ 찜 데이터 로드 완료:', likedAccompanyPosts.length, '개');
            
            // 🔍 디버깅: ID 값들 확인
            console.log('🔍 로드된 포스트 ID들:', likedAccompanyPosts.map(post => ({
                id: post.id,
                title: post.title,
                idType: typeof post.id
            })));
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('🚫 찜 데이터 로딩 취소됨');
                return;
            }
            
            console.error('❌ 찜 데이터 로드 실패:', error);
            setDibsList([]);
            Alert.alert('오류', '찜 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [currentUserId, dibsLoaded, dibsList.length]);

    // 🚀 스크랩 데이터 로딩 - 실제 API 사용
    const fetchScrapDataOptimized = useCallback(async () => {
        if (loadingRef.current || (scrapLoaded && scrapList.length > 0)) return;
        
        try {
            loadingRef.current = true;
            setLoading(true);
            
            console.log('🔍 스크랩 데이터 로딩 시작...');
            
            // 실제 스크랩 API 호출
            const result = await fetchUserScrappedPostcardsApi(currentUserId);
            
            if (result.success) {
                const scrappedPostcards = result.data || [];
                
                // 엽서 데이터를 적절한 형태로 변환
                const formattedScrapData = scrappedPostcards.map(postcard => ({
                    postcardId: postcard.postcardId,
                    id: postcard.postcardId, // 호환성을 위해
                    image: postcard.imageUrl,
                    title: postcard.title,
                    location: postcard.location,
                    date: postcard.createdAt ? new Date(postcard.createdAt).toISOString().slice(0, 10).replace(/-/g, '.') : '알 수 없음',
                    author: postcard.author,
                    authorDate: `${postcard.author} · ${postcard.location} · ${postcard.createdAt ? new Date(postcard.createdAt).toISOString().slice(0, 10).replace(/-/g, '.') : '알 수 없음'}`,
                    imageUrl: postcard.imageUrl,
                    likeCount: postcard.likeCount || 0,
                    scrapCount: postcard.scrapCount || 0,
                    isLiked: postcard.isLiked || false,
                    isScrapped: true, // 스크랩 목록이므로 항상 true
                    // PostExpanded에서 필요한 필드들
                    postcardName: postcard.title,
                    userName: postcard.author,
                    createdAt: postcard.createdAt,
                    content: postcard.content,
                    typeImageUrl: postcard.typeImageUrl
                }));
                
                setScrapList(formattedScrapData);
                setScrapLoaded(true);
                
                console.log('✅ 스크랩 데이터 로드 완료:', formattedScrapData.length, '개');
                
            } else {
                console.error('❌ 스크랩 데이터 로드 실패:', result.error);
                setScrapList([]);
                Alert.alert('오류', result.error || '스크랩 목록을 불러오는 중 오류가 발생했습니다.');
                setScrapLoaded(true);
            }
            
        } catch (error) {
            console.error('❌ 스크랩 데이터 로드 실패:', error);
            setScrapList([]);
            Alert.alert('오류', '스크랩 목록을 불러오는 중 오류가 발생했습니다.');
            setScrapLoaded(true);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [currentUserId, scrapLoaded, scrapList.length]);

    // 🔥 초기 로딩 최적화
    useEffect(() => {
        if (!currentUserId) return;
        
        if (selectedTab === '찜' && !dibsLoaded) {
            fetchDibsDataOptimized();
        } else if (selectedTab === '스크랩' && !scrapLoaded) {
            fetchScrapDataOptimized();
        }
    }, [selectedTab, currentUserId]); // 의존성 배열 단순화

    // 🚀 새로고침 최적화
    const onRefresh = useCallback(async () => {
        if (refreshing) return; // 이미 새로고침 중이면 스킵
        
        setRefreshing(true);
        try {
            if (selectedTab === '찜') {
                setDibsLoaded(false);
                setDibsList([]);
                clearFeedCache(); // 캐시 클리어
                await fetchDibsDataOptimized();
            } else {
                setScrapLoaded(false);
                setScrapList([]);
                await fetchScrapDataOptimized();
            }
        } finally {
            setRefreshing(false);
        }
    }, [selectedTab, refreshing, fetchDibsDataOptimized, fetchScrapDataOptimized]);

    // 🚀 좋아요 핸들러 최적화 - 디바운싱 추가
    const likeTimeoutRef = useRef({});
    
    const handlePressLike = useCallback(async (postId) => {
        if (!currentUserId) return;

        // 이전 타이머 클리어
        if (likeTimeoutRef.current[postId]) {
            clearTimeout(likeTimeoutRef.current[postId]);
        }

        const currentLikeStatus = likedPosts[postId];
        
        // 즉시 UI 업데이트 (낙관적 업데이트)
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !currentLikeStatus
        }));

        // 디바운스: 500ms 후 실제 API 호출
        likeTimeoutRef.current[postId] = setTimeout(async () => {
            try {
                const result = await toggleLikeApi(postId, currentUserId);
                
                // API 응답으로 상태 동기화
                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: result.isLiked
                }));
                
                // 찜 목록에서 좋아요 해제된 아이템 제거
                if (selectedTab === '찜' && !result.isLiked) {
                    setDibsList(prev => prev.filter(item => item.id !== postId));
                }
                
            } catch (error) {
                console.error('❌ 좋아요 처리 실패:', error);
                // 에러 시 원래 상태로 복원
                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: currentLikeStatus
                }));
            } finally {
                delete likeTimeoutRef.current[postId];
            }
        }, 500);
        
    }, [likedPosts, currentUserId, selectedTab]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            // 타이머 정리
            Object.values(likeTimeoutRef.current).forEach(clearTimeout);
        };
    }, []);

    // 🧪 테스트용 네비게이션 함수
    const testNavigation = useCallback(() => {
        console.log('🧪 네비게이션 테스트 시작');
        console.log('Router 상태:', {
            exists: !!router,
            methods: router ? Object.keys(router) : 'no router'
        });
        
        if (router && typeof router.push === 'function') {
            try {
                router.push('/'); // 홈으로 이동 테스트
                console.log('✅ 홈 네비게이션 성공');
            } catch (error) {
                console.error('❌ 홈 네비게이션 실패:', error);
            }
        }
    }, [router]);

    const navigateToPost = useCallback((postId) => {
        console.log('🔍 네비게이션 시도:', {
            postId,
            router: !!router,
            routerType: typeof router
        });
        
        if (!router) {
            console.error('❌ router 객체가 없습니다');
            Alert.alert('오류', '네비게이션 오류가 발생했습니다.');
            return;
        }
        
        if (!postId) {
            console.error('❌ postId가 없습니다');
            Alert.alert('오류', '포스트 ID가 없습니다.');
            return;
        }
        
        try {
            router.push(`/accompany/AccompanyPost?postId=${postId}`);
            
        } catch (error) {
            console.error('❌ 네비게이션 실패:', error);
            Alert.alert('오류', `페이지 이동 중 오류가 발생했습니다: ${error.message}`);
        }
    }, [router]);

    // const handlePostcardPress = useCallback((postcardId) => {
    //     router?.push(`accompany/postcards/${postcardId}`);
    // }, [router]);

    // 스크랩 데이터 업데이트 핸들러 (PostExpanded에서 스크랩 상태 변경 시)
    const handleScrapDataUpdate = useCallback((postcardId, actionType, wasActive) => {
        console.log(`[DibsorScrap] 스크랩 데이터 업데이트: ${postcardId}, ${actionType}, 이전상태: ${wasActive}`);
        
        if (actionType === 'scrap' && wasActive) {
            // 스크랩 취소된 경우, 스크랩 목록에서 해당 아이템 제거
            setScrapList(prevList => 
                prevList.filter(item => 
                    item.postcardId !== postcardId && item.id !== postcardId
                )
            );
            console.log(`✅ 스크랩 목록에서 ${postcardId} 제거됨`);
        } else if (actionType === 'like') {
            // 좋아요 상태 변경 시 카운트만 업데이트
            setScrapList(prevList => 
                prevList.map(item => {
                    if (item.postcardId === postcardId || item.id === postcardId) {
                        return {
                            ...item,
                            isLiked: !wasActive,
                            likeCount: wasActive 
                                ? Math.max(0, (item.likeCount || 0) - 1) 
                                : (item.likeCount || 0) + 1
                        };
                    }
                    return item;
                })
            );
        }
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <SelectDibsOrScrap
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                onSortChange={(sortKey) => {
                    console.log('Selected sort key:', sortKey);
                }}
            />
            
            <DibsScrapListView
                refreshing={refreshing}
                onRefresh={onRefresh}
                selectedTab={selectedTab}
                loading={loading}
                dibsList={dibsList}
                scrapList={scrapList}
                likedPosts={likedPosts}
                handlePressLike={handlePressLike}
                navigateToPost={navigateToPost}
                // onPostcardPress={handlePostcardPress}
                currentUserId={currentUserId}
                onScrapDataUpdate={handleScrapDataUpdate}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

export default DibsorScrap;