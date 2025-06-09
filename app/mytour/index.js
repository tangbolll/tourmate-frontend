import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import  BookmarkedEvent from '../../components/mytour/mytourHome/BookMarkedEvent';
import MyTourFeed from '../../components/mytour/mytourHome/MyTourFeed';
import { SortToggle } from '../../components/mytour/mytourHome/SortToggle';
import TourDesignButton from '../../components/mytour/mytourHome/TourDesignButton';

export default function MyTripsScreen() {
    return (
        <View style={styles.container}>
        <Text style={styles.text}>내 여행 페이지입니다</Text>
        <BookmarkedEvent
            tourStartDate="2023-10-01"
            tourEndDate="2023-10-05"
            title="가을 여행"
            location="서울"
            isBookmarked={true}
            onPress={() => console.log('여행 상세로 이동')}
            onBookmarkPress={() => console.log('즐겨찾기 토글')}
        />
        <MyTourFeed
            tourStartDate="2023-06-30"
            tourEndDate="2023-07-02"
            title="오스트레일리아 말고 오스트리아 여행"
            location="오스트리아, 빈"
            members={["jibag02", "user2", "user3"]}
            isBookmarked={false}
            onPress={() => console.log('상세 페이지로 이동')}
            onBookmarkPress={() => console.log('북마크 토글')}
        />
        <SortToggle
            onSortChange={(sort) => console.log(`정렬 기준 변경: ${sort}`)}
            defaultSort="latest"
        />
        <TourDesignButton onPress={() => console.log('여행 디자인 페이지로 이동')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        fontWeight: '500',
    },
});