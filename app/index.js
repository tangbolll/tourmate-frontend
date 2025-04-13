import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import AccompanyListHeader from '../components/AccompanyListHeader';
import AccompanyToggle from '../components/AccompanyToggle';
import AccompanyCard from '../components/AccompanyCard';
import AccompanyTabToggle from '../components/AccompanyTabToggle';
import AccompanyFeed from '../components/AccompanyFeed';
import BottomBar from '../components/BottomBar'; 
import CreateAccompanyButton from '../components/CreateAccompanyButton';

const [searchText, setSearchText] = useState('');
const [selectedTab, setSelectedTab] = useState('feed');

const cardData = [
    {
        id: 1,
        type: "버디",
        date: "03.01 ~ 03.05",
        title: "홍천 산천어 축제에서 놀아요",
        location: "홍천",
        imageUrl: "",
        buttonLabel: "승인",
    },
    {
        id: 2,
        type: "버디",
        date: "04.01 ~ 04.03",
        title: "부산 벚꽃축제 가실 분~",
        location: "부산",
        imageUrl: "",
        buttonLabel: "승인",
    },
    {
        id: 3,
        type: "버디",
        date: "01.05 ~ 03.01",
        title: "행궁뎅이 가서 브뤼셀 프라이 드실 분~",
        location: "수원",
        imageUrl: "",
        buttonLabel: "승인",
    },
];

    // navigation prop을 받도록 수정
const AccompanyList = ({ navigation }) => {
    const [showCards, setShowCards] = useState(true);
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
                liked={true}
                onPressLike={() => console.log('찜 눌림')}
                onPress={() => navigation.navigate('AccompanyPost', {
                postId: '1',
                title: '공주 공산성에서 야경 같이 즐겨요',
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
                liked={false}
                onPressLike={() => console.log('찜 눌림')}
                onPress={() => console.log('내가 만든 동행 클릭')}
            />
            )}


            <AccompanyFeed
            date="03.04 월"
            title="공주 공산성에서 야경 같이 즐겨요"
            tags={['야경', '여자만', '저녁식사', '걷기']}
            location="공주"
            participants={2}
            maxParticipants={3}
            imageUrl="https://your-image-url.com/image.jpg"
            liked={true}
            onPressLike={() => console.log('찜 눌림')}
            // 피드 클릭 시 AccompanyPost 화면으로 이동하는 onPress 함수 추가
            onPress={() => navigation.navigate('AccompanyPost', { 
                // 필요한 데이터를 파라미터로 전달
                postId: '1', 
                title: '공주 공산성에서 야경 같이 즐겨요',
            })}
            />

            <CreateAccompanyButton onPress={() => console.log('동행 생성')} />

        </ScrollView>
        <BottomBar currentTab="accompany" onTabPress={(tab) => console.log(tab)} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    cardRow: {
        paddingHorizontal: 16,
        marginTop: 12,
      },
});

export default AccompanyList;