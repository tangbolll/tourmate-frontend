import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    Text,
    TouchableOpacity,
    Alert
} from 'react-native';
//import { useRouter } from 'expo-router';
import MyTourHeader from './MyTourHeader';
import MyTourFeed from './MyTourFeed';
import { toggleTourFavorite, deleteMyTours } from '../../../utils/MyTourApi';
import dayjs from 'dayjs';
import { useAuth } from '../../../context/AuthContext';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';     // isSameOrAfter 플러그인 불러오기
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';   // isSameOrBefore 플러그인도 필요합니다.

dayjs.extend(isSameOrAfter);     // dayjs에 isSameOrAfter 플러그인 기능 추가
dayjs.extend(isSameOrBefore);    // dayjs에 isSameOrBefore 플러그인 기능 추가


const { width } = Dimensions.get('window');


export default function MyTourTab({ mytours = [], onBookmarkUpdate, onToursDeleted, onTourPress }) {
    const { currentUserId } = useAuth();
    //const router = useRouter();
    const [sortType, setSortType] = useState('latest');
    const [activeFilters, setActiveFilters] = useState({
        travelPeriod: '',
        travelLocation: '',
    });
    const isFilterActive = !!(activeFilters.travelPeriod || activeFilters.travelLocation);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedTours, setSelectedTours] = useState([]);

    const filteredAndSortedTours = useMemo(() => {
        let filteredTours = Array.isArray(mytours) ? [...mytours] : [];

        if (activeFilters.travelPeriod && typeof activeFilters.travelPeriod === 'string') {
            try {
                // --- 👇 여기가 최종 수정된 날짜 파싱 로직입니다 ---
                const currentYear = dayjs().year();
                const parts = activeFilters.travelPeriod.split(' ~ ');
                
                // "8월 5일(화)" -> "8-5" -> "2025-8-5" 와 같이 dayjs가 확실히 이해하는 형태로 변환
                const startDateStr = `${currentYear}-${parts[0].replace(/\(.\)/, '').replace('월 ', '-').replace('일', '').trim()}`;
                const endDateStr = `${currentYear}-${parts[1].replace(/\(.\)/, '').replace('월 ', '-').replace('일', '').trim()}`;
                
                // 이제 dayjs가 확실히 이해하는 형식으로 객체를 생성합니다.
                const filterStart = dayjs(startDateStr);
                const filterEnd = dayjs(endDateStr);
                // --- 파싱 로직 수정 끝 ---

                // 파싱이 성공했는지 최종 확인
                if (filterStart.isValid() && filterEnd.isValid()) {
                    filteredTours = filteredTours.filter(tour => {
                        if (!tour.startDate || !tour.endDate) return false;

                        const tourStart = dayjs(tour.startDate);
                        const tourEnd = dayjs(tour.endDate);

                        // 올바른 비교 로직
                        const isOverlapping = 
                            tourEnd.isSameOrAfter(filterStart, 'day') && 
                            tourStart.isSameOrBefore(filterEnd, 'day');
                        
                        return isOverlapping;
                    });
                }
            } catch (error) {
                console.error("날짜 파싱 또는 필터링 중 오류 발생:", error);
            }
        }

        // 2. 지역 필터링 (기존 로직과 동일)
        if (activeFilters.travelLocation) {
            const searchTerm = activeFilters.travelLocation; // 사용자가 입력한 검색어

            filteredTours = filteredTours.filter(tour => 
                // tour.regions 배열에 아래 조건을 만족하는 region이 하나라도 있는지(.some) 확인합니다.
                tour.regions?.some(region => 
                    // 조건 1: areaName(광역시/도 이름)에 검색어가 포함되거나
                    (region.areaName && region.areaName.includes(searchTerm)) || 
                    
                    // 조건 2: sigungu(시/군/구 이름) 배열에 검색어가 포함된 항목이 하나라도 있는지(.some) 확인
                    (region.sigungu?.some(sgg => sgg.name && sgg.name.includes(searchTerm)))
                )
            );
        }
        // --- 필터링 로직 끝 ---
        console.log(`3️⃣ 필터링 후 남은 여행 개수: ${filteredTours.length}개`);


        // 정렬 로직은 그대로 둡니다.
        filteredTours.sort((a, b) => {
            if (sortType === 'latest') {
                return dayjs(b.endDate).diff(dayjs(a.endDate));
            } else if (sortType === 'oldest') {
                return dayjs(a.startDate).diff(dayjs(b.startDate));
            }
            return 0;
        });

        return filteredTours;

    // 의존성 배열은 activeFilters 그대로 유지
    }, [mytours, sortType, activeFilters]);

    const handleSortChange = (newSortType) => setSortType(newSortType);
    const handleFilterPress = () => console.log('필터 버튼 클릭');
    const handleFilterApply = (appliedFilters) => {
        console.log('1️⃣ 필터에서 받은 데이터:', JSON.stringify(appliedFilters, null, 2));
        setActiveFilters(appliedFilters);
    };
    
    // ✅ 피드 클릭 핸들러 수정: 일정 수정 페이지로 이동
    const handleTourPress = (tourId) => {
        if (!isEditMode) {
            console.log('투어 상세 페이지로 이동:', tourId);
            router.push({
                pathname: '/mytour/designItinerary',
                params: { tourId: tourId }
            });
        }
    };
    
    const handleBookmarkPress = async (tourId) => {
        try {
            await toggleTourFavorite(tourId, currentUserId);
            
            if (onBookmarkUpdate) {
                onBookmarkUpdate(tourId);
            }
        } catch (error) {
            console.error('Bookmark update error:', error);
        }
    };

    const handleTourSelection = (tourId) => {
        setSelectedTours(prevSelected => {
            if (prevSelected.includes(tourId)) {
                return prevSelected.filter(id => id !== tourId);
            } else {
                return [...prevSelected, tourId];
            }
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedTours.length > 0) {
            Alert.alert(
                "여행 삭제",
                `선택된 여행 ${selectedTours.length}개를 삭제하시겠습니까?`,
                [
                    {
                        text: "취소",
                        style: "cancel"
                    },
                    { 
                        text: "삭제", 
                        onPress: async () => {
                            try {
                                // 1. 서버에 삭제 요청
                                await deleteMyTours(selectedTours);
                                
                                // 2. 로컬 상태 초기화
                                setSelectedTours([]);
                                setIsEditMode(false);

                                Alert.alert("삭제 완료", "선택한 여행이 성공적으로 삭제되었습니다.");

                                // 3. 삭제 성공 후, 부모 컴포넌트의 새로고침 함수 호출!
                                if (onToursDeleted) {
                                    console.log('[MyTourTab] 삭제 API 성공. 부모에게 새로고침을 요청합니다.');
                                    onToursDeleted(); // 인자 없이 함수만 호출
                                }
                            } catch (error) {
                                console.error('여행 삭제 에러:', error);
                                Alert.alert("삭제 실패", "여행 삭제 중 오류가 발생했습니다.");
                            }
                        },
                        style: "destructive"
                    }
                ]
            );
        }
    };
    
    const handleEditButtonPress = () => {
        if (isEditMode) {
            setIsEditMode(false);
            setSelectedTours([]);
        } else {
            setIsEditMode(true);
        }
    };

    return (
    <View style={styles.container}>
        <MyTourHeader
            onSortChange={handleSortChange}
            onFilterPress={handleFilterPress}
            onFilterApply={handleFilterApply}
            isFilterActive={isFilterActive} 
        />

        <View style={styles.summaryContainer}>
            <Text style={styles.tourCountText}>여행 {mytours.length}</Text>
            <View style={styles.editButtonsContainer}>
                {isEditMode && (
                    <TouchableOpacity 
                        onPress={handleDeleteSelected}
                        disabled={selectedTours.length === 0}
                    >
                        <Text style={[styles.deleteButtonText, selectedTours.length === 0 && styles.disabledText]}>
                            삭제
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleEditButtonPress}>
                    <Text style={styles.editButtonText}>{isEditMode ? '취소' : '편집'}</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.scrollableSection}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.feedContainer}>
                    {filteredAndSortedTours.length === 0 ? (
                        <Text style={styles.noDataText}>여행 목록이 없습니다.</Text>
                    ) : (
                        <View style={styles.gridContainer}>
                            {filteredAndSortedTours.map((tour) => {
                                let locationString = '지역 정보 없음';

                                if (tour.regions && tour.regions.length > 0) {
                                    const firstRegion = tour.regions[0];
                                    const areaName = firstRegion.areaName || '지역 정보 없음';
                                    const sigungus = firstRegion.sigungu || [];

                                    const firstSigungu = sigungus[0]?.name || '';

                                    const totalRegions = tour.regions.reduce((sum, region) => sum + (region.sigungu?.length || 0), 0);
                                    const otherCount = totalRegions - 1; // 첫 지역 첫 시군 제외

                                    if (firstSigungu) {
                                        locationString = otherCount > 0
                                            ? `${areaName} ${firstSigungu} 외 ${otherCount}개 지역`
                                            : `${areaName} ${firstSigungu}`;
                                    } else {
                                        locationString = areaName;
                                    }
                                }

                                return (
                                    <View key={tour.id} style={styles.feedItem}>
                                        <MyTourFeed
                                            imageUrl={tour.imageUrl || null}
                                            periodType = {tour.periodType}
                                            tourStartDate={tour.startDate}
                                            tourEndDate={tour.endDate}
                                            dayCount={tour.dayCount}
                                            nightCount={tour.nightCount}
                                            title={tour.title}
                                            location={locationString}
                                            members={tour.participants || []}
                                            isBookmarked={tour.isFavorite}
                                            onPress={() => {
                                                if (!isEditMode && onTourPress) {
                                                    onTourPress(tour.id);
                                                }
                                            }}
                                            onBookmarkPress={() => handleBookmarkPress(tour.id)}
                                            isEditMode={isEditMode}
                                            isSelected={selectedTours.includes(tour.id)}
                                            onSelect={() => handleTourSelection(tour.id)}
                                            onDeletePress={() => onToursDeleted(tour.id)}
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
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    tourCountText: {
        fontSize: 14,
        color: '#666',
    },
    editButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: 'bold',
        marginRight: 15,
    },
    disabledText: {
        color: '#ccc',
    },
    editButtonText: {
        fontSize: 14,
        color: '#007BFF',
        fontWeight: 'bold',
    },
    scrollableSection: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 160,
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
        width: (width - 48) / 2,
    },
    noDataText: {
        flex: 1,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
    },
});