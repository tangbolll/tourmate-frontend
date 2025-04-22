import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AccompanyListHeader from '../../components/AccompanyListHeader';
import FilterPopup from '../../components/FilterPopup';
import CalendarPopup from '../../components/CalendarPopup';
import FilterTag from '../../components/FilterTag';
import AccompanyToggle from '../../components/AccompanyToggle';
import AccompanyCard from '../../components/AccompanyCard';
import AccompanyTabToggle from '../../components/AccompanyTabToggle';
import AccompanyFeed from '../../components/AccompanyFeed';
// import BottomBar from '../../components/BottomBar'; 
import CreateAccompanyButton from '../../components/CreateAccompanyButton';
import dayjs from 'dayjs';


const AccompanyList = ({ navigation }) => {
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('feed');
  const [showCards, setShowCards] = useState(true);
  const [liked, setLiked] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [filters, setFilters] = useState({
    gender: '여자만',
    age: '20대',
    categories: ['야경', '테마파크'],
    travelPeriod: '',
    travelLocation: '',
  });

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
    console.log('Applied filters:', newFilters);};

  const handlePressLike = () => {
    console.log("찜 눌림");
    setLiked(prev => !prev);
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

  const cardData = [
    { id: 1, date: "03.01 ~ 03.05", title: "홍천 산천어 축제에서 놀아요", location: "홍천", imageUrl: "", buttonLabel: "승인" },
    { id: 2, date: "04.01 ~ 04.03", title: "부산 벚꽃축제 가실 분~", location: "부산", imageUrl: "", buttonLabel: "승인" },
    { id: 3, date: "01.05 ~ 03.01", title: "행궁뎅이 가서 브뤼셀 프라이 드실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
    { id: 4, date: "01.04 ~ 03.01", title: "동탄가서 단백쿠키 드실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
    { id: 5, date: "01.08 ~ 03.01", title: "수원에서 폰센트럴파크 러닝하실 분~", location: "수원", imageUrl: "", buttonLabel: "승인" },
    { id: 6, date: "01.02 ~ 03.01", title: "목동에서 국내최고 에그타르트 드실 분~", location: "서울", imageUrl: "", buttonLabel: "승인" },
  ];

  const router = useRouter();

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

        <View style={{ marginVertical: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {getAllTags().map((tag) => (
              <FilterTag key={tag} tag={tag} onPress={() => handleRemoveTag(tag)} />
            ))}
          </ScrollView>
        </View>

        <AccompanyToggle isExpanded={showCards} onToggle={() => setShowCards(!showCards)} />

        {showCards && (
          <View style={{ marginTop: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {cardData.map((item) => (
                <AccompanyCard key={item.id} {...item} onPress={() => console.log(`${item.title} 카드 클릭`)} />
              ))}
            </ScrollView>
          </View>
        )}

        <AccompanyTabToggle selectedTab={selectedTab} onSelectTab={setSelectedTab} />


        {selectedTab === 'feed' ? (
          <AccompanyFeed
            date="03.04 월"
            title="공주 공산성에서 야경 같이 즐겨요"
            tags={['야경', '여자만', '저녁식사', '걷기']}
            location="공주"
            participants={2}
            maxParticipants={3}
            imageUrl=""
            liked={liked}
            onPressLike={handlePressLike}
            onPress={() => navigation.navigate('AccompanyPost', { postId: '1' })}
          />
        ) : (
          <AccompanyFeed
            date="04.10 수"
            title="내가 만든 동행 예시입니다"
            tags={['친목', '남자만']}
            location="서울"
            participants={1}
            maxParticipants={4}
            imageUrl=""
            liked={!liked}
            onPressLike={handlePressLike}
            onPress={() => console.log('내 동행 클릭')}
          />
        )}

      </ScrollView>
      <TouchableOpacity 
        style={styles.floatingButton} 
      >
        <CreateAccompanyButton 
          onPress={() => {
            console.log('동행 생성 버튼 클릭');
            router.push('/accompany/AccompanyCreation');
          }}
        />
      </TouchableOpacity>


      {/* {!showFilterPopup && (
      <View style={styles.bottomBarContainer} pointerEvents="none">
        <BottomBar currentTab="accompany" onTabPress={(tab) => console.log(tab)} />
      </View> */}
      {/* )} */}
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
  // bottomBarContainer: {
  //   position: 'absolute',
  //   bottom: -30,
  //   left: 0,
  //   right: 0,
  //   backgroundColor: '#fff',
  //   borderTopWidth: 2,
  //   borderTopColor: '#eee',
  //   paddingBottom: 0,
  //   paddingTop: 0,
  // },
});

export default AccompanyList;