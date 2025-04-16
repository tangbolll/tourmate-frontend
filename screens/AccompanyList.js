import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import AccompanyListHeader from '../components/AccompanyListHeader';
import FilterPopup from '../components/FilterPopup';
import FilterTag from '../components/FilterTag';
import AccompanyToggle from '../components/AccompanyToggle';
import AccompanyCard from '../components/AccompanyCard';
import AccompanyTabToggle from '../components/AccompanyTabToggle';
import AccompanyFeed from '../components/AccompanyFeed';
import BottomBar from '../components/BottomBar';
import CreateAccompanyButton from '../components/CreateAccompanyButton';

export default function AccompanyList({ navigation }) {
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('feed');
  const [showCards, setShowCards] = useState(true);
  const [liked, setLiked] = useState(false);
  const [filters, setFilters] = useState({
    gender: '여자만',
    age: '',
    categories: ['야경', '테마파크'],
    travelPeriod: '',
    travelLocation: '',
  });

  const handlePressLike = () => setLiked(prev => !prev);

  const handleRemoveTag = (tagToRemove) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.filter(tag => tag !== tagToRemove),
    }));
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
          onPressFilter={() => setShowFilterPopup(true)}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        <FilterPopup
          visible={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          onApply={(newFilters) => {
            setFilters(newFilters);
            setShowFilterPopup(false);
          }}
          filters={filters}
          setFilters={setFilters}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginVertical: 8 }}>
          {filters.categories.map(tag => (
            <FilterTag key={tag} tag={tag} onPress={() => handleRemoveTag(tag)} />
          ))}
        </ScrollView>

        <AccompanyToggle isExpanded={showCards} onToggle={() => setShowCards(!showCards)} />

        {showCards && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}>
            {cardData.map(item => (
              <AccompanyCard
                key={item.id}
                {...item}
                onPress={() => console.log(`${item.title} 카드 클릭됨`)}
              />
            ))}
          </ScrollView>
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

      <TouchableOpacity style={styles.floatingButton} onPress={() => console.log('동행 생성')}>
        <CreateAccompanyButton />
      </TouchableOpacity>

      <View style={styles.bottomBarContainer}>
        <BottomBar currentTab="accompany" onTabPress={(tab) => console.log(tab)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    zIndex: 10,
  },
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
