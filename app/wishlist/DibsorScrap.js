import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import SelectDibsOrScrap from '../../components/wishlist/SelectDibsOrScrap';
import DibsScrapListView from '../../components/wishlist/DibsorScrapListView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    fetchLikedAccompanyPostsRawApi,
    fetchAccompanyFeedRawWithCacheApi, 
    toggleLikeApi,
    clearFeedCache,
    handleApiError,
} from '../../utils/AccompanyListApi';
import {
    getScrappedPostcardsApi,
    likePostcardApi,
    unlikePostcardApi, 
    getUserLikedPostcardsApi,
} from '../../utils/PostCardApi';
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

    // 정렬 상태 관리 추가
    const [dibsSortKey, setDibsSortKey] = useState('saved'); // 찜한 동행순을 기본값으로
    const [scrapSortKey, setScrapSortKey] = useState('scrapped'); // 스크랩한 엽서순을 기본값으로

    // 🔥 API 호출 중복 방지를 위한 ref
    const loadingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // 변환: 찜 데이터의 태그 배열 생성
    const transformTagsForDibsList = (item) => {

    
    const tags = [];
    
    // 성별 처리 (문자열)
    if (item.gender) {
        if (item.gender === 'ALL') {
            tags.push('성별무관');
        } else {
            tags.push(item.gender); // "여자만", "남자만" 등
        }
    }
    
    // 카테고리 처리 (배열)
    if (Array.isArray(item.category)) {
        tags.push(...item.category);
    } else if (item.category) {
        tags.push(item.category);
    }
    
    // 나이그룹 처리 (배열)
    if (Array.isArray(item.ageGroup)) {
        item.ageGroup.forEach(age => {
            if (age === 'ALL') {
                tags.push('나이무관');
            } else {
                tags.push(age);
            }
        });
    } else if (item.ageGroup) {
        if (item.ageGroup === 'ALL') {
            tags.push('나이무관');
        } else {
            tags.push(item.ageGroup);
        }
    }
    
    // 기타 태그 처리 (배열)
    if (Array.isArray(item.tag)) {
        tags.push(...item.tag);
    } else if (item.tag) {
        tags.push(item.tag);
    }
    
    const finalTags = tags.filter(Boolean);
    
    return finalTags;
};

    
    // 🚀 수정된 찜 데이터 로딩 - 원본 데이터 사용
    const fetchDibsDataOptimized = useCallback(async (sortKey = dibsSortKey) => {
        if (loadingRef.current || (dibsLoaded && dibsList.length > 0 && sortKey === dibsSortKey)) return;
        
        try {
            loadingRef.current = true;
            setLoading(true);
            
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();
            
            console.log('🔍 찜 데이터 로딩 시작...', { sortKey });

            // 1단계: 찜한 포스트만 직접 가져오는 API 시도 - 🔥 원본 데이터 사용
            const likedPosts = await fetchLikedAccompanyPostsRawApi(currentUserId, sortKey);
            
            if (likedPosts !== null) {
                // ✅ 전용 API가 성공한 경우 (원본 데이터 그대로 사용)
                console.log('✅ 전용 API로 찜 데이터 로드 완료:', likedPosts.length, '개');
                console.log('🔍 원본 데이터 구조:', {
                    id: likedPosts[0]?.id,
                    gender: likedPosts[0]?.gender,
                    category: likedPosts[0]?.category,
                    ageGroup: likedPosts[0]?.ageGroup,
                    tag: likedPosts[0]?.tag,
                    tags: likedPosts[0]?.tags
                });
                
                // 🔥 이미지 URL 보정: images[0] → mainImageUrl
                const processedLikedPosts = likedPosts.map(post => {
    const transformedTags = transformTagsForDibsList(post);
    
    return {
        ...post,
        mainImageUrl: post.mainImageUrl || (post.images && post.images.length > 0 ? post.images[0] : null),
        tags: transformedTags,        // DibsScrapListView에서 사용
        tag: transformedTags,         // 호환성을 위해
    };
});


// 추가 디버깅: 최종 데이터 확인
console.log('🔍 최종 변환된 데이터 샘플:', {
    id: processedLikedPosts[0]?.id,
    title: processedLikedPosts[0]?.title,
    originalGender: likedPosts[0]?.gender,
    originalCategory: likedPosts[0]?.category,
    originalAgeGroup: likedPosts[0]?.ageGroup,
    transformedTags: processedLikedPosts[0]?.tags,
    transformedTag: processedLikedPosts[0]?.tag
});
                
                setDibsList(processedLikedPosts);
                
                // 좋아요 상태 맵 생성
                const likesMap = {};
                likedPosts.forEach(post => {
                    const postId = post.id?.toString() || Math.random().toString();
                    likesMap[postId] = true;
                });
                setLikedPosts(likesMap);
                setDibsLoaded(true);
                setDibsSortKey(sortKey);
                
                // 🔥 디버깅: 원본 데이터의 이미지 필드 확인
                if (__DEV__ && likedPosts.length > 0) {
                    console.log('📸 원본 찜 데이터 이미지 필드 샘플:', 
                        likedPosts.slice(0, 3).map(post => ({
                            id: post.id,
                            title: post.title,
                            mainImageUrl: post.mainImageUrl,
                            images: post.images,
                            imageUrl: post.imageUrl,
                            image: post.image
                        }))
                    );
                }
                
                return;
            }
            
            // 2단계: 폴백 - 전체 피드에서 찜한 포스트 필터링 🔥 원본 데이터 사용
            console.log('🔄 폴백: 전체 피드에서 찜한 포스트 필터링...');
            const allPosts = await fetchAccompanyFeedRawWithCacheApi(currentUserId);
            
            if (allPosts.length === 0) {
                setDibsList([]);
                setLikedPosts({});
                setDibsLoaded(true);
                setDibsSortKey(sortKey);
                return;
            }

            // 🔥 디버깅: 원본 피드 데이터의 이미지 필드 확인
            if (__DEV__ && allPosts.length > 0) {
                console.log('📸 원본 피드 데이터 이미지 필드 샘플:', 
                    allPosts.slice(0, 3).map(post => ({
                        id: post.id,
                        title: post.title,
                        mainImageUrl: post.mainImageUrl,
                        images: post.images,
                        imageUrl: post.imageUrl,
                        image: post.image
                    }))
                );
            }

            // 최대 30개만 처리 (성능 보호)
            const limitedPosts = allPosts.slice(0, 30);
            const accompanyIds = limitedPosts.map(post => post.id?.toString() || Math.random().toString());
            
            // 🚀 최적화된 일괄 좋아요 조회
const likesMap = await getMultipleAccompanyLikesApi(
    accompanyIds, 
    currentUserId
);

// ✅ 1단계: 먼저 좋아요한 포스트만 필터링
let likedAccompanyPosts = limitedPosts.filter(post => {
    const postId = post.id?.toString() || Math.random().toString();
    return likesMap[postId] === true;
});

// ✅ 2단계: 그 다음 이미지 URL 보정 + 태그 변환
likedAccompanyPosts = likedAccompanyPosts.map(post => {
    const transformedTags = transformTagsForDibsList(post);
    
    return {
        ...post,
        mainImageUrl: post.mainImageUrl || (post.images && post.images.length > 0 ? post.images[0] : null),
        tags: transformedTags,        // DibsScrapListView에서 사용
        tag: transformedTags,         // 호환성을 위해
    };
});

// 🔥 디버깅: 필터링된 찜 목록의 이미지 필드 확인
if (__DEV__ && likedAccompanyPosts.length > 0) {
    console.log('📸 필터링된 원본 찜 데이터 이미지 필드 샘플:', 
        likedAccompanyPosts.slice(0, 3).map(post => ({
            id: post.id,
            title: post.title,
            mainImageUrl: post.mainImageUrl,
            images: post.images,
            imageUrl: post.imageUrl,
            image: post.image,
            tags: post.tags, // 변환된 태그도 확인
            _source: 'rawFeedCache'
        }))
    );
}

            // 클라이언트 정렬 적용 (백엔드 정렬 실패 시)
            switch (sortKey) {
                case 'closestTrip':
                    likedAccompanyPosts.sort((a, b) => new Date(a.tripStartDate) - new Date(b.tripStartDate));
                    break;
                case 'closestRecruitment':
                    likedAccompanyPosts.sort((a, b) => new Date(a.recruitmentEndDate) - new Date(b.recruitmentEndDate));
                    break;
                case 'saved':
                    likedAccompanyPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }
            
            setDibsList(likedAccompanyPosts);
            setLikedPosts(likesMap);
            setDibsLoaded(true);
            setDibsSortKey(sortKey);

            console.log('✅ 찜 데이터 로드 완료:', likedAccompanyPosts.length, '개');
            
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
    }, [currentUserId, dibsLoaded, dibsList.length, dibsSortKey]);

    // 🚀 스크랩 데이터 로딩 - `getScrappedPostcardsApi` 사용
    const fetchScrapDataOptimized = useCallback(async (sortKey = scrapSortKey) => {
        if (loadingRef.current) return;
        setLoading(true);
        loadingRef.current = true;
    
        try {
            console.log('🔄 스크랩 데이터 로딩 시작...', { sortKey });

            // ❗ 중요: 여기서 실제 좋아요 목록 API를 호출합니다.
            const [scrappedPostcards, likedPostcardsResult] = await Promise.all([
                getScrappedPostcardsApi(currentUserId, sortKey), 
                getUserLikedPostcardsApi(currentUserId)
            ]);

            if (!scrappedPostcards) {
                throw new Error('스크랩 목록을 가져오지 못했습니다.');
            }

            const likedPostcardIds = new Set();
            // API 응답이 객체 형태({success, data})일 수 있으므로 안전하게 접근
            if (likedPostcardsResult && likedPostcardsResult.success && Array.isArray(likedPostcardsResult.data)) {
                likedPostcardsResult.data.forEach(p => likedPostcardIds.add(p.postcardId || p.id));
            } else if (Array.isArray(likedPostcardsResult)) { // 배열을 직접 반환하는 경우도 대비
                likedPostcardsResult.forEach(p => likedPostcardIds.add(p.postcardId || p.id));
            }

            const formattedScrapData = scrappedPostcards.map(postcard => {
                const postcardId = postcard.id || postcard.postcardId;
                return {
                    ...postcard,
                    id: postcardId,
                    isLiked: likedPostcardIds.has(postcardId), // ✅ 진짜 '좋아요' 상태 반영
                    isScrapped: true,
                    isScraped: true,
                    image: postcard.imageUrl || postcard.image,
                    date: postcard.createdAt ? new Date(postcard.createdAt).toISOString().slice(0, 10).replace(/-/g, '.') : '알 수 없음',
                    authorDate: `${postcard.author} · ${postcard.location} · ${postcard.createdAt ? new Date(postcard.createdAt).toISOString().slice(0, 10).replace(/-/g, '.') : '알 수 없음'}`,
                };
            });
            
            setScrapList(formattedScrapData);
            console.log('✅ 스크랩 데이터 로드 완료');

        } catch (error) {
            console.error('❌ 스크랩 데이터 로드 실패:', error);
            Alert.alert('오류', '스크랩 목록을 불러오는 중 오류가 발생했습니다.');
            setScrapList([]);
        } finally {
            setLoading(false);
            setScrapLoaded(true);
            loadingRef.current = false;
        }
    }, [currentUserId, scrapSortKey]);
    
    useEffect(() => {
        if (!currentUserId) return;
        
        if (selectedTab === '찜' && !dibsLoaded) {
            fetchDibsDataOptimized();
        } else if (selectedTab === '스크랩' && !scrapLoaded) {
            fetchScrapDataOptimized();
        }
    }, [selectedTab, currentUserId, dibsLoaded, scrapLoaded]);

    // 정렬 변경 핸들러
    const handleSortChange = useCallback((sortKey) => {
        console.log('정렬 변경:', { selectedTab, sortKey });
        
        if (selectedTab === '찜') {
            setDibsSortKey(sortKey);
            setDibsLoaded(false); // 재로딩을 위해 false로 설정
            fetchDibsDataOptimized(sortKey);
        } else if (selectedTab === '스크랩') {
            setScrapSortKey(sortKey);
            setScrapLoaded(false); // 재로딩을 위해 false로 설정  
            fetchScrapDataOptimized(sortKey);
        }
    }, [selectedTab, fetchDibsDataOptimized, fetchScrapDataOptimized]);

    // 🚀 새로고침 최적화
    const onRefresh = useCallback(async () => {
        if (refreshing) return; // 이미 새로고침 중이면 스킵
        
        setRefreshing(true);
        try {
            if (selectedTab === '찜') {
                setDibsLoaded(false);
                setDibsList([]);
                clearFeedCache(); // 캐시 클리어
                await fetchDibsDataOptimized(dibsSortKey);
            } else {
                setScrapLoaded(false);
                setScrapList([]);
                await fetchScrapDataOptimized(scrapSortKey);
            }
        } finally {
            setRefreshing(false);
        }
    }, [selectedTab, refreshing, fetchDibsDataOptimized, fetchScrapDataOptimized, dibsSortKey, scrapSortKey]);

    // 🚀 좋아요 핸들러 최적화 - 디바운싱 추가
    const likeTimeoutRef = useRef({});
    
    // 🚀 동행 좋아요
    const handlePressAccompanyLike = useCallback(async (postId) => {
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

    // 엽서 좋아요
    const handlePressPostcardLike = useCallback(async (postcardId) => {
    if (!currentUserId) return;

    const currentItem = scrapList.find(item => item.id === postcardId);
    if (!currentItem) return;

    const isCurrentlyLiked = currentItem.isLiked;

    // 1. 낙관적 UI 업데이트 (UI를 먼저 변경)
    setScrapList(prevList =>
        prevList.map(item =>
            item.id === postcardId
                ? {
                    ...item,
                    isLiked: !isCurrentlyLiked,
                    likeCount: isCurrentlyLiked
                        ? Math.max(0, (item.likeCount || 1) - 1)
                        : (item.likeCount || 0) + 1,
                    }
                : item
        )
    );

    try {
        // 2. 현재 상태에 따라 올바른 엽서 API 호출
        if (isCurrentlyLiked) {
            await unlikePostcardApi(postcardId, currentUserId);
        } else {
            await likePostcardApi(postcardId, currentUserId);
        }
        console.log(`✅ 엽서(${postcardId}) 좋아요 처리 성공!`);
    } catch (error) {
        console.error('❌ 엽서 좋아요 처리 실패:', error);
        // 3. API 실패 시, UI를 원래 상태로 복원 (롤백)
        setScrapList(prevList =>
            prevList.map(item => (item.id === postcardId ? currentItem : item))
        );
        Alert.alert('오류', error.message || '좋아요 처리에 실패했습니다.');
    }
}, [currentUserId, scrapList]);



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
                onSortChange={handleSortChange}
            />
            
            <DibsScrapListView
                refreshing={refreshing}
                onRefresh={onRefresh}
                selectedTab={selectedTab}
                loading={loading}
                dibsList={dibsList}
                scrapList={scrapList}
                likedPosts={likedPosts}
                handlePressAccompanyLike={handlePressAccompanyLike}
                handlePressPostcardLike={handlePressPostcardLike}
                navigateToPost={navigateToPost}
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
