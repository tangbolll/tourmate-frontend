import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import AccompanyListHeader from '../components/AccompanyListHeader';
import FilterPopup from '../components/FilterPopup';
import FilterTag from '../components/FilterTag';
import CalendarPopup from '../components/CalendarPopup';
import AccompanyToggle from '../components/AccompanyToggle';
import AccompanyCard from '../components/AccompanyCard';
import AccompanyTabToggle from '../components/AccompanyTabToggle';
import AccompanyFeed from '../components/AccompanyFeed';
import BottomBar from '../components/BottomBar'; 
import CreateAccompanyButton from '../components/CreateAccompanyButton';

const AccompanyList = ({ navigation }) => {
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('feed');
  const [showCards, setShowCards] = useState(true);
  const [liked, setLiked] = useState(false);

  const [filters, setFilters] = useState({
    gender: '여자만',
    age: '20대',
    categories: ['야경', '테마파크'],
    travelPeriod: '',
    travelLocation: '',
  });

  const handleFilterPopup = () => setShowFilterPopup(true);
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
  ];

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
          onClose={handleCloseFilterPopup}
          onApply={handleApplyFilters}
          filters={filters}
          setFilters={setFilters}
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
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={() => console.log('동행 생성')}>
        <CreateAccompanyButton />
      </TouchableOpacity>

      <View style={styles.bottomBarContainer}>
        <BottomBar currentTab="accompany" onTabPress={(tab) => console.log(tab)} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  floatingButton: { position: 'absolute', bottom: 70, right: 20, zIndex: 10 },
  bottomBarContainer: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: '#eee',
    paddingBottom: 0,
    paddingTop: 0,
  },
});

export default AccompanyList;
