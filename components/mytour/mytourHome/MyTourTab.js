import React, { useState, useMemo } from 'react';
import { 
    View, 
    ScrollView, 
    StyleSheet, 
    SafeAreaView,
    Dimensions 
} from 'react-native';
import MyTourHeader from './MyTourHeader';
import MyTourFeed from './MyTourFeed';

const { width } = Dimensions.get('window');

export default function MyTourTab({ mytours = [] }) {
    const [sortType, setSortType] = useState('latest');
    
    const [tours, setTours] = useState(mytours);

    // 정렬된 투어 데이터
    const sortedTours = useMemo(() => {
        const toursCopy = [...tours];
        
        if (sortType === 'latest') {
            // 최신 여행순 (종료일 기준 내림차순)
            return toursCopy.sort((a, b) => 
                new Date(b.tourEndDate) - new Date(a.tourEndDate)
            );
        } else if (sortType === 'oldest') {
            // 지난 여행순 (시작일 기준 오름차순)
            return toursCopy.sort((a, b) => 
                new Date(a.tourStartDate) - new Date(b.tourStartDate)
            );
        }
        
        return toursCopy;
    }, [tours, sortType]);

    // 정렬 변경 핸들러
    const handleSortChange = (newSortType) => {
        setSortType(newSortType);
        console.log('정렬 방식 변경:', newSortType);
    };

    // 필터 버튼 핸들러
    const handleFilterPress = () => {
        console.log('필터 버튼 클릭');
        // 필터 모달이나 페이지 열기 등의 로직 추가
    };

    // 투어 카드 클릭 핸들러
    const handleTourPress = (tourId) => {
        console.log('투어 상세 페이지로 이동:', tourId);
        // 투어 상세 페이지로 네비게이션
    };

    // 북마크 토글 핸들러
    const handleBookmarkToggle = (tourId) => {
        setTours(prevTours => 
            prevTours.map(tour => 
                tour.id === tourId 
                    ? { ...tour, isBookmarked: !tour.isBookmarked }
                    : tour
            )
        );
        console.log('북마크 토글:', tourId);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 고정 */}
            <MyTourHeader 
                onSortChange={handleSortChange}
                onFilterPress={handleFilterPress}
            />
            
            {/* 스크롤 가능한 컨텐츠 영역 */}
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.feedContainer}>
                    {sortedTours.map((tour) => (
                        <MyTourFeed
                            key={tour.id}
                            imageUrl={tour.imageUrl}
                            tourStartDate={tour.tourStartDate}
                            tourEndDate={tour.tourEndDate}
                            title={tour.title}
                            location={tour.location}
                            members={tour.members}
                            isBookmarked={tour.isBookmarked}
                            onPress={() => handleTourPress(tour.id)}
                            onBookmarkPress={() => handleBookmarkToggle(tour.id)}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    feedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
});