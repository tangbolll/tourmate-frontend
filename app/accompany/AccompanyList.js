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
        // Constants.expoConfig?.extra?.API_BASE_URL_DEV는 일반적으로 app.json/app.config.js에 설정
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV || 'http://localhost:8080';
    } else { // 운영(배포) 환경
        // 배포 시 실제 URL로 변경 필요
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD || 'YOUR_PRODUCTION_API_URL';
    }
};

const API_URL = getBaseURL();

const AccompanyList = () => {
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('feed'); // 'feed', 'mine', 'applied' 등 탭 구분
    const [showCards, setShowCards] = useState(true); // 신청한 동행 목록을 보여주는 카드 영역 표시 여부
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState({}); // 찜 여부를 관리하는 상태
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 각 데이터 목록 상태
    const [myAppliedAccompanyList, setMyAppliedAccompanyList] = useState([]);
    const [myCreatedAccompanyList, setMyCreatedAccompanyList] = useState([]);
    const [feedList, setFeedList] = useState([]);
    const [loading, setLoading] = useState(true); // 전반적인 로딩 상태

    // 각 데이터 로드 여부 상태 (불필요한 중복 API 호출 방지)
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
                item.gender === 'ALL' ? '성별무관' : item.gender,
                ...(item.category || []),
                ...(item.ageGroup || []),
                ...(item.tag || []),
            ].filter(Boolean),
            date: item.tripStartDate && item.tripEndDate ?
                `${dayjs(item.tripStartDate).locale('ko').format('MM.DD')} ~ ${dayjs(item.tripEndDate).locale('ko').format('MM.DD')}` :
                '날짜 미정',
            hostId: item.userId || null,
            status: item.status || '상태 미정',
            likeCount: item.likeCount || 0,
            // 찜 상태는 별도로 관리하는 경우 `liked: !!likedPosts[item.id]` 와 같이 처리
            // 현재는 백엔드에서 받아온 likeCount만 표시
        }));
    }, []);

    // API 에러 처리 공통 함수
    const handleApiError = useCallback((error, apiName = 'API') => {
        if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
            Alert.alert(
                '네트워크 연결 오류',
                '서버에 연결할 수 없습니다.\n\n확인사항:\n1. 서버가 실행 중인지 확인\n2. IP 주소가 올바른지 확인\n3. 포트 번호가 맞는지 확인'
            );
        } else if (error.name === 'AbortError') {
            Alert.alert('타임아웃', `${apiName} 서버 응답 시간이 초과되었습니다.`);
        } else {
            Alert.alert('오류', `${apiName} 요청 중 예상치 못한 오류가 발생했습니다: ${error.message}`);
        }
    }, []);

    // 1. 전체 피드 데이터 가져오기 (AccompanyHomeController.java의 @GetMapping("/home") 매핑)
    const fetchAccompanyFeedData = useCallback(async () => {
        try {
            setLoading(true);
            // 백엔드 @RequestParam Long id에 맞춰 `id` 파라미터 사용
            const url = `${API_URL}/api/accompany/home?id=${currentUserId}`;

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
                console.log('✅ /api/accompany/home API 응답 성공:', data);
                const transformedFeed = transformAccompanyData(data.feed);
                setFeedList(transformedFeed);
                setFeedLoaded(true);
            } else {
                const errorText = await response.text();
                console.error('❌ /api/accompany/home API 호출 실패');
                console.error('❌ 상태 코드:', response.status);
                console.error('❌ 에러 내용:', errorText);
                Alert.alert(
                    '서버 응답 오류',
                    `전체 동행 피드 로드 실패 (${response.status}): ${response.statusText || errorText}`
                );
            }
        } catch (error) {
            handleApiError(error, '전체 동행 피드');
        } finally {
            setLoading(false);
        }
    }, [currentUserId, handleApiError, transformAccompanyData]);

    // 2. 내가 만든 동행 데이터 가져오기 (AccompanyHomeController.java의 @GetMapping("/my/{userId}") 매핑)
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
                setMineLoaded(true);
            } else {
                const errorText = await response.text();
                console.error('❌ /api/accompany/my/{userId} API 호출 실패');
                console.error('❌ 상태 코드:', response.status);
                console.error('❌ 에러 내용:', errorText);
                Alert.alert(
                    '서버 응답 오류',
                    `내가 만든 동행 로드 실패 (${response.status}): ${response.statusText || errorText}`
                );
            }
        } catch (error) {
            handleApiError(error, '내가 만든 동행');
        } finally {
            setLoading(false);
        }
    }, [currentUserId, handleApiError, transformAccompanyData]);

    // 3. 신청한 동행 목록 데이터 가져오기 (AccompanyHomeController.java의 @GetMapping("/my-applications") 매핑)
    const fetchMyAppliedAccompanyData = useCallback(async () => {
        try {
            setLoading(true);
            // 백엔드 `@GetMapping("/my-applications")`에 맞춰 URL 수정 및 `id` 파라미터 사용
            const url = `${API_URL}/api/accompany/my-applications?id=${currentUserId}`;

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
                console.log('✅ /api/accompany/my-applications API 응답 성공:', data);
                const transformedAppliedAccompany = transformAccompanyData(data);
                setMyAppliedAccompanyList(transformedAppliedAccompany);
                setAppliedLoaded(true);
            } else {
                const errorText = await response.text();
                console.error('❌ /api/accompany/my-applications API 호출 실패');
                console.error('❌ 상태 코드:', response.status);
                console.error('❌ 에러 내용:', errorText);
                Alert.alert(
                    '서버 응답 오류',
                    `신청한 동행 로드 실패 (${response.status}): ${response.statusText || errorText}`
                );
            }
        } catch (error) {
            handleApiError(error, '신청한 동행 목록');
        } finally {
            setLoading(false);
        }
    }, [currentUserId, handleApiError, transformAccompanyData]);


    // 컴포넌트 마운트 시 초기 데이터 로드 (첫 로딩만)
    useEffect(() => {
        // 모든 데이터는 처음 한 번씩만 로드
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


    // 화면 포커스 시 데이터 새로고침 (useFocusEffect 사용)
    useFocusEffect(
        useCallback(() => {
            console.log(`💡 화면 포커스됨. 현재 탭: ${selectedTab}, showCards: ${showCards}`);
            // 탭 변경이나 showCards 상태 변경 시 해당 데이터 새로고침
            // 즉, 해당 데이터가 아직 로드되지 않았거나, 새로고침이 필요한 경우에만 호출
            if (selectedTab === 'feed' && !feedLoaded) {
                fetchAccompanyFeedData();
            } else if (selectedTab === 'mine' && !mineLoaded) {
                fetchMyCreatedAccompanyData();
            }
            // `showCards`는 신청한 동행 목록을 보여주는 영역이므로, 항상 최신 데이터를 유지하도록 포커스 시 로드
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
            // 모든 데이터 로드 상태를 false로 초기화하여 강제로 다시 불러오기
            setFeedLoaded(false);
            setMineLoaded(false);
            setAppliedLoaded(false);

            // 현재 탭에 해당하는 데이터와 신청한 동행 목록을 다시 불러옵니다.
            if (selectedTab === 'feed') {
                await fetchAccompanyFeedData();
            } else if (selectedTab === 'mine') {
                await fetchMyCreatedAccompanyData();
            }
            // 신청한 동행 목록은 어떤 탭에서든 새로고침 시 함께 갱신
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


    // 필터링된 포스트 업데이트 로직
    useEffect(() => {
        let allPosts = [];

        if (selectedTab === 'mine') {
            allPosts = [...myCreatedAccompanyList];
        } else if (selectedTab === 'feed') {
            allPosts = [...feedList];
        } else if (selectedTab === 'applied') { // '신청한 동행' 탭 선택 시
            allPosts = [...myAppliedAccompanyList];
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
        // 여행 기간 필터링 로직 추가 (필요하다면 백엔드와 연동)
        if (filters.travelPeriod) {
            // 필터링 로직 구현 (예: post.date와 filters.travelPeriod 비교)
            // 현재는 문자열 비교이므로, 정확한 날짜 범위 필터링을 위해서는
            // dayjs 등을 이용한 날짜 객체 비교 로직이 필요합니다.
        }
        if (filters.travelLocation) {
            filtered = filtered.filter(post => post.location.toLowerCase().includes(filters.travelLocation.toLowerCase()));
        }

        setFilteredPosts(filtered);
    }, [searchText, filters, selectedTab, myCreatedAccompanyList, feedList, myAppliedAccompanyList]);


    // 핸들러 함수들 (기존과 동일)
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
            if (updated.travelPeriod === tagToRemove) updated.travelPeriod = ''; // 여행 기간 태그 제거
            if (updated.travelLocation === tagToRemove) updated.travelLocation = ''; // 여행 지역 태그 제거
            return updated;
        });
    }, []);

    const getAllTags = useCallback(() => {
        const tags = [];
        if (filters.gender) tags.push(filters.gender);
        if (filters.age) tags.push(filters.age);
        if (filters.travelPeriod) tags.push(filters.travelPeriod); // 여행 기간 태그 추가
        if (filters.travelLocation) tags.push(filters.travelLocation); // 여행 지역 태그 추가
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
        myAppliedAccompanyList, // '신청한 동행 목록' 데이터를 전달
        myCreatedAccompanyList, // '내가 만든 동행' 데이터를 전달
        feedList, // '전체 피드' 데이터를 전달
        selectedTab,
        setSelectedTab,
        loading,
        filteredPosts,
        likedPosts,
        handlePressLike,
        navigateToPost,
        router,
        // 🚨 이 부분 추가됨: AccompanyListView로 함수들을 props로 전달
        fetchAccompanyFeedData,
        fetchMyCreatedAccompanyData,
        fetchMyAppliedAccompanyData,
    };

    return <AccompanyListView {...viewProps} />;
};

export default AccompanyList;