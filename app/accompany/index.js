// app/accompany/index.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AccompanyListHeader from '../../components/AccompanyListHeader';
import CalendarPopup from '../../components/CalendarPopup';
import FilterPopup from '../../components/FilterPopup';
import FilterTag from '../../components/FilterTag';
import AccompanyToggle from '../../components/AccompanyToggle';
import AccompanyCard from '../../components/AccompanyCard';
import AccompanyTabToggle from '../../components/AccompanyTabToggle';
import AccompanyFeed from '../../components/AccompanyFeed';
import CreateAccompanyButton from '../../components/CreateAccompanyButton';
import dayjs from 'dayjs';

// 목 데이터 - 실제 구현에서는 API에서 가져올 데이터
const mockPosts = [
  {
    id: '1',
    date: "03.04 월",
    title: "공주 공산성에서 야경 같이 즐겨요",
    location: "공주",
    participants: 2,
    maxParticipants: 3,
    imageUrl: "",
    tags: ['야경', '여자만', '저녁식사', '걷기'],
    hostId: "user001", // 현재 사용자 ID (예시)
  },
  {
    id: '2',
    date: "03.10 일",
    title: "서울 야경 투어 같이 하실 분",
    location: "서울",
    participants: 1,
    maxParticipants: 4,
    imageUrl: "",
    tags: ['야경', '남녀무관', '도보여행'],
    hostId: "user002",
  },
  {
    id: '3',
    date: "04.05 금",
    title: "제주도 테마파크 동행 구해요",
    location: "제주",
    participants: 3,
    maxParticipants: 5,
    imageUrl: "",
    tags: ['테마파크', '20대', '남녀무관'],
    hostId: "user003",
  },
  {
    id: '4',
    date: "03.15 토",
    title: "부산 해운대 같이 가요",
    location: "부산",
    participants: 2,
    maxParticipants: 3,
    imageUrl: "",
    tags: ['바다', '남녀무관'],
    hostId: "user001", // 현재 사용자 ID (예시)
  }
];

// 동행 카드 데이터
const cardData = [
  { id: "1", date: "03.01 ~ 03.05", title: "홍천 산천어 축제에서 놀아요", location: "홍천", imageUrl: "", buttonLabel: "승인" },
  { id: "2", date: "04.01 ~ 04.03", title: "부산 벚꽃축제 가실 분~", location: "부산", imageUrl: "", buttonLabel: "승인" },
  { id: "3", date: "01.05 ~ 03.01", title: "행궁뎅이 가서 브뤼셀 프라이 드실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
  { id: 4, date: "01.04 ~ 03.01", title: "동탄가서 단백쿠키 드실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
  { id: 5, date: "01.08 ~ 03.01", title: "수원에서 폰센트럴파크 러닝하실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
  { id: 6, date: "01.02 ~ 03.01", title: "목동에서 국내최고 에그타르트 드실 분~", location: "서울", imageUrl: "", buttonLabel: "승인" },
];

const AccompanyList = () => {
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('feed');
  const [showCards, setShowCards] = useState(true);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [filters, setFilters] = useState({
    gender: '여자만',
    age: '20대',
    categories: ['야경', '테마파크'],
    travelPeriod: '',
    travelLocation: '',
  });

  const router = useRouter();

  
  
  // 현재 사용자 ID (실제 구현에서는 인증 시스템에서 가져옵니다)
  const currentUserId = "user001";

  // 필터링된 포스트 업데이트
  useEffect(() => {
    let filtered = [...mockPosts];
    
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
    
    // 탭에 따라 다른 결과 설정
    if (selectedTab === 'myAccompany') {
      // 사용자가 호스트인 포스트만 필터링
      setMyPosts(filtered.filter(post => post.hostId === currentUserId));
    } else {
      setFilteredPosts(filtered);
    }
  }, [searchText, filters, selectedTab]);

  const handleFilterPopup = () => {
    setShowFilterPopup(false); // 먼저 닫았다가
    setTimeout(() => {
      setShowFilterPopup(true); // 다시 열기
    }, 50); // iOS에서 안전하게 모달 재오픈하는 핵심
  };

  const handleCalendarSelect = (range) => {
    const { startDate, endDate } = range;
    const formatted = `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`;
    
    setFilters(prev => ({ ...prev, travelPeriod: formatted }));
  
    // 1. 캘린더 닫고
    setCalendarVisible(false);
  
    // 2. 약간의 지연 후 필터 다시 열기 (iOS 안전)
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

  // 피드 아이템을 렌더링하는 함수
  const renderFeedItems = () => {
    const postsToRender = selectedTab === 'myAccompany' ? myPosts : filteredPosts;
    
    if (postsToRender.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {selectedTab === 'myAccompany' 
              ? '아직 생성한 동행이 없습니다.\n새로운 동행을 만들어보세요!'
              : '표시할 동행이 없습니다.\n필터를 조정해보세요.'}
          </Text>
        </View>
      );
    }
    
    return postsToRender.map((post) => (
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
        onPress={() => router.push(`/accompany/AccompanyPost?postId=${post.id}`)}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
              setShowFilterPopup(false); // 👈 이건 캘린더 흐름이 아니라면 있어도 됩니다
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
              setTimeout(() => setShowFilterPopup(true), 300); // ❗ 여기 핵심
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
                  onPress={() => {
                    console.log(`${item.title} 카드 클릭`);
                    router.push(`/accompany/AccompanyPost?postId=${item.id}`);
                  }} 
                />
              ))}
            </ScrollView>
          </View>
        )}

        <AccompanyTabToggle selectedTab={selectedTab} onSelectTab={setSelectedTab} />

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
    zIndex: 10 },
  filterTagsContainer: { 
    marginVertical: 8 
  },
  filterTagsScroll: { 
    paddingHorizontal: 16 
  },
  cardsContainer: { 
    marginTop: 16 
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