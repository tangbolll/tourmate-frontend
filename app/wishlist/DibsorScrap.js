import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import SelectDibsOrScrap from '../../components/wishlist/SelectDibsOrScrap';
import DibsScrapListView from '../../components/wishlist/DibsorScrapListView';
import { 
    fetchAccompanyFeedApi, 
    getMultipleAccompanyLikesApi, 
    toggleLikeApi 
} from '../../utils/AccompanyListApi';

const DibsorScrap = ({ router }) => {
    // 상태 관리
    const [selectedTab, setSelectedTab] = useState('찜');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // 데이터 상태
    const [dibsList, setDibsList] = useState([]);
    const [scrapList, setScrapList] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    const [allAccompanyPosts, setAllAccompanyPosts] = useState([]); // 전체 동행 포스트
    
    // 데이터 로딩 상태
    const [dibsLoaded, setDibsLoaded] = useState(false);
    const [scrapLoaded, setScrapLoaded] = useState(false);

    // 현재 사용자 ID (실제 앱에서는 상태관리나 컨텍스트에서 가져와야 함)
    const currentUserId = "3"; // TODO: 실제 사용자 ID로 교체

    // 찜 데이터 로드 (좋아요한 동행 포스트만 필터링)
    const fetchDibsData = useCallback(async () => {
        try {
            setLoading(true);
            
            // 1. 전체 동행 피드 데이터 가져오기
            console.log('🔍 전체 동행 피드 데이터 로딩 시작...');
            const allPosts = await fetchAccompanyFeedApi(currentUserId);
            setAllAccompanyPosts(allPosts);
            
            // 2. 모든 포스트의 좋아요 상태 조회
            console.log('🔍 좋아요 상태 조회 시작...');
            const accompanyIds = allPosts.map(post => post.id);
            const likesMap = await getMultipleAccompanyLikesApi(accompanyIds, currentUserId);
            setLikedPosts(likesMap);
            
            // 3. 좋아요한 포스트만 필터링하여 찜 목록 설정
            const likedAccompanyPosts = allPosts.filter(post => likesMap[post.id] === true);
            console.log('🔍 좋아요한 동행 포스트:', likedAccompanyPosts);
            
            setDibsList(likedAccompanyPosts);
            setDibsLoaded(true);
            
        } catch (error) {
            console.error('❌ 찜 데이터 로드 실패:', error);
            // 에러 시 빈 배열로 설정
            setDibsList([]);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    // 스크랩 데이터 로드 (기존 엽서 데이터 유지)
    const fetchScrapData = useCallback(async () => {
        try {
            setLoading(true);
            // TODO: 실제 스크랩 API 호출로 대체
            // const response = await api.getScrapList();
            // setScrapList(response.data);
            
            // 임시 더미 엽서 데이터 (기존 유지)
            const dummyScrapData = [
                {
                    id: 'postcard1',
                    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                    title: '부산 해운대',
                    location: '부산',
                    date: '2021.03.04',
                    author: '주리를 들어라',
                    authorDate: '부산 · 2021.03.04',
                    design: {
                        type: 'Line',
                        color: '#E1F5FE',
                    },
                    content: {
                        leftText: '오늘은 부산으로 즐겁여행을 떠났다.\n\n늘 그렇듯 00 게스트하우스를 예약했다.\n도착해서 먼저볼 대화시간이 적인 게스트하우스...\n게스트들의 연결대가 다양했다.',
                    },
                    likeCount: 24,
                    scrapCount: 47,
                    isLiked: false,
                    isScrapped: true,
                },
                {
                    id: 'postcard2',
                    image: 'https://images.unsplash.com/photo-1534274867514-d5b47ef22043?w=400&h=300&fit=crop',
                    title: '부산 광안리',
                    location: '부산',
                    date: '2021.03.05',
                    author: '주리를 들어라',
                    authorDate: '부산 · 2021.03.05',
                    design: {
                        type: 'Plain',
                        color: '#FFE4E1',
                    },
                    content: {
                        leftText: '광안리 해변에서의 하루.\n새벽 6시부터 일출을 보며...',
                    },
                    likeCount: 18,
                    scrapCount: 32,
                    isLiked: true,
                    isScrapped: true,
                },
                {
                    id: 'postcard3',
                    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
                    title: '부산 자갈치',
                    location: '부산',
                    date: '2021.03.05',
                    author: '주리를 들어라',
                    authorDate: '부산 · 2021.03.05',
                    design: {
                        type: 'Image',
                        color: '#F3E5F5',
                    },
                    content: {
                        leftText: '자갈치 시장에서 만난 사람들...',
                    },
                    likeCount: 15,
                    scrapCount: 28,
                    isLiked: false,
                    isScrapped: true,
                },
                {
                    id: 'postcard4',
                    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
                    title: '부산 송도',
                    location: '부산',
                    date: '2021.03.06',
                    author: '주리를 들어라',
                    authorDate: '부산 · 2021.03.06',
                    design: {
                        type: 'Line',
                        color: '#E8F5E8',
                    },
                    content: {
                        leftText: '송도 해수욕장의 케이블카...',
                    },
                    likeCount: 22,
                    scrapCount: 41,
                    isLiked: true,
                    isScrapped: true,
                },
                {
                    id: 'postcard5',
                    image: 'https://images.unsplash.com/photo-1617085222613-49c7a5a8e5cb?w=400&h=300&fit=crop',
                    title: '부산 태종대',
                    location: '부산',
                    date: '2021.03.06',
                    author: '주리를 들어라',
                    authorDate: '부산 · 2021.03.06',
                    design: {
                        type: 'Plain',
                        color: '#FFF8E1',
                    },
                    content: {
                        leftText: '태종대 절벽에서 바라본 바다...',
                    },
                    likeCount: 31,
                    scrapCount: 55,
                    isLiked: false,
                    isScrapped: true,
                },
                {
                    id: 'postcard6',
                    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
                    title: '부산 감천문화마을',
                    location: '부산',
                    date: '2021.03.06',
                    author: '주리를 들어라',
                    authorDate: '부산 · 2021.03.06',
                    design: {
                        type: 'Image',
                        color: '#E1F5FE',
                    },
                    content: {
                        leftText: '알록달록한 감천문화마을...',
                    },
                    likeCount: 28,
                    scrapCount: 43,
                    isLiked: true,
                    isScrapped: true,
                }
            ];
            
            setScrapList(dummyScrapData);
            setScrapLoaded(true);
        } catch (error) {
            console.error('스크랩 데이터 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 찜 데이터 로드 (첫 로딩만)
    useEffect(() => {
        if (!dibsLoaded) {
            fetchDibsData();
        }
    }, []);

    // 탭 변경 시 데이터 로드
    useEffect(() => {
        if (selectedTab === '찜' && !dibsLoaded) {
            fetchDibsData();
        } else if (selectedTab === '스크랩' && !scrapLoaded) {
            fetchScrapData();
        }
    }, [selectedTab, dibsLoaded, scrapLoaded, fetchDibsData, fetchScrapData]);

    // 새로고침 핸들러
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (selectedTab === '찜') {
                // 찜 탭에서는 데이터를 다시 로드하고 상태 초기화
                setDibsLoaded(false);
                await fetchDibsData();
            } else {
                await fetchScrapData();
            }
        } finally {
            setRefreshing(false);
        }
    }, [selectedTab, fetchDibsData, fetchScrapData]);

    // 좋아요 핸들러 - 실제 API 연동
    const handlePressLike = useCallback(async (postId) => {
        try {
            console.log('🔍 좋아요 토글 시작:', postId);
            
            // 낙관적 업데이트 (UI 먼저 변경)
            const currentLikeStatus = likedPosts[postId] || false;
            setLikedPosts(prev => ({
                ...prev,
                [postId]: !currentLikeStatus
            }));
            
            // API 호출
            const result = await toggleLikeApi(postId, currentUserId);
            console.log('🔍 좋아요 토글 결과:', result);
            
            // API 응답으로 상태 동기화
            setLikedPosts(prev => ({
                ...prev,
                [postId]: result.isLiked
            }));
            
            // 찜 목록 업데이트 (좋아요 해제 시 목록에서 제거)
            if (selectedTab === '찜') {
                if (!result.isLiked) {
                    // 좋아요 해제 시 찜 목록에서 제거
                    setDibsList(prev => prev.filter(item => item.id !== postId));
                }
                // 좋아요 수 업데이트
                setDibsList(prev => prev.map(item => 
                    item.id === postId 
                        ? { ...item, likeCount: result.likeCount }
                        : item
                ));
            }
            
        } catch (error) {
            console.error('❌ 좋아요 처리 실패:', error);
            // 에러 시 원래 상태로 복원
            setLikedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));
        }
    }, [likedPosts, currentUserId, selectedTab]);

    // 포스트 네비게이션 핸들러
    const navigateToPost = useCallback((postId) => {
        if (router) {
            router.push(`/accompany/post/${postId}`);
        }
    }, [router]);

    // 엽서 클릭 핸들러
    const handlePostcardPress = useCallback((postcardId) => {
        console.log('엽서 클릭:', postcardId);
        // TODO: 엽서 상세 페이지로 이동
        if (router) {
            router.push(`/postcard/${postcardId}`);
        }
    }, [router]);

    return (
        <SafeAreaView style={styles.container}>
            <SelectDibsOrScrap
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                onSortChange={(sortKey) => {
                    console.log('Selected sort key:', sortKey);
                }}
            />
            
            {selectedTab === '찜' && (
                <DibsScrapListView
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    loading={loading}
                    dibsList={dibsList}
                    scrapList={scrapList}
                    likedPosts={likedPosts}
                    handlePressLike={handlePressLike}
                    navigateToPost={navigateToPost}
                    onPostcardPress={handlePostcardPress}
                />
            )}
            
            {selectedTab === '스크랩' && (
                <DibsScrapListView
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    loading={loading}
                    dibsList={dibsList}
                    scrapList={scrapList}
                    likedPosts={likedPosts}
                    handlePressLike={handlePressLike}
                    navigateToPost={navigateToPost}
                    onPostcardPress={handlePostcardPress}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    emptyScrapContainer: {
        flex: 1,
        backgroundColor: '#fff',
        // 엽서 리스트 구현 시 이 스타일 수정
    },
});

export default DibsorScrap;