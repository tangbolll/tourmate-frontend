import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AccompanyListView from '../../components/accompany/AccompanyListView';

// 분리된 API 함수들을 import
import {
    fetchAccompanyFeedApi,
    fetchMyCreatedAccompanyApi,
    fetchMyAppliedAccompanyApi,
    toggleLikeApi,
    getMultipleAccompanyLikesApi,
    handleApiError
} from '../../utils/AccompanyListApi';

const AccompanyList = () => {
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('feed');
    const [showCards, setShowCards] = useState(true);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [myAppliedAccompanyList, setMyAppliedAccompanyList] = useState([]);
    const [myCreatedAccompanyList, setMyCreatedAccompanyList] = useState([]);
    const [feedList, setFeedList] = useState([]);
    
    // 각 탭별로 로딩 상태 분리
    const [loadingStates, setLoadingStates] = useState({
        feed: false,
        mine: false,
        applied: false,
        likes: false
    });

    const [dataLoaded, setDataLoaded] = useState({
        feed: false,
        mine: false,
        applied: false
    });

    const [filters, setFilters] = useState({
        gender: '',
        age: '',
        categories: [],
        travelPeriod: '',
        travelLocation: '',
    });

    const router = useRouter();
    const currentUserId = 3;

    // 로딩 상태 업데이트 헬퍼 함수
    const updateLoadingState = (tab, isLoading) => {
        setLoadingStates(prev => ({ ...prev, [tab]: isLoading }));
    };

    const updateDataLoadedState = (tab, isLoaded) => {
        setDataLoaded(prev => ({ ...prev, [tab]: isLoaded }));
    };

    // 전체 로딩 상태 계산
    const isLoading = Object.values(loadingStates).some(loading => loading);

    // ✅ 수정된 좋아요 상태 로드 함수 - id 필드 사용
    const fetchLikesForPosts = useCallback(async (posts) => {
        if (!posts || posts.length === 0) return;

        try {
            updateLoadingState('likes', true);
            console.log('🌐 좋아요 상태 로딩 시작...');
            
            // ✅ id 필드를 사용하도록 수정 (accompanyId 대신)
            const postIds = posts.map(post => post.id).filter(id => id && id !== undefined);
            console.log('🔍 좋아요 상태 로드할 ID들:', postIds);
            
            if (postIds.length > 0) {
                const likesStatus = await getMultipleAccompanyLikesApi(postIds, currentUserId);
                setLikedPosts(prev => ({ ...prev, ...likesStatus }));
                console.log('✅ 좋아요 상태 로딩 완료:', likesStatus);
            } else {
                console.warn('⚠️ 유효한 post ID가 없어서 좋아요 상태 로드 건너뛰기');
            }
        } catch (error) {
            console.error('❌ 좋아요 상태 로딩 실패:', error);
            handleApiError(error, '좋아요 상태 로드');
        } finally {
            updateLoadingState('likes', false);
        }
    }, [currentUserId]);

    // 1. 전체 피드 데이터 가져오기
    const fetchAccompanyFeedData = useCallback(async (force = false) => {
        if (!force && dataLoaded.feed) {
            console.log('🔄 피드 데이터 이미 로드됨, 건너뛰기');
            return;
        }

        try {
            updateLoadingState('feed', true);
            console.log('🌐 피드 데이터 로딩 시작...');
            const data = await fetchAccompanyFeedApi(currentUserId);
            console.log('✅ 피드 데이터 로딩 완료:', data.length);
            console.log('🔍 피드 데이터 샘플:', data[0]);
            setFeedList(data);
            updateDataLoadedState('feed', true);
            if (data.length > 0) {
                await fetchLikesForPosts(data);
            }
        } catch (error) {
            console.error('❌ 피드 데이터 로딩 실패:', error);
            handleApiError(error, '전체 동행 피드');
        } finally {
            updateLoadingState('feed', false);
        }
    }, [currentUserId, dataLoaded.feed, fetchLikesForPosts]);
    
    // 2. 내가 만든 동행 데이터 가져오기
    const fetchMyCreatedAccompanyData = useCallback(async (force = false) => {
        if (!force && dataLoaded.mine) {
            console.log('🔄 내가 만든 동행 데이터 이미 로드됨, 건너뛰기');
            return;
        }

        try {
            updateLoadingState('mine', true);
            console.log('🌐 내가 만든 동행 데이터 로딩 시작...');
            const data = await fetchMyCreatedAccompanyApi(currentUserId);
            console.log('✅ 내가 만든 동행 데이터 로딩 완료:', data.length);
            console.log('🔍 내가 만든 동행 데이터 샘플:', data[0]);
            setMyCreatedAccompanyList(data);
            updateDataLoadedState('mine', true);
            if (data.length > 0) {
                await fetchLikesForPosts(data);
            }
        } catch (error) {
            console.error('❌ 내가 만든 동행 데이터 로딩 실패:', error);
            handleApiError(error, '내가 만든 동행');
        } finally {
            updateLoadingState('mine', false);
        }
    }, [currentUserId, dataLoaded.mine, fetchLikesForPosts]);

    // 3. 신청한 동행 목록 데이터 가져오기
    const fetchMyAppliedAccompanyData = useCallback(async (force = false) => {
        if (!force && dataLoaded.applied) {
            console.log('🔄 신청한 동행 데이터 이미 로드됨, 건너뛰기');
            return;
        }

        try {
            updateLoadingState('applied', true);
            console.log('🌐 신청한 동행 데이터 로딩 시작...');
            const data = await fetchMyAppliedAccompanyApi(currentUserId);
            console.log('✅ 신청한 동행 데이터 로딩 완료:', data.length);
            console.log('🔍 신청한 동행 데이터 샘플:', data[0]);
            setMyAppliedAccompanyList(data);
            updateDataLoadedState('applied', true);
            if (data.length > 0) {
                await fetchLikesForPosts(data);
            }
        } catch (error) {
            console.error('❌ 신청한 동행 데이터 로딩 실패:', error);
            handleApiError(error, '신청한 동행 목록');
        } finally {
            updateLoadingState('applied', false);
        }
    }, [currentUserId, dataLoaded.applied, fetchLikesForPosts]);

    // 컴포넌트 마운트 시 필수 데이터 로드
    useEffect(() => {
        const loadInitialData = async () => {
            console.log('🚀 컴포넌트 초기화 - 필수 데이터 로드 시작');
            
            // 신청한 동행 데이터는 항상 로드 (상단 카드용)
            if (!dataLoaded.applied) {
                console.log('📋 신청한 동행 데이터 로드 (상단 카드용)');
                await fetchMyAppliedAccompanyData();
            }
            
            // 현재 선택된 탭의 데이터 로드
            if (selectedTab === 'feed' && !dataLoaded.feed) {
                console.log('📰 피드 데이터 로드');
                await fetchAccompanyFeedData();
            } else if (selectedTab === 'mine' && !dataLoaded.mine) {
                console.log('👤 내가 만든 동행 데이터 로드');
                await fetchMyCreatedAccompanyData();
            }
        };

        loadInitialData();
    }, []); // 빈 dependency array로 컴포넌트 마운트 시에만 실행

    // 탭 변경 시 해당 탭 데이터 로드
    useEffect(() => {
        const loadTabData = async () => {
            console.log(`📱 탭 변경됨: ${selectedTab}`);
            console.log(`📊 현재 데이터 로드 상태:`, dataLoaded);
            
            switch (selectedTab) {
                case 'feed':
                    console.log(`🔄 피드 탭 - 데이터 로드됨: ${dataLoaded.feed}`);
                    if (!dataLoaded.feed) {
                        await fetchAccompanyFeedData();
                    }
                    break;
                case 'mine':
                    console.log(`🔄 내 동행 탭 - 데이터 로드됨: ${dataLoaded.mine}`);
                    if (!dataLoaded.mine) {
                        await fetchMyCreatedAccompanyData();
                    }
                    break;
                case 'applied':
                    console.log(`🔄 신청 동행 탭 - 데이터 로드됨: ${dataLoaded.applied}`);
                    // applied는 이미 초기에 로드되므로 여기서는 확인만
                    console.log(`✅ 신청한 동행 데이터 현재 상태: ${myAppliedAccompanyList.length}개`);
                    break;
            }
        };

        // 초기 로드가 아닌 탭 변경 시에만 실행
        if (selectedTab !== 'feed') { // 기본 탭이 feed가 아닌 경우에만
            loadTabData();
        }
    }, [selectedTab]);

    // 화면 포커스 시 필요한 경우에만 데이터 새로고침
    useFocusEffect(
        useCallback(() => {
            console.log(`💡 화면 포커스됨. 현재 탭: ${selectedTab}`);
            console.log(`📊 포커스 시 데이터 상태:`, {
                feed: dataLoaded.feed,
                mine: dataLoaded.mine,
                applied: dataLoaded.applied,
                appliedCount: myAppliedAccompanyList.length
            });
            
            // 신청한 동행 데이터가 없으면 로드 (상단 카드용)
            const loadMissingData = async () => {
                if (!dataLoaded.applied) {
                    console.log(`🚨 포커스에서 신청한 동행 데이터 로드 시작!`);
                    await fetchMyAppliedAccompanyData();
                }
                
                // 현재 탭의 데이터가 없으면 로드
                if (selectedTab === 'feed' && !dataLoaded.feed) {
                    console.log(`🚨 포커스에서 피드 데이터 로드 시작!`);
                    await fetchAccompanyFeedData();
                } else if (selectedTab === 'mine' && !dataLoaded.mine) {
                    console.log(`🚨 포커스에서 내 동행 데이터 로드 시작!`);
                    await fetchMyCreatedAccompanyData();
                }
            };

            loadMissingData();

            return () => {
                console.log('💡 화면 블러됨');
            };
        }, [selectedTab, dataLoaded, myAppliedAccompanyList.length, fetchAccompanyFeedData, fetchMyCreatedAccompanyData, fetchMyAppliedAccompanyData])
    );

    // 새로고침 함수
    const onRefresh = useCallback(async () => {
        console.log('🔄 새로고침 시작');
        setRefreshing(true);
        
        try {
            // 신청한 동행은 항상 새로고침 (상단 카드용)
            console.log('🔄 신청한 동행 데이터 새로고침');
            updateDataLoadedState('applied', false);
            await fetchMyAppliedAccompanyData(true);
            
            // 현재 탭 데이터도 새로고침
            switch (selectedTab) {
                case 'feed':
                    console.log('🔄 피드 데이터 새로고침');
                    updateDataLoadedState('feed', false);
                    await fetchAccompanyFeedData(true);
                    break;
                case 'mine':
                    console.log('🔄 내 동행 데이터 새로고침');
                    updateDataLoadedState('mine', false);
                    await fetchMyCreatedAccompanyData(true);
                    break;
                case 'applied':
                    // 이미 위에서 새로고침함
                    console.log('🔄 신청한 동행 탭 - 이미 새로고침 완료');
                    break;
            }
            
            console.log('✅ 새로고침 완료');
        } catch (error) {
            console.error('❌ 새로고침 중 오류:', error);
            Alert.alert('새로고침 오류', '데이터를 새로고침하는 중 오류가 발생했습니다.');
        } finally {
            setRefreshing(false);
        }
    }, [selectedTab, fetchAccompanyFeedData, fetchMyCreatedAccompanyData, fetchMyAppliedAccompanyData]);

    // ✅ 수정된 좋아요 토글 핸들러 - id 필드 사용
    const handleToggleLike = useCallback(async (postId) => {
        console.log(`💖 좋아요 토글 시작: postId=${postId} (타입: ${typeof postId})`);
        
        // 유효하지 않은 postId 체크
        if (!postId || postId === undefined || postId === 'undefined') {
            console.error('❌ 유효하지 않은 postId:', postId);
            Alert.alert('오류', '게시물을 찾을 수 없습니다.');
            return;
        }
        
        // 이미 로딩 중이면 중복 호출 방지
        if (loadingStates.likes) {
            console.log('⚠️ 이미 좋아요 요청 처리 중...');
            return;
        }

        try {
            updateLoadingState('likes', true);
            console.log(`🔄 좋아요 토글 API 호출: postId=${postId}, userId=${currentUserId}`);
            
            // API 호출
            const response = await toggleLikeApi(postId, currentUserId);
            const { isLiked, likeCount } = response;
            
            console.log(`✅ 좋아요 토글 성공. 상태: ${isLiked}, 좋아요 수: ${likeCount}`);

            // UI 상태 즉시 업데이트
            setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
            
            // 필터링된 포스트 목록에서도 좋아요 수 업데이트
            setFilteredPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId ? { ...post, likeCount: likeCount } : post
                )
            );

        } catch (error) {
            console.error('❌ 좋아요 토글 실패:', error);
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            updateLoadingState('likes', false);
        }
    }, [currentUserId, loadingStates.likes]);

    // 필터링 로직
    useEffect(() => {
        let allPosts = [];
        if (selectedTab === 'mine') {
            allPosts = [...myCreatedAccompanyList];
        } else if (selectedTab === 'feed') {
            allPosts = [...feedList];
        } else if (selectedTab === 'applied') {
            allPosts = [...myAppliedAccompanyList];
        }

        console.log(`🔍 ${selectedTab} 탭 데이터 개수:`, allPosts.length);
        console.log(`🔍 ${selectedTab} 탭 첫 번째 아이템 ID:`, allPosts[0]?.id);

        // 최신순 정렬
        allPosts.sort((a, b) => {
            const getDate = (post) => {
                return new Date(post.postDate || post.createdAt || post.date || '1970-01-01');
            };
            
            const dateA = getDate(a);
            const dateB = getDate(b);
            
            return dateB - dateA;
        });

        let filtered = [...allPosts];
        
        // 검색 필터
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.location.toLowerCase().includes(searchLower) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }
        
        // 성별 필터
        if (filters.gender) {
            filtered = filtered.filter(post =>
                post.tags.includes(filters.gender) || post.tags.includes('성별무관')
            );
        }
        
        // 나이 필터
        if (filters.age) {
            filtered = filtered.filter(post =>
                post.tags.includes(filters.age) || post.tags.includes('나이무관')
            );
        }
        
        // 카테고리 필터
        if (filters.categories.length > 0) {
            filtered = filtered.filter(post =>
                filters.categories.some(category => post.tags.includes(category))
            );
        }
        
        // 여행 위치 필터
        if (filters.travelLocation) {
            filtered = filtered.filter(post => 
                post.location.toLowerCase().includes(filters.travelLocation.toLowerCase())
            );
        }

        console.log(`🔍 필터링 후 데이터 개수:`, filtered.length);
        console.log(`🔍 필터링 후 첫 번째 아이템 ID:`, filtered[0]?.id);
        setFilteredPosts(filtered);
    }, [searchText, filters, selectedTab, myCreatedAccompanyList, feedList, myAppliedAccompanyList]);

    const handleFilterPopup = useCallback(() => {
        setShowFilterPopup(false);
        setTimeout(() => {
            setShowFilterPopup(true);
        }, 50);
    }, []);

    const handleCalendarSelect = useCallback((range) => {
        const { startDate, endDate } = range;
        const formatted = `${dayjs(startDate).locale('ko').format('M월 D일(ddd)')} ~ ${dayjs(endDate).locale('ko').format('M월 D일(ddd)')}`;

        setFilters(prev => ({ ...prev, travelPeriod: formatted }));
        setCalendarVisible(false);
        setTimeout(() => {
            setShowFilterPopup(true);
        }, 300);
    }, []);

    const handleCloseFilterPopup = useCallback(() => setShowFilterPopup(false), []);

    const handleApplyFilters = useCallback((newFilters) => {
        setFilters(newFilters);
        console.log('Applied filters:', newFilters);
    }, []);

    const handleRemoveTag = useCallback((tagToRemove) => {
        setFilters(prev => {
            const updated = { ...prev };
            if (updated.gender === tagToRemove) updated.gender = '';
            if (updated.age === tagToRemove) updated.age = '';
            updated.categories = updated.categories.filter(tag => tag !== tagToRemove);
            if (updated.travelPeriod === tagToRemove) updated.travelPeriod = '';
            if (updated.travelLocation === tagToRemove) updated.travelLocation = '';
            return updated;
        });
    }, []);

    const getAllTags = useCallback(() => {
        const tags = [];
        if (filters.gender) tags.push(filters.gender);
        if (filters.age) tags.push(filters.age);
        if (filters.travelPeriod) tags.push(filters.travelPeriod);
        if (filters.travelLocation) tags.push(filters.travelLocation);
        tags.push(...filters.categories);
        return tags;
    }, [filters]);

    const navigateToPost = useCallback((postId) => {
        console.log('이동할 주소:', `/accompany/AccompanyPost?postId=${postId}`);
        router.push(`/accompany/AccompanyPost?postId=${postId}`);
    }, [router]);

    // ✅ 수정된 viewProps - 중복 제거 및 정리
    const viewProps = {
        refreshing,
        onRefresh,
        searchText,
        setSearchText,
        showFilterPopup,
        handleFilterPopup,
        handleCloseFilterPopup,
        handleApplyFilters,
        filters,
        setFilters,
        calendarVisible,
        setCalendarVisible,
        handleCalendarSelect,
        getAllTags,
        handleRemoveTag,
        showCards,
        setShowCards,
        myAppliedAccompanyList,
        myCreatedAccompanyList,
        feedList,
        selectedTab,
        setSelectedTab,
        loading: isLoading, // 전체 로딩 상태
        likedPosts, // 좋아요 상태 맵
        handlePressLike: handleToggleLike, // ✅ 좋아요 토글 함수 (중복 제거)
        filteredPosts,
        navigateToPost,
        router,
        fetchAccompanyFeedData,
        fetchMyCreatedAccompanyData,
        fetchMyAppliedAccompanyData,
    };

    return <AccompanyListView {...viewProps} />;
};

export default AccompanyList;