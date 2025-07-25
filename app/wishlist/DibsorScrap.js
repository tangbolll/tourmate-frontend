import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import SelectDibsOrScrap from '../../components/wishlist/SelectDibsOrScrap';
import DibsScrapListView from '../../components/wishlist/DibsorScrapListView';

const DibsScrapPage = ({ router }) => {
    // 상태 관리
    const [selectedTab, setSelectedTab] = useState('찜');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // 데이터 상태
    const [dibsList, setDibsList] = useState([]);
    const [scrapList, setScrapList] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    
    // 데이터 로딩 상태
    const [dibsLoaded, setDibsLoaded] = useState(false);
    const [scrapLoaded, setScrapLoaded] = useState(false);

    // 찜 데이터 로드
    const fetchDibsData = useCallback(async () => {
        try {
            setLoading(true);
            // TODO: 실제 API 호출로 대체
            // const response = await api.getDibsList();
            // setDibsList(response.data);
            
            // 임시 더미 데이터
            const dummyDibsData = [
                {
                    id: 'dibs1',
                    date: '03.04 월',
                    title: '공주 공산성에서 야경 같이 즐겨요',
                    tags: ['야경', '여자만', '저녁식사', '걷기'],
                    location: '공주',
                    participants: 2,
                    maxParticipants: 3,
                    imageUrl: 'https://example.com/image1.jpg'
                },
                {
                    id: 'dibs2',
                    date: '03.05 화',
                    title: '부여 백제문화단지 투어',
                    tags: ['문화', '역사', '남녀무관', '점심'],
                    location: '부여',
                    participants: 1,
                    maxParticipants: 4,
                    imageUrl: 'https://example.com/image2.jpg'
                }
            ];
            
            setDibsList(dummyDibsData);
            setDibsLoaded(true);
        } catch (error) {
            console.error('찜 데이터 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 스크랩 데이터 로드
    const fetchScrapData = useCallback(async () => {
        try {
            setLoading(true);
            // TODO: 실제 API 호출로 대체
            // const response = await api.getScrapList();
            // setScrapList(response.data);
            
            // 임시 더미 데이터
            const dummyScrapData = [
                {
                    id: 'scrap1',
                    date: '03.06 수',
                    title: '대전 엑스포공원 산책',
                    tags: ['산책', '자연', '아침', '운동'],
                    location: '대전',
                    participants: 3,
                    maxParticipants: 5,
                    imageUrl: 'https://example.com/image3.jpg'
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
                await fetchDibsData();
            } else {
                await fetchScrapData();
            }
        } finally {
            setRefreshing(false);
        }
    }, [selectedTab, fetchDibsData, fetchScrapData]);

    // 좋아요 핸들러
    const handlePressLike = useCallback((postId) => {
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
        
        // TODO: 실제 좋아요 API 호출
        // api.toggleLike(postId);
    }, []);

    // 포스트 네비게이션 핸들러
    const navigateToPost = useCallback((postId) => {
        if (router) {
            router.push(`/accompany/post/${postId}`);
        }
    }, [router]);

    return (
        <View style={styles.container}>
            <SelectDibsOrScrap
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                onClose={() => {
                    // 닫기 버튼 클릭 시 네비게이션 처리
                    if (router) {
                        router.back();
                    }
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
                />
            )}
            
            {selectedTab === '스크랩' && (
                <View style={styles.emptyScrapContainer}>
                    {/* 엽서 리스트가 여기에 올 예정 */}
                </View>
            )}
        </View>
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

export default DibsScrapPage;