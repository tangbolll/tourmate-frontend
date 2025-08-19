import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    Text
} from 'react-native';
import { useRouter } from 'expo-router';
import MyTourHeader from './MyTourHeader';
import MyTourFeed from './MyTourFeed';
import { toggleTourFavorite } from '../../../utils/MyTourApi'; 
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

export default function MyTourTab({ mytours = [], onBookmarkUpdate }) {
    const router = useRouter();
    const [sortType, setSortType] = useState('latest');
    const [tours, setTours] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        travelPeriod: '',
        travelLocation: '',
    });

    // 부모로부터 받은 mytours prop이 변경될 때마다 내부 tours state를 업데이트합니다.
    useEffect(() => {
        setTours(Array.isArray(mytours) ? mytours : []);
    }, [mytours]);

    const filteredAndSortedTours = useMemo(() => {
        let filteredTours = Array.isArray(tours) ? [...tours] : [];

        // 즐겨찾기 먼저
        filteredTours.sort((a, b) => {
            // if (a.isFavorite && !b.isFavorite) return -1;
            // if (!a.isFavorite && b.isFavorite) return 1;

            // 날짜 기준 정렬
            if (sortType === 'latest') {
                return dayjs(b.endDate).diff(dayjs(a.endDate));
            } else if (sortType === 'oldest') {
                return dayjs(a.startDate).diff(dayjs(b.startDate));
            }
            return 0;
        });

        return filteredTours;
    }, [tours, sortType]);

    const handleSortChange = (newSortType) => setSortType(newSortType);
    const handleFilterPress = () => console.log('필터 버튼 클릭');
    const handleFilterApply = (appliedFilters) => setActiveFilters(appliedFilters);
    const handleTourPress = (tourId) => console.log('투어 상세 페이지로 이동:', tourId);
    
    const handleBookmarkPress = async (tourId) => {
        try {
            const userId = 1; // 로그인 유저 ID
            await toggleTourFavorite(tourId, userId);
            
            // 부모 컴포넌트(MyTourHome)로 상태 전달
            if (onBookmarkUpdate) {
                onBookmarkUpdate(tourId);
            }
        } catch (error) {
            console.error('Bookmark update error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <MyTourHeader
                onSortChange={handleSortChange}
                onFilterPress={handleFilterPress}
                onFilterApply={handleFilterApply}
            />

            <View style={styles.scrollableSection}>
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.feedContainer}>
                        {/* 데이터가 없을 경우 메시지를 표시합니다. */}
                        {filteredAndSortedTours.length === 0 ? (
                            <Text style={styles.noDataText}>여행 목록이 없습니다.</Text>
                        ) : (
                            <View style={styles.gridContainer}>
                                {filteredAndSortedTours.map((tour) => {
                                    let locationString = '지역 정보 없음'; // 기본값

                                    const area = tour.areaName?.[0];            // 예: "광주"
                                    const sigungus = tour.sigunguName || [];    // 예: ["광산구", "남구"]

                                    if (sigungus.length > 0) {
                                        const firstSigungu = sigungus[0];
                                        if (sigungus.length > 1) {
                                            // 1. 지역이 여러 개일 경우 -> "광주 광산구 외 1개 지역"
                                            locationString = `${area} ${firstSigungu} 외 ${sigungus.length - 1}개 지역`;
                                        } else {
                                            // 2. 지역이 한 개일 경우 -> "광주 광산구"
                                            locationString = `${area} ${firstSigungu}`;
                                        }
                                    } else if (area) {
                                        // 3. 시/군/구 없이 시/도만 있을 경우 -> "광주"
                                        locationString = area;
                                    }

                                    return (
                                        <View key={tour.id} style={styles.feedItem}>
                                            <MyTourFeed
                                                imageUrl={tour.imageUrl || null}
                                                tourStartDate={tour.startDate}
                                                tourEndDate={tour.endDate}
                                                title={tour.title}
                                                location={locationString} // 최종 완성된 문자열 전달
                                                members={tour.members || []}
                                                isBookmarked={tour.isFavorite}
                                                onPress={() => handleTourPress(tour.id)}
                                                onBookmarkPress={() => handleBookmarkPress(tour.id)}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollableSection: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 16, // 좌우 마진
        paddingTop: 10, // 상단 여백
        paddingBottom: 160, // 하단 여백
    },
    feedContainer: {
        flex: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    feedItem: {
        width: (width - 48) / 2, // 전체 너비에서 좌우 패딩(32) + 아이템 간 간격(16)을 뺀 후 2로 나눔
    },
    noDataText: {
        flex: 1,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
    },
});