import { Alert, Platform } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import { useRouter, useFocusEffect } from 'expo-router';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import AccompanyListView from '../../components/accompany/AccompanyListView'; 

// 기본 API URL을 가져오는 함수 (환경 설정에 따라)
const getBaseURL = () => {
    if (__DEV__) { // 개발 환경
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080'; // 안드로이드 에뮬레이터는 '10.0.2.2'를 로컬호스트로 사용
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV || 'http://localhost:8080';
    } else { // 운영(배포) 환경
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD || 'YOUR_PRODUCTION_API_URL'; // 배포 시 실제 URL로 변경 필요
    }
};

const API_URL = getBaseURL();

const AccompanyList = () => {
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('feed');
    const [showCards, setShowCards] = useState(true);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [myJoinedAccompanyList, setMyJoinedAccompanyList] = useState([]);
    const [myCreatedAccompanyList, setMyCreatedAccompanyList] = useState([]);
    const [feedList, setFeedList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 새로 추가된 상태 변수: 각 탭의 데이터 로드 여부를 추적합니다.
    const [feedLoaded, setFeedLoaded] = useState(false); 
    const [mineLoaded, setMineLoaded] = useState(false); 

    const [filters, setFilters] = useState({
        gender: '',
        age: '',
        categories: [],
        travelPeriod: '',
        travelLocation: '',
    });

    const router = useRouter();
    
    // TODO: 실제 사용자 ID를 가져오는 로직으로 변경 필요 (예: 인증 컨텍스트에서)
    const currentUserId = 2; 

    // 백엔드 데이터를 프론트엔드 형식으로 변환하는 함수
    const transformAccompanyData = useCallback((accompanyData) => {
        if (!accompanyData) return [];

        return accompanyData.map(item => ({
            id: item.id?.toString() || Math.random().toString(),
            title: item.title || '제목 없음',
            location: item.location || '위치 미정',
            description: item.intro || '',
            meetingPoint: item.meetPlace || '',
            participants: item.currentParticipants || 0,
            maxParticipants: item.maxRecruit || 0,
            imageUrl: item.images?.length > 0 ? item.images[0] : null,
            tags: [
                item.gender === 'ALL' ? '성별무관' : item.gender, // 성별 태그를 맨 앞에
                ...(item.category || []), // 카테고리 태그 포함
                // item.tag는 이제 포함하지 않습니다. (사용자 입력 태그)
                // item.ageGroup은 이제 포함하지 않습니다. (나이 태그)
            ].filter(Boolean), // null, undefined, 빈 문자열 제거
            date: item.tripStartDate && item.tripEndDate ? 
                `${dayjs(item.tripStartDate).locale('ko').format('MM.DD')} ~ ${dayjs(item.tripEndDate).locale('ko').format('MM.DD')}` : 
                '날짜 미정',
            hostId: item.userId || null,
            status: item.status || '상태 미정', 
            liked: false,
        }));
    }, []); 

    // API 에러 처리 공통 함수
    const handleApiError = useCallback((error) => {
        if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
            Alert.alert(
                '네트워크 연결 오류',
                '서버에 연결할 수 없습니다.\n\n확인사항:\n1. 서버가 실행 중인지 확인\n2. IP 주소가 올바른지 확인\n3. 포트 번호가 맞는지 확인'
            );
        } else if (error.name === 'AbortError') {
            Alert.alert('타임아웃', '서버 응답 시간이 초과되었습니다.');
        } else {
            Alert.alert('오류', `예상치 못한 오류가 발생했습니다: ${error.message}`);
        }
    }, []); 

    // 동행 홈 데이터 가져오기 (사용자가 신청한 동행 + 전체 피드)
    const fetchAccompanyData = useCallback(async () => {
        try {
            setLoading(true);
            const url = `${API_URL}/api/accompany/home?userId=${currentUserId}`;
            
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                signal: controller.signal,
            });
            clearTimeout(id); // 타임아웃 타이머 클리어

            if (response.ok) {
                const data = await response.json();
                console.log('✅ /api/accompany/home API 응답 성공:', data);

                const transformedMyJoinedAccompany = transformAccompanyData(data.myAccompanies);
                const transformedFeed = transformAccompanyData(data.feed);
                
                setMyJoinedAccompanyList(transformedMyJoinedAccompany);
                setFeedList(transformedFeed);
                setFeedLoaded(true); 
            } else {
                const errorText = await response.text();
                console.error('❌ /api/accompany/home API 호출 실패');
                console.error('❌ 상태 코드:', response.status);
                console.error('❌ 상태 텍스트:', response.statusText);
                console.error('❌ 에러 내용:', errorText);
                
                Alert.alert(
                    '네트워크 오류', 
                    `서버 응답 오류 (${response.status}): ${response.statusText}`
                );
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, handleApiError, transformAccompanyData]); 

    // 내가 만든 동행 데이터 가져오기
    const fetchMyCreatedAccompanyData = useCallback(async () => {
        try {
            setLoading(true);
            const url = `${API_URL}/api/accompany/my/${currentUserId}`;
            
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                signal: controller.signal,
            });
            clearTimeout(id);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ /api/accompany/my/{userId} API 응답 성공:', data);
                const transformedMyCreatedAccompany = transformAccompanyData(data);
                setMyCreatedAccompanyList(transformedMyCreatedAccompany);
                setMineLoaded(true); // 내가 만든 동행 데이터 로드 성공 시 `mineLoaded`를 true로 설정
            } else {
                const errorText = await response.text();
                console.error('❌ /api/accompany/my/{userId} API 호출 실패');
                console.error('❌ 상태 코드:', response.status);
                console.error('❌ 상태 텍스트:', response.statusText);
                console.error('❌ 에러 내용:', errorText);
                Alert.alert(
                    '네트워크 오류', 
                    `서버 응답 오류 (${response.status}): ${response.statusText}`
                );
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, handleApiError, transformAccompanyData]); 

    // 컴포넌트 마운트 시 동행 홈 데이터 로드 (첫 로딩만)
    // 앱이 처음 시작될 때 `feed` 탭의 데이터를 한 번만 로드합니다.
    useEffect(() => {
        if (!feedLoaded) { 
            fetchAccompanyData();
        }
    }, []); // 의존성 배열에 `feedLoaded`를 넣지 않아 한 번만 실행되도록 합니다.

    // 화면 포커스 시 데이터 새로고침 (useFocusEffect 사용)
    useFocusEffect(
        useCallback(() => {
            console.log(`💡 화면 포커스됨. 현재 탭: ${selectedTab}`);
            // ✅ 수정: `feedLoaded`가 false일 때만 `fetchAccompanyData` 호출
            if (selectedTab === 'feed' && !feedLoaded) { 
                fetchAccompanyData();
            } 
            // ✅ 수정: `mineLoaded`가 false일 때만 `fetchMyCreatedAccompanyData` 호출
            else if (selectedTab === 'mine' && !mineLoaded) { 
                fetchMyCreatedAccompanyData();
            }
            return () => {
                console.log('💡 화면 블러됨');
            };
        }, [selectedTab, feedLoaded, mineLoaded, fetchAccompanyData, fetchMyCreatedAccompanyData]) // ✅ 의존성 배열에 `feedLoaded`와 `mineLoaded` 추가
    );

    // 개선된 새로고침 함수: 수동으로 새로고침 할 때만 데이터를 다시 불러옵니다.
    const onRefresh = useCallback(async () => {
        console.log('🔄 새로고침 시작');
        setRefreshing(true);
        try {
            if (selectedTab === 'feed') {
                setFeedLoaded(false); // ✅ 수동 새로고침 시 `feedLoaded` 상태를 false로 리셋
                await fetchAccompanyData();
            } else if (selectedTab === 'mine') {
                setMineLoaded(false); // ✅ 수동 새로고침 시 `mineLoaded` 상태를 false로 리셋
                await fetchMyCreatedAccompanyData();
            }
            console.log('✅ 새로고침 완료');
        } catch (error) {
            console.error('❌ 새로고침 중 오류:', error);
        } finally {
            setRefreshing(false);
            console.log('🔄 새로고침 상태 해제');
        }
    }, [selectedTab, fetchAccompanyData, fetchMyCreatedAccompanyData]);

    // 필터링된 포스트 업데이트 로직
    useEffect(() => {
        let allPosts = [];
        
        if (selectedTab === 'mine') {
            allPosts = [...myCreatedAccompanyList];
        } else if (selectedTab === 'feed') {
            allPosts = [...feedList];
        }

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
        
        setFilteredPosts(filtered);
    }, [searchText, filters, selectedTab, myJoinedAccompanyList, myCreatedAccompanyList, feedList]);

    // 핸들러 함수들 (이전과 동일)
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
        console.log(`찜 ${prev[postId] ? '취소' : '추가'}: ${postId}`);
    }, []); 

    const handleRemoveTag = useCallback((tagToRemove) => {
        setFilters(prev => {
            const updated = { ...prev };
            if (updated.gender === tagToRemove) updated.gender = '';
            if (updated.age === tagToRemove) updated.age = '';
            updated.categories = updated.categories.filter(tag => tag !== tagToRemove);
            return updated;
        });
    }, []);

    const getAllTags = useCallback(() => {
        const tags = [];
        if (filters.gender) tags.push(filters.gender);
        if (filters.age) tags.push(filters.age);
        tags.push(...filters.categories);
        return tags;
    }, [filters]);

    const navigateToPost = useCallback((postId) => {
        console.log('이동할 주소:', `/accompany/AccompanyPost?postId=${postId}`);
        router.push(`/accompany/AccompanyPost?postId=${postId}`);
    }, [router]);

    // AccompanyListView에 전달할 props들을 객체로 만듭니다.
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
        myJoinedAccompanyList,
        selectedTab,
        setSelectedTab,
        fetchMyCreatedAccompanyData, // 이 함수들은 필요에 따라 AccompanyListView 내에서 호출되지 않고,
        fetchAccompanyData,         // AccompanyList 컴포넌트 내부에서 상태 변화에 따라 호출됩니다.
        loading,
        filteredPosts,
        likedPosts,
        handlePressLike,
        navigateToPost,
        router, 
    };

    return <AccompanyListView {...viewProps} />;
};

export default AccompanyList;