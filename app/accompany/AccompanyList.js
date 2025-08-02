import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AccompanyListView from '../../components/accompany/AccompanyListView';

// 분리된 API 함수들을 import
import {
    fetchAccompanyFeedApi,
    fetchMyCreatedAccompanyApi,
    fetchMyAppliedAccompanyApi,
    handleApiError
} from '../../utils/AccompanyListApi'; // 경로는 프로젝트 구조에 맞게 조정

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
    const [loading, setLoading] = useState(true);

    const [feedLoaded, setFeedLoaded] = useState(false);
    const [mineLoaded, setMineLoaded] = useState(false);
    const [appliedLoaded, setAppliedLoaded] = useState(false);

    const [filters, setFilters] = useState({
        gender: '',
        age: '',
        categories: [],
        travelPeriod: '',
        travelLocation: '',
    });

    const router = useRouter();
    const currentUserId = 1;

    // 1. 전체 피드 데이터 가져오기
    const fetchAccompanyFeedData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchAccompanyFeedApi(currentUserId);
            setFeedList(data);
            setFeedLoaded(true);
        } catch (error) {
            handleApiError(error, '전체 동행 피드');
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    // 2. 내가 만든 동행 데이터 가져오기
    const fetchMyCreatedAccompanyData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchMyCreatedAccompanyApi(currentUserId);
            setMyCreatedAccompanyList(data);
            setMineLoaded(true);
        } catch (error) {
            handleApiError(error, '내가 만든 동행');
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    // 3. 신청한 동행 목록 데이터 가져오기
    const fetchMyAppliedAccompanyData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchMyAppliedAccompanyApi(currentUserId);
            setMyAppliedAccompanyList(data);
            setAppliedLoaded(true);
        } catch (error) {
            handleApiError(error, '신청한 동행 목록');
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    // 컴포넌트 마운트 시 초기 데이터 로드 (첫 로딩만)
    useEffect(() => {
        if (!feedLoaded) {
            fetchAccompanyFeedData();
        }
        if (!mineLoaded) {
            fetchMyCreatedAccompanyData();
        }
        if (!appliedLoaded) {
            fetchMyAppliedAccompanyData();
        }
    }, [feedLoaded, mineLoaded, appliedLoaded, fetchAccompanyFeedData, fetchMyCreatedAccompanyData, fetchMyAppliedAccompanyData]);

    // 화면 포커스 시 데이터 새로고침
    useFocusEffect(
        useCallback(() => {
            console.log(`💡 화면 포커스됨. 현재 탭: ${selectedTab}, showCards: ${showCards}`);
            if (selectedTab === 'feed' && !feedLoaded) {
                fetchAccompanyFeedData();
            } else if (selectedTab === 'mine' && !mineLoaded) {
                fetchMyCreatedAccompanyData();
            }
            if (showCards && !appliedLoaded) {
                fetchMyAppliedAccompanyData();
            }
            return () => {
                console.log('💡 화면 블러됨');
            };
        }, [selectedTab, showCards, feedLoaded, mineLoaded, appliedLoaded, fetchAccompanyFeedData, fetchMyCreatedAccompanyData, fetchMyAppliedAccompanyData])
    );

    // 개선된 새로고침 함수: 수동으로 새로고침 할 때만 데이터를 다시 불러옵니다.
    const onRefresh = useCallback(async () => {
        console.log('🔄 새로고침 시작');
        setRefreshing(true);
        try {
            setFeedLoaded(false);
            setMineLoaded(false);
            setAppliedLoaded(false);

            if (selectedTab === 'feed') {
                await fetchAccompanyFeedData();
            } else if (selectedTab === 'mine') {
                await fetchMyCreatedAccompanyData();
            }
            await fetchMyAppliedAccompanyData();

            console.log('✅ 새로고침 완료');
        } catch (error) {
            console.error('❌ 새로고침 중 오류:', error);
            Alert.alert('새로고침 오류', '데이터를 새로고침하는 중 오류가 발생했습니다.');
        } finally {
            setRefreshing(false);
            console.log('🔄 새로고침 상태 해제');
        }
    }, [selectedTab, fetchAccompanyFeedData, fetchMyCreatedAccompanyData, fetchMyAppliedAccompanyData]);

    useEffect(() => {
    let allPosts = [];
    if (selectedTab === 'mine') {
        allPosts = [...myCreatedAccompanyList];
    } else if (selectedTab === 'feed') {
        allPosts = [...feedList];
    } else if (selectedTab === 'applied') {
        allPosts = [...myAppliedAccompanyList];
    }

    // 🔥 최신순 정렬 추가
    allPosts.sort((a, b) => {
        const getDate = (post) => {
            return new Date(post.postDate || post.createdAt || post.date || '1970-01-01');
        };
        
        const dateA = getDate(a);
        const dateB = getDate(b);
        
        return dateB - dateA; // 최신순 정렬 (내림차순)
    });

    let filtered = [...allPosts];
    if (searchText) {
        const searchLower = searchText.toLowerCase();
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(searchLower) ||
            post.location.toLowerCase().includes(searchLower) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }
    if (filters.gender) {
        filtered = filtered.filter(post =>
            post.tags.includes(filters.gender) || post.tags.includes('성별무관')
        );
    }
    if (filters.age) {
        filtered = filtered.filter(post =>
            post.tags.includes(filters.age) || post.tags.includes('나이무관')
        );
    }
    if (filters.categories.length > 0) {
        filtered = filtered.filter(post =>
            filters.categories.some(category => post.tags.includes(category))
        );
    }
    if (filters.travelPeriod) {
        // 여행 기간 필터링 로직 추가
    }
    if (filters.travelLocation) {
        filtered = filtered.filter(post => post.location.toLowerCase().includes(filters.travelLocation.toLowerCase()));
    }

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

    const handlePressLike = useCallback((postId) => {
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
        console.log(`찜 ${likedPosts[postId] ? '취소' : '추가'}: ${postId}`);
    }, [likedPosts]);

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
        loading,
        filteredPosts,
        likedPosts,
        handlePressLike,
        navigateToPost,
        router,
        // 이 부분 추가됨: AccompanyListView로 함수들을 props로 전달
        fetchAccompanyFeedData,
        fetchMyCreatedAccompanyData,
        fetchMyAppliedAccompanyData,
    };

    return <AccompanyListView {...viewProps} />;
};

export default AccompanyList;