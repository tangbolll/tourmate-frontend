import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router'; // useRouter import는 올바름
import AccompanyListView from '../../components/accompany/AccompanyListView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useAuth } from '../../context/AuthContext';

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

    const { currentUserId } = useAuth();

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

    const updateLoadingState = (tab, isLoading) => {
        setLoadingStates(prev => ({ ...prev, [tab]: isLoading }));
    };

    const updateDataLoadedState = (tab, isLoaded) => {
        setDataLoaded(prev => ({ ...prev, [tab]: isLoaded }));
    };

    const isLoading = Object.values(loadingStates).some(loading => loading);

    const fetchLikesForPosts = useCallback(async (posts) => {
        if (!posts || posts.length === 0) {
            console.log('📝 좋아요 로드할 포스트가 없습니다.');
            return;
        }

        try {
            updateLoadingState('likes', true);
            const postIds = posts.map(post => post.id).filter(id => id && id !== undefined && id !== 'undefined');
            
            if (postIds.length > 0 && currentUserId) {
                const likesStatus = await getMultipleAccompanyLikesApi(postIds, currentUserId);
                setLikedPosts(prev => ({ ...prev, ...likesStatus }));
            } else {
                if (postIds.length === 0) console.warn('⚠️ 유효한 post ID가 없어서 좋아요 상태 로드 건너뛰기');
                if (!currentUserId) console.warn('⚠️ 현재 사용자 ID가 없어서 좋아요 상태 로드 건너뛰기');
            }
        } catch (error) {
            console.error('❌ 좋아요 상태 로딩 실패:', error);
            handleApiError(error, '좋아요 상태 로드');
        } finally {
            updateLoadingState('likes', false);
        }
    }, [currentUserId]);

    const fetchData = useCallback(async (tab, force = false) => {
        if (!force && dataLoaded[tab]) {
            console.log(`🔄 ${tab} 탭 데이터 이미 로드됨, 건너뛰기`);
            return;
        }

        try {
            updateLoadingState(tab, true);
            console.log(`🌐 ${tab} 탭 데이터 로딩 시작...`);
            let data;
            
            switch (tab) {
                case 'feed':
                    data = await fetchAccompanyFeedApi(currentUserId);
                    setFeedList(data);
                    break;
                case 'mine':
                    data = await fetchMyCreatedAccompanyApi(currentUserId);
                    setMyCreatedAccompanyList(data);
                    break;
                case 'applied':
                    data = await fetchMyAppliedAccompanyApi(currentUserId);
                    setMyAppliedAccompanyList(data);
                    break;
                default:
                    console.warn('⚠️ 알 수 없는 탭:', tab);
                    return;
            }
            
            updateDataLoadedState(tab, true);
            if (data.length > 0) {
                await fetchLikesForPosts(data);
            }
            console.log(`✅ ${tab} 데이터 로딩 완료. (${data.length}개)`);

        } catch (error) {
            console.error(`❌ ${tab} 데이터 로딩 실패:`, error);
            handleApiError(error, tab);
        } finally {
            updateLoadingState(tab, false);
        }
    }, [currentUserId, dataLoaded, fetchLikesForPosts]);

    // ✅ useFocusEffect 하나로 데이터 로딩을 통합
    useFocusEffect(
        useCallback(() => {
            console.log(`💡 화면 포커스됨. 현재 탭: ${selectedTab}`);
            // 현재 탭과 신청한 동행(applied) 데이터를 필요 시 로드
            const loadDataForCurrentTab = async () => {
                await fetchData(selectedTab);
                await fetchData('applied'); // 상단 카드용 데이터는 항상 로드
            };

            loadDataForCurrentTab();
            
            return () => {
                console.log('💡 화면 블러됨');
            };
        }, [selectedTab, fetchData])
    );

    // ✅ 초기 렌더링 시에만 실행되는 useEffect 삭제 (useFocusEffect로 통합)
    // ✅ 탭 변경 시에만 실행되던 useEffect 삭제 (useFocusEffect로 통합)

    const onRefresh = useCallback(async () => {
        console.log('🔄 새로고침 시작');
        setRefreshing(true);
        try {
            // 모든 탭의 dataLoaded 상태를 false로 초기화하여 강제로 재로드
            setDataLoaded({ feed: false, mine: false, applied: false });
            await fetchData(selectedTab, true);
            await fetchData('applied', true);
            console.log('✅ 새로고침 완료');
        } catch (error) {
            console.error('❌ 새로고침 중 오류:', error);
            Alert.alert('새로고침 오류', '데이터를 새로고침하는 중 오류가 발생했습니다.');
        } finally {
            setRefreshing(false);
        }
    }, [selectedTab, fetchData]);

    // 좋아요 토글 함수는 그대로 유지
    const handleToggleLike = useCallback(async (postId) => {
        if (!postId || !currentUserId) {
            Alert.alert('오류', '게시물 또는 사용자 정보를 찾을 수 없습니다.');
            return;
        }
        if (loadingStates.likes) {
            console.log('⚠️ 이미 좋아요 요청 처리 중...');
            return;
        }

        const currentLikeStatus = likedPosts[postId];
        try {
            updateLoadingState('likes', true);
            const optimisticLikeStatus = !currentLikeStatus;
            setLikedPosts(prev => ({ ...prev, [postId]: optimisticLikeStatus }));
            const response = await toggleLikeApi(postId, currentUserId);
            const { isLiked, likeCount } = response;
            setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
            
            // 모든 목록에서 좋아요 수 업데이트
            setFeedList(prev => prev.map(post => post.id.toString() === postId.toString() ? { ...post, likeCount } : post));
            setMyCreatedAccompanyList(prev => prev.map(post => post.id.toString() === postId.toString() ? { ...post, likeCount } : post));
            setMyAppliedAccompanyList(prev => prev.map(post => post.id.toString() === postId.toString() ? { ...post, likeCount } : post));
            setFilteredPosts(prev => prev.map(post => post.id.toString() === postId.toString() ? { ...post, likeCount } : post));

        } catch (error) {
            console.error('❌ 좋아요 토글 실패:', error);
            setLikedPosts(prev => ({ ...prev, [postId]: currentLikeStatus }));
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            updateLoadingState('likes', false);
        }
    }, [currentUserId, loadingStates.likes, likedPosts]);

    // 필터링 로직은 그대로 유지
    useEffect(() => {
        let allPosts = [];
        if (selectedTab === 'mine') {
            allPosts = [...myCreatedAccompanyList];
        } else if (selectedTab === 'feed') {
            allPosts = [...feedList];
        } else if (selectedTab === 'applied') {
            allPosts = [...myAppliedAccompanyList];
        }

        allPosts.sort((a, b) => {
            const getDate = (post) => new Date(post.tripStartDate || '1970-01-01');
            return getDate(b) - getDate(a);
        });

        let filtered = [...allPosts];
        
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(post =>
                (post.title?.toLowerCase().includes(searchLower) ||
                post.location?.toLowerCase().includes(searchLower))
            );
        }
        
        if (filters.gender) {
            filtered = filtered.filter(post => post.tags?.includes(filters.gender) || post.tags?.includes('성별무관'));
        }
        
        if (filters.age) {
            filtered = filtered.filter(post => post.tags?.includes(filters.age) || post.tags?.includes('나이무관'));
        }
        
        if (filters.categories.length > 0) {
            filtered = filtered.filter(post => filters.categories.some(category => post.tags?.includes(category)));
        }
        
        if (filters.travelLocation) {
            filtered = filtered.filter(post => post.location?.toLowerCase().includes(filters.travelLocation.toLowerCase()));
        }

        setFilteredPosts(filtered);
    }, [searchText, filters, selectedTab, myCreatedAccompanyList, feedList, myAppliedAccompanyList]);

    const handleFilterPopup = useCallback(() => setShowFilterPopup(true), []);
    const handleCloseFilterPopup = useCallback(() => setShowFilterPopup(false), []);
    const handleApplyFilters = useCallback((newFilters) => {
        setFilters(newFilters);
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
        router.push(`/accompany/AccompanyPost?postId=${postId}`);
    }, [router]);

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
        handleCalendarSelect: (range) => {
            const { startDate, endDate } = range;
            const formatted = `${dayjs(startDate).locale('ko').format('M월 D일(ddd)')} ~ ${dayjs(endDate).locale('ko').format('M월 D일(ddd)')}`;
            setFilters(prev => ({ ...prev, travelPeriod: formatted }));
            setCalendarVisible(false);
            setTimeout(() => setShowFilterPopup(true), 300);
        },
        getAllTags,
        handleRemoveTag,
        showCards,
        setShowCards,
        myAppliedAccompanyList,
        myCreatedAccompanyList,
        feedList,
        selectedTab,
        setSelectedTab,
        loading: isLoading,
        likedPosts,
        handlePressLike: handleToggleLike,
        filteredPosts,
        navigateToPost,
    };

    return <AccompanyListView {...viewProps} router={router} />;
};

export default AccompanyList;