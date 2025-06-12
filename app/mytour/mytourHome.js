import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import TourDesignButton from '../../components/mytour/mytourHome/TourDesignButton';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';
import CreateItineraryButton from '../../components/mytour/createItinerary/CreateItineraryButton';

const mockTours = [{
        id: 1,
        imageUrl: null,
        tourStartDate: '2024-03-15',
        tourEndDate: '2024-03-17',
        title: '제주도 3박 4일 힐링 여행',
        location: '제주도',
        members: ['김철수', '이영희', '박민수'],
        isBookmarked: true,
    },
    {
        id: 2,
        imageUrl: null,
        tourStartDate: '2024-02-20',
        tourEndDate: '2024-02-20',
        title: '경복궁 한복 체험 당일치기',
        location: '서울 종로구',
        members: ['홍길동'],
        isBookmarked: false,
    },
    {
        id: 3,
        imageUrl: null,
        tourStartDate: '2024-01-10',
        tourEndDate: '2024-01-12',
        title: '부산 해운대 맛집 투어',
        location: '부산 해운대구',
        members: ['최수진', '김민지'],
        isBookmarked: true,
    },
    {
        id: 4,
        imageUrl: null,
        tourStartDate: '2023-12-25',
        tourEndDate: '2023-12-26',
        title: '강릉 크리스마스 여행',
        location: '강원도 강릉시',
        members: ['이민호', '박지은', '김태현', '최유리'],
        isBookmarked: false,
    },
    {
        id: 5,
        imageUrl: null,
        tourStartDate: '2023-11-15',
        tourEndDate: '2023-11-18',
        title: '전주 한옥마을 전통 문화 체험',
        location: '전라북도 전주시',
        members: ['서준혁'],
        isBookmarked: true,
    },
    {
        id: 6,
        imageUrl: null,
        tourStartDate: '2023-10-05',
        tourEndDate: '2023-10-07',
        title: '단풍 구경 내장산 국립공원',
        location: '전라북도 정읍시',
        members: ['윤서연', '장민석'],
        isBookmarked: false,
    }
]

export default function MyTripsScreen() {
    return (
        <View style={styles.container}>
        <BookmarkedTab
            bookmarkedEvents={[
                {
                    id: '1',
                    imageUrl: null,
                    tourStartDate: '2023-06-01',
                    tourEndDate: '2023-06-05',
                    title: '파리 여행',
                    location: '프랑스, 파리',
                    isBookmarked: true,
                },
                {
                    id: '2',
                    imageUrl: null,
                    tourStartDate: '2023-07-10',
                    tourEndDate: '2023-07-15',
                    title: '도쿄 여행',
                    location: '일본, 도쿄',
                    isBookmarked: true,
                },
            ]}
        />
        <MyTourTab mytours={mockTours}>
        </MyTourTab>
        <TourDesignButton onPress={() => console.log('여행 디자인 페이지로 이동')} />
        <CreateItineraryButton
            isActive={false}
            onPress={() => console.log('여행 일정 생성 페이지로 이동')} />
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