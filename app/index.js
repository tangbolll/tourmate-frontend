import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import AccompanyListHeader from '../components/AccompanyListHeader';
import AccompanyToggle from '../components/AccompanyToggle';
import AccompanyCard from '../components/AccompanyCard';
import AccompanyTabToggle from '../components/AccompanyTabToggle';
import AccompanyFeed from '../components/AccompanyFeed';
import BottomBar from '../components/BottomBar'; 
import CreateAccompanyButton from '../components/CreateAccompanyButton';

const AccompanyList = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('feed');
    const [showCards, setShowCards] = useState(true);
    const [liked, setLiked] = useState(false);

    const handlePressLike = () => {
    console.log("찜 눌림");
    setLiked((prev) => !prev);
    };

const cardData = [
    {
        id: 1,

        date: "03.01 ~ 03.05",
        title: "홍천 산천어 축제에서 놀아요",
        location: "홍천",
        imageUrl: "",
        buttonLabel: "승인",
    },
    {
        id: 2,

        date: "04.01 ~ 04.03",
        title: "부산 벚꽃축제 가실 분~",
        location: "부산",
        imageUrl: "",
        buttonLabel: "승인",
    },
    {
        id: 3,

        date: "01.05 ~ 03.01",
        title: "행궁뎅이 가서 브뤼셀 프라이 드실 분~",
        location: "수원",
        imageUrl: "",
        buttonLabel: "승인",
    },
];
    return (
            <SafeAreaView style={styles.container}>
            <ScrollView>
            <AccompanyListHeader
            onPressAlarm={() => console.log('알림')}
            onPressDM={() => console.log('DM')}
            onPressFilter={() => console.log('필터')}
            searchText={searchText}
            setSearchText={setSearchText}
            />

            <AccompanyToggle
            isExpanded={showCards}
            onToggle={() => setShowCards(!showCards)}
            />

            {/* AccompanyCard들 가로 스크롤로 감싸기 */}
            <View style={{ marginTop: 16 }}>
            {showCards && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {cardData.map((item) => (
                            <AccompanyCard
                                key={item.id}
                                type={item.type}
                                date={item.date}
                                title={item.title}
                                location={item.location}
                                imageUrl={item.imageUrl}
                                buttonLabel={item.buttonLabel}
                                onPress={() => console.log(`${item.title} 카드 눌림`)}
                            />
                        ))}
                    </ScrollView>
            )}
            </View>

            <AccompanyTabToggle
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
            />

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
                onPress={() => navigation.navigate('AccompanyPost', {
                postId: '1',
                })}
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
                onPress={() => console.log('내가 만든 동행 클릭')}
            />
            )}


        </ScrollView>
        <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => console.log('동행 생성')}
    >
      <CreateAccompanyButton />
    </TouchableOpacity>
    <View style={styles.bottomBarContainer}>
      <BottomBar currentTab="accompany" onTabPress={(tab) => console.log(tab)} />
    </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
      floatingButton: {
        position: 'absolute',
        bottom: 70, // BottomBar와 간격
        right: 20,
        zIndex: 10,
      },
      bottomBarContainer: {
        position: 'absolute',
        bottom: -30, // 바닥이랑 바텀바 사이 간격
        left: 0,
        right: 0,
        backgroundColor: '#fff', // 또는 앱 테마 색상
        borderTopWidth: 2,
        borderTopColor: '#eee',
        paddingBottom: 0,
        paddingTop: 0,
      },
});

export default AccompanyList;