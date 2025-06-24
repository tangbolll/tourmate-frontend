import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';

// 목 데이터 - 모든 여행 데이터
const mockMyTours = [
    {
        id: 'tour1',
        tourStartDate: '2024-06-30',
        tourEndDate: '2024-07-02',
        title: '오스트레일리아 말고 오스트리아 여행',
        location: '오스트리아, 빈',
        members: ['김철수', '이영희', '박민수'],
        isBookmarked: false
    },
    {
        id: 'tour2',
        tourStartDate: '2024-05-30',
        tourEndDate: '2024-05-31',
        title: '해봄은 나들이 갈 수 밖에',
        location: '해봄동',
        members: ['just_A79'],
        isBookmarked: true
    },
    {
        id: 'tour3',
        tourStartDate: '2024-04-30',
        tourEndDate: '2024-04-30',
        title: '런던 해리 포터 투어',
        location: '런던, 영국',
        members: ['Hogwart2'],
        isBookmarked: false
    },
    {
        id: 'tour4',
        tourStartDate: '2024-01-12',
        tourEndDate: '2024-01-15',
        title: '겨울 알프스 스키 여행',
        location: '스위스, 알프스',
        members: ['최스키', '김보드'],
        isBookmarked: true
    },
    {
        id: 'tour5',
        tourStartDate: '2024-03-20',
        tourEndDate: '2024-03-25',
        title: '도쿄 벚꽃 축제',
        location: '도쿄, 일본',
        members: ['사쿠라좋아', '벚꽃마니아', '일본여행러버'],
        isBookmarked: false
    },
    {
        id: 'tour6',
        tourStartDate: '2024-08-01',
        tourEndDate: '2024-08-07',
        title: '태국 방콕 맛집 투어',
        location: '방콕, 태국',
        members: ['맛집헌터', '태국러버'],
        isBookmarked: true
    },
    {
        id: 'tour7',
        tourStartDate: '2024-09-10',
        tourEndDate: '2024-09-12',
        title: '서울 도심 핫플레이스 탐방',
        location: '서울, 한국',
        members: ['서울러'],
        isBookmarked: true
    }
];

export default function MyTourHome({
    mytours = mockMyTours
}) {
    const [tours, setTours] = useState(mytours);
    
    // 북마크된 여행들만 필터링
    const bookmarkedEvents = tours.filter(tour => tour.isBookmarked);

    // 북마크 상태 업데이트 핸들러
    const handleBookmarkUpdate = (updatedTours) => {
        setTours(updatedTours);
    };

    // 즐겨찾기 탭에서 북마크 해제 핸들러
    const handleBookmarkedEventUpdate = (eventId) => {
        const updatedTours = tours.map(tour => 
            tour.id === eventId 
                ? { ...tour, isBookmarked: false }
                : tour
        );
        setTours(updatedTours);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 즐겨찾기 섹션 - 고정 */}
            <BookmarkedTab 
                bookmarkedEvents={bookmarkedEvents} 
                onBookmarkUpdate={handleBookmarkedEventUpdate}
            />
            
            {/* 나의 여행 탭 - 스크롤 가능한 영역 */}
            <View style={styles.myTourSection}>
                <MyTourTab
                    mytours={tours}
                    onBookmarkUpdate={handleBookmarkUpdate}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', 
    },
    myTourSection: {
        flex: 1,
    },
});