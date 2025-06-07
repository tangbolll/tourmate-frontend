import { Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import AccompanyListHeader from '../../components/accompany/AccompanyListHeader';
import CalendarPopup from '../../components/accompany/CalendarPopup';
import FilterPopup from '../../components/accompany/FilterPopup';
import FilterTag from '../../components/accompany/FilterTag';
import AccompanyToggle from '../../components/accompany/AccompanyToggle';
import AccompanyCard from '../../components/accompany/AccompanyCard';
import AccompanyTabToggle from '../../components/accompany/AccompanyTabToggle';
import AccompanyFeed from '../../components/accompany/AccompanyFeed';
import CreateAccompanyButton from '../../components/accompany/CreateAccompanyButton';
import dayjs from 'dayjs';

// API 설정
const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    } else {
      return 'http://192.168.35.116:8080'; // 본인 IP로 변경
    }
  } else {
    return 'https://your-production-api.com';
  }
};

const API_URL = getApiUrl();

// 동행 카드 데이터 (기존 유지)
const cardData = [
  { id: "1", date: "03.01 ~ 03.05", title: "홍천 산천어 축제에서 놀아요", location: "홍천", imageUrl: "", buttonLabel: "승인" },
  { id: "2", date: "04.01 ~ 04.03", title: "부산 벚꽃축제 가실 분~", location: "부산", imageUrl: "", buttonLabel: "승인" },
  { id: "3", date: "01.05 ~ 03.01", title: "행궁뎅이 가서 브뤼셀 프라이 드실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
  { id: "4", date: "01.04 ~ 03.01", title: "동탄가서 단백쿠키 드실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
  { id: "5", date: "01.08 ~ 03.01", title: "수원에서 폰센트럴파크 러닝하실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
  { id: "6", date: "01.02 ~ 03.01", title: "목동에서 국내최고 에그타르트 먹으면서 따릉이 타실 분~", location: "서울", imageUrl: "", buttonLabel: "승인" },
];

const AccompanyList = () => {
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('feed');
  const [showCards, setShowCards] = useState(true);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 실제 API 데이터 상태
  const [myAccompanyList, setMyAccompanyList] = useState([]);
  const [feedList, setFeedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    gender: '',
    age: '',
    categories: [],
    travelPeriod: '',
    travelLocation: '',
  });

  const router = useRouter();
  
  // 현재 사용자 ID
  const currentUserId = 1;

  // 백엔드 데이터를 프론트엔드 형식으로 변환
  const transformAccompanyData = (accompanyData) => {
    if (!accompanyData) return [];
    
    return accompanyData.map(item => ({
      id: item.id?.toString() || Math.random().toString(),
      title: item.title || '제목 없음',
      location: item.location || '위치 미정',
      description: item.intro || '',
      meetingPoint: item.meetPlace || '',
      participants: item.participants?.length || 0,
      maxParticipants: item.maxRecruit || 0,
      imageUrl: item.imageUrl?.[0] || '',
      tags: [
        ...(item.ageGroup || []),
        ...(item.category || []),
        ...(item.tag || []),
        item.gender === 'ALL' ? '남녀무관' : item.gender
      ].filter(Boolean),
      date: item.tripStartDate ? 
        dayjs(item.tripStartDate).format('MM.DD ddd') : 
        dayjs().format('MM.DD ddd'),
      hostId: item.host?.id || null,
      liked: false, // 기본값
    }));
  };

  // API에서 동행 데이터 가져오기
  const fetchAccompanyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/accompany/home?userId=${currentUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API 응답:', data);
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedMyAccompany = transformAccompanyData(data.myAccompany);
        const transformedFeed = transformAccompanyData(data.feed);
        
        setMyAccompanyList(transformedMyAccompany);
        setFeedList(transformedFeed);
        
        console.log('✅ 변환된 내 동행:', transformedMyAccompany);
        console.log('✅ 변환된 피드:', transformedFeed);
      } else {
        console.error('❌ API 호출 실패:', response.status);
      }
    } catch (error) {
      console.error('❌ 네트워크 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 함수
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccompanyData();
    setRefreshing(false);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAccompanyData();
  }, []);

  // 화면 포커스 시 데이터 새로고침 (동행 생성 후 돌아왔을 때)
  useEffect(() => {
    const unsubscribe = router.addListener ? router.addListener('focus', () => {
      fetchAccompanyData();
    }) : null;

    return unsubscribe;
  }, [router]);

  // 필터링된 포스트 업데이트
  useEffect(() => {
    let allPosts = [];
    
    // 선택된 탭에 따라 데이터 소스 결정
    if (selectedTab === 'mine') {
      allPosts = [...myAccompanyList];
    } else if (selectedTab === 'feed') {
      allPosts = [...feedList];
    }

    let filtered = [...allPosts];

    // 검색어로 필터링
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.location.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 성별 필터링
    if (filters.gender) {
      filtered = filtered.filter(post =>
        post.tags.includes(filters.gender) || post.tags.includes('남녀무관')
      );
    }

    // 나이 필터링
    if (filters.age) {
      filtered = filtered.filter(post =>
        post.tags.includes(filters.age) || post.tags.includes('누구나')
      );
    }

    // 카테고리 필터링
    if (filters.categories.length > 0) {
      filtered = filtered.filter(post =>
        filters.categories.some(category => post.tags.includes(category))
      );
    }
    
    setFilteredPosts(filtered);
  }, [searchText, filters, selectedTab, myAccompanyList, feedList]);

  const handleFilterPopup = () => {
    setShowFilterPopup(false);
    setTimeout(() => {
      setShowFilterPopup(true);
    }, 50);
  };

  const handleCalendarSelect = (range) => {
    const { startDate, endDate } = range;
    const formatted = `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`;
    
    setFilters(prev => ({ ...prev, travelPeriod: formatted }));
    setCalendarVisible(false);
    setTimeout(() => {
      setShowFilterPopup(true);
    }, 300);
  };
  
  const handleCloseFilterPopup = () => setShowFilterPopup(false);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    console.log('Applied filters:', newFilters);
  };

  const handlePressLike = (postId) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    console.log(`찜 ${likedPosts[postId] ? '취소' : '추가'}: ${postId}`);
  };

  const handleRemoveTag = (tagToRemove) => {
    setFilters(prev => {
      const updated = { ...prev };
      if (updated.gender === tagToRemove) updated.gender = '';
      if (updated.age === tagToRemove) updated.age = '';
      updated.categories = updated.categories.filter(tag => tag !== tagToRemove);
      return updated;
    });
  };

  const getAllTags = () => {
    const tags = [];
    if (filters.gender) tags.push(filters.gender);
    if (filters.age) tags.push(filters.age);
    tags.push(...filters.categories);
    return tags;
  };

  const navigateToPost = (postId) => {
    console.log('이동할 주소:', `/accompany/AccompanyPost?postId=${postId}`);
    router.push(`/accompany/AccompanyPost?postId=${postId}`);
  };

  // 피드 아이템 렌더링
  const renderFeedItems = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>로딩 중...</Text>
        </View>
      );
    }

    if (filteredPosts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {selectedTab === 'mine' 
              ? '아직 생성한 동행이 없습니다.\n새로운 동행을 만들어보세요!'
              : '표시할 동행이 없습니다.\n필터를 조정해보세요.'}
          </Text>
        </View>
      );
    }
    
    return filteredPosts.map((post) => (
      <AccompanyFeed
        key={post.id}
        id={post.id}
        date={post.date}
        title={post.title}
        tags={post.tags}
        location={post.location}
        participants={post.participants}
        maxParticipants={post.maxParticipants}
        imageUrl={post.imageUrl}
        liked={!!likedPosts[post.id]}
        onPressLike={() => handlePressLike(post.id)}
        {...post} 
        onPress={() => navigateToPost(post.id)}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']} // Android
            tintColor={'#000'} // iOS
          />
        }
      >
        <AccompanyListHeader
          onPressAlarm={() => console.log('알림')}
          onPressDM={() => console.log('DM')}
          onPressFilter={handleFilterPopup}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        <FilterPopup
          visible={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          onApply={(filters) => {
            setFilters(filters);
            setShowFilterPopup(false);
          }}
          filters={filters}
          setFilters={setFilters}
          onOpenCalendar={() => {
            setShowFilterPopup(false);
            setTimeout(() => setCalendarVisible(true), 300);
          }}
        />

        <CalendarPopup
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          onSelectDates={(range) => {
            const { startDate, endDate } = range;
            const formatted = `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`;
            setFilters(prev => ({ ...prev, travelPeriod: formatted }));
            setCalendarVisible(false);
            setTimeout(() => setShowFilterPopup(true), 300);
          }}
        />  
        
        <View style={styles.filterTagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTagsScroll}>
            {getAllTags().map((tag) => (
              <FilterTag key={tag} tag={tag} onPress={() => handleRemoveTag(tag)} />
            ))}
          </ScrollView>
        </View>

        <AccompanyToggle 
          isExpanded={showCards} 
          onToggle={() => setShowCards(!showCards)} 
        />

        {showCards && (
          <View style={styles.cardsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
              {cardData.map((item) => (
                <AccompanyCard 
                  key={item.id} 
                  {...item} 
                  onPress={() => navigateToPost(item.id)} 
                />
              ))}
            </ScrollView>
          </View>
        )}

        <AccompanyTabToggle 
          selectedTab={selectedTab} 
          onSelectTab={(tab) => {
            setSelectedTab(tab);
            console.log(`탭 전환: ${tab} - 내 동행: ${myAccompanyList.length}개, 피드: ${feedList.length}개`);
          }} 
        />

        {renderFeedItems()}
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton}>
        <CreateAccompanyButton 
          onPress={() => {
            console.log('동행 생성 버튼 클릭');
            router.push('/accompany/AccompanyCreation');
          }}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative', 
  },
  floatingButton: { 
    position: 'absolute', 
    bottom: 25, 
    right: 20, 
    zIndex: 10 
  },
  filterTagsContainer: { 
    marginVertical: 8 
  },
  filterTagsScroll: { 
    paddingHorizontal: 16 
  },
  cardsContainer: { 
    marginTop: 16,
  },
  cardsScroll: { 
    paddingHorizontal: 16 
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
  },
});

export default AccompanyList;