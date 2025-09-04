import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
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
    getLikeStatusApi,
    handleApiError
} from '../../utils/AccompanyListApi';

const AccompanyList = () => {
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('feed');
    const [showCards, setShowCards] = useState(true);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    const [likeCounts, setLikeCounts] = useState({});
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
        travelPeriod: null, // null로 초기화
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
                const batchStatus = await getMultipleAccompanyLikesApi(postIds, currentUserId);
                
                const newLikedPosts = {};
                const newLikeCounts = {};

                for (const postId in batchStatus) {
                    newLikedPosts[postId] = batchStatus[postId].liked;
                    newLikeCounts[postId] = batchStatus[postId].likeCount;
                }

                setLikedPosts(prev => ({ ...prev, ...newLikedPosts }));
                setLikeCounts(prev => ({ ...prev, ...newLikeCounts }));
                console.log('newLikedPosts:', newLikedPosts);
                console.log('newLikeCounts:', newLikeCounts);
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

    useFocusEffect(
        useCallback(() => {
            console.log(`💡 화면 포커스됨. 현재 탭: ${selectedTab}`);
            const loadDataForCurrentTab = async () => {
                await fetchData(selectedTab);
                await fetchData('applied');
            };

            loadDataForCurrentTab();
            
            return () => {
                console.log('💡 화면 블러됨');
            };
        }, [selectedTab, fetchData])
    );

    const onRefresh = useCallback(async () => {
        console.log('🔄 새로고침 시작');
        setRefreshing(true);
        try {
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

    const handleToggleLike = useCallback(async (postId) => {
        if (!postId || !currentUserId) {
            Alert.alert('오류', '게시물 또는 사용자 정보를 찾을 수 없습니다.');
            return;
        }
        if (loadingStates.likes) {
            console.log('⚠️ 이미 좋아요 요청 처리 중...');
            return;
        }

        let currentLikeStatus;
        setLikedPosts(prev => {
            currentLikeStatus = prev[postId];
            return { ...prev, [postId]: !currentLikeStatus };
        });

        try {
            updateLoadingState('likes', true);
            const response = await toggleLikeApi(postId, currentUserId);
            const { isLiked, likeCount } = response;
            setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
            setLikeCounts(prev => ({ ...prev, [postId]: likeCount }));

        } catch (error) {
            console.error('❌ 좋아요 토글 실패:', error);
            setLikedPosts(prev => ({ ...prev, [postId]: currentLikeStatus }));
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            updateLoadingState('likes', false);
        }
    }, [currentUserId, loadingStates.likes]);

    // 🔥 필터링 로직 완전 수정
    useEffect(() => {
        let allPosts = [];
        if (selectedTab === 'mine') {
            allPosts = [...myCreatedAccompanyList];
        } else if (selectedTab === 'feed') {
            allPosts = [...feedList];
        } else if (selectedTab === 'applied') {
            allPosts = [...myAppliedAccompanyList];
        }

        // 날짜 순 정렬
        allPosts.sort((a, b) => {
            const getDate = (post) => new Date(post.tripStartDate || '1970-01-01');
            return getDate(b) - getDate(a);
        });

        let filtered = [...allPosts];
        
        // 검색 필터
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(post =>
                (post.title?.toLowerCase().includes(searchLower) ||
                post.location?.toLowerCase().includes(searchLower))
            );
        }
        
        // 🔥 성별 필터 수정 - tags 배열에서 확인
        if (filters.gender) {
            filtered = filtered.filter(post => {
                const postTags = post.tags || [];
                // tags 배열에서 성별 관련 태그 확인
                return postTags.includes(filters.gender);
            });
        }
        
        // 🔥 나이 필터 - ageRange 대신 tags에서 확인 (필요시)
        if (filters.age) {
            filtered = filtered.filter(post => {
                // 만약 나이 정보가 tags에 있다면
                const postTags = post.tags || [];
                return postTags.includes(filters.age);
                
                // 또는 별도의 ageRange 필드가 있다면 기존 코드 유지
                // const ageRange = post.ageRange || [];
                // return ageRange.includes(filters.age) || ageRange.includes('누구나');
            });
        }
        
        // 카테고리 필터 - tags에서 확인
        if (filters.categories.length > 0) {
            filtered = filtered.filter(post => {
                const postTags = post.tags || [];
                return filters.categories.some(category => postTags.includes(category));
            });
        }
        
        // 위치 필터
        if (filters.travelLocation) {
            filtered = filtered.filter(post => 
                post.location?.toLowerCase().includes(filters.travelLocation.toLowerCase())
            );
        }
        
        // 🔥 날짜 필터 수정 - 올바른 필드명 사용
        if (filters.travelPeriod && typeof filters.travelPeriod === 'object' && filters.travelPeriod.startDate && filters.travelPeriod.endDate) {
            const filterStartDate = new Date(filters.travelPeriod.startDate);
            const filterEndDate = new Date(filters.travelPeriod.endDate);
            
            filtered = filtered.filter(post => {
                // 🔥 올바른 필드명 사용
                if (!post.tripStartDate || !post.tripEndDate) {
                    console.log('날짜 필드 없음:', post.id, post.tripStartDate, post.tripEndDate);
                    return false;
                }
                
                const tripStart = new Date(post.tripStartDate);
                const tripEnd = new Date(post.tripEndDate);
                
                // 디버깅용 로그
                console.log('날짜 비교:', {
                    postId: post.id,
                    tripStart: tripStart.toISOString().split('T')[0],
                    tripEnd: tripEnd.toISOString().split('T')[0],
                    filterStart: filterStartDate.toISOString().split('T')[0],
                    filterEnd: filterEndDate.toISOString().split('T')[0],
                    overlaps: tripStart <= filterEndDate && tripEnd >= filterStartDate
                });
                
                // 여행 기간이 필터 기간과 겹치는지 확인
                return tripStart <= filterEndDate && tripEnd >= filterStartDate;
            });
        }

        console.log('필터링 결과:', {
            원본개수: allPosts.length,
            필터링후: filtered.length,
            적용된필터: filters,
            검색어: searchText
        });

        setFilteredPosts(filtered);
    }, [searchText, filters, selectedTab, myCreatedAccompanyList, feedList, myAppliedAccompanyList]);

    const handleFilterPopup = useCallback(() => setShowFilterPopup(true), []);
    const handleCloseFilterPopup = useCallback(() => setShowFilterPopup(false), []);
    const handleApplyFilters = useCallback((newFilters) => {
        console.log('🔥 필터 적용:', newFilters);
        setFilters(newFilters);
    }, []);

    // 🔥 태그 제거 로직 수정
    const handleRemoveTag = useCallback((tagToRemove) => {
        setFilters(prev => {
            const updated = { ...prev };
            
            // 성별 태그 제거
            if (updated.gender === tagToRemove) {
                updated.gender = '';
            }
            
            // 나이 태그 제거
            if (updated.age === tagToRemove) {
                updated.age = '';
            }
            
            // 카테고리 태그 제거
            updated.categories = updated.categories.filter(tag => tag !== tagToRemove);
            
            // 위치 태그 제거
            if (updated.travelLocation === tagToRemove) {
                updated.travelLocation = '';
            }
            
            // 🔥 날짜 태그 제거 - 객체와 문자열 모두 처리
            if (updated.travelPeriod) {
                const periodTag = typeof updated.travelPeriod === 'string'
                    ? updated.travelPeriod
                    : updated.travelPeriod.formatted;
                
                if (periodTag === tagToRemove) {
                    updated.travelPeriod = null;
                }
            }
            
            return updated;
        });
    }, []);

    // 🔥 getAllTags 함수 수정
    const getAllTags = useCallback(() => {
        const tags = [];
        if (filters.gender) tags.push(filters.gender);
        if (filters.age) tags.push(filters.age);
        if (filters.travelPeriod) {
            const periodTag = typeof filters.travelPeriod === 'string'
                ? filters.travelPeriod
                : filters.travelPeriod?.formatted;
            if (periodTag) tags.push(periodTag);
        }        
        if (filters.travelLocation) tags.push(filters.travelLocation);
        tags.push(...filters.categories);
        return tags;
    }, [filters]);

    const navigateToPost = useCallback((postId) => {
        router.push(`/accompany/AccompanyPost?postId=${postId}`);
    }, [router]);

    // 🔥 handleCalendarSelect 함수 수정
    const handleCalendarSelect = useCallback((range) => {
        const { startDate, endDate } = range;
        if (startDate && endDate) {
            const formatted = `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`;
            
            setFilters(prev => ({
                ...prev,
                travelPeriod: { startDate, endDate, formatted }
            }));
        } else {
            setFilters(prev => ({ ...prev, travelPeriod: null }));
        }
        setCalendarVisible(false);
    }, []);

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
        loading: isLoading,
        likedPosts,
        likeCounts,
        handlePressLike: handleToggleLike,
        filteredPosts,
        navigateToPost,
    };

    return <AccompanyListView {...viewProps} router={router} />;
};

export default AccompanyList;