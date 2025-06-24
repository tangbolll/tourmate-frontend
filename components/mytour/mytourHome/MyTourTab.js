import React, { useState, useMemo } from 'react';
import { 
    View, 
    ScrollView, 
    StyleSheet, 
    Dimensions 
} from 'react-native';
import MyTourHeader from './MyTourHeader';
import MyTourFeed from './MyTourFeed';
import TourDesignButton from './TourDesignButton';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

export default function MyTourTab({ mytours = [], onBookmarkUpdate }) {
    const [sortType, setSortType] = useState('latest');
    const [tours, setTours] = useState(mytours);
    const [activeFilters, setActiveFilters] = useState({
        travelPeriod: '',
        travelLocation: '',
    });

    // mytours prop이 변경되면 로컬 state 업데이트
    React.useEffect(() => {
        setTours(mytours);
    }, [mytours]);

    // 필터링 및 정렬된 투어 데이터
    const filteredAndSortedTours = useMemo(() => {
        let filteredTours = [...tours];
        
        // 필터링 적용
        if (activeFilters.travelLocation) {
            filteredTours = filteredTours.filter(tour => 
                tour.location.toLowerCase().includes(activeFilters.travelLocation.toLowerCase())
            );
        }
        
        if (activeFilters.travelPeriod) {
            // 선택된 기간과 투어 기간이 겹치는지 확인
            const [startDateStr, endDateStr] = activeFilters.travelPeriod.split(' ~ ');
            const filterStartDate = dayjs(startDateStr, 'YYYY.MM.DD');
            const filterEndDate = dayjs(endDateStr, 'YYYY.MM.DD');
            
            filteredTours = filteredTours.filter(tour => {
                const tourStartDate = dayjs(tour.tourStartDate);
                const tourEndDate = dayjs(tour.tourEndDate);
                
                // 기간이 겹치는지 확인
                return (
                    (tourStartDate.isSameOrBefore(filterEndDate) && tourEndDate.isSameOrAfter(filterStartDate))
                );
            });
        }
        
        // 정렬 적용
        if (sortType === 'latest') {
            // 최신 여행순 (종료일 기준 내림차순)
            return filteredTours.sort((a, b) => 
                new Date(b.tourEndDate) - new Date(a.tourEndDate)
            );
        } else if (sortType === 'oldest') {
            // 지난 여행순 (시작일 기준 오름차순)
            return filteredTours.sort((a, b) => 
                new Date(a.tourStartDate) - new Date(b.tourStartDate)
            );
        }
        
        return filteredTours;
    }, [tours, sortType, activeFilters]);

    // 정렬 변경 핸들러
    const handleSortChange = (newSortType) => {
        setSortType(newSortType);
        console.log('정렬 방식 변경:', newSortType);
    };

    // 필터 버튼 핸들러
    const handleFilterPress = () => {
        console.log('필터 버튼 클릭');
    };

    // 필터 적용 핸들러
    const handleFilterApply = (appliedFilters) => {
        setActiveFilters(appliedFilters);
        console.log('필터 적용됨:', appliedFilters);
    };

    // 투어 카드 클릭 핸들러
    const handleTourPress = (tourId) => {
        console.log('투어 상세 페이지로 이동:', tourId);
        // 투어 상세 페이지로 네비게이션
    };

    // 북마크 토글 핸들러
    const handleBookmarkToggle = (tourId) => {
        const updatedTours = tours.map(tour => 
            tour.id === tourId 
                ? { ...tour, isBookmarked: !tour.isBookmarked }
                : tour
        );
        setTours(updatedTours);
        
        // 상위 컴포넌트에 업데이트된 데이터 전달
        if (onBookmarkUpdate) {
            onBookmarkUpdate(updatedTours);
        }
        
        console.log('북마크 토글:', tourId);
    };

    // 여행 디자인 버튼 핸들러
    const handleTourDesignPress = () => {
        console.log('여행 디자인 페이지로 이동');
    };

    return (
        <View style={styles.container}>
            {/* 헤더 고정 */}
            <MyTourHeader 
                onSortChange={handleSortChange}
                onFilterPress={handleFilterPress}
                onFilterApply={handleFilterApply}
            />
            
            {/* 스크롤 가능한 컨텐츠 영역 */}
            <View style={styles.scrollableSection}>
                <ScrollView 
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.feedContainer}>
                        {filteredAndSortedTours.map((tour) => (
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
                
                {/* 플로팅 여행 디자인 버튼 */}
                <View style={styles.floatingButtonContainer}>
                    <TourDesignButton onPress={handleTourDesignPress} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // 배경색 통일
    },
    scrollableSection: {
        flex: 1,
        position: 'relative',
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 80, 
    },
    feedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#fff',
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1,
    },
});