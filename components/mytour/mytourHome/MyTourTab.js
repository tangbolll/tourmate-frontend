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
import { useRouter } from 'expo-router';
import MyTourHeader from './MyTourHeader';
import MyTourFeed from './MyTourFeed';
import { toggleTourFavorite, deleteMyTours } from '../../../utils/MyTourApi';
import dayjs from 'dayjs';
import { currentUserId } from '../../../constants/testUserId';

const { width } = Dimensions.get('window');

export default function MyTourTab({ mytours = [], onBookmarkUpdate }) {
    const router = useRouter();
    const [sortType, setSortType] = useState('latest');
    const [tours, setTours] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        travelPeriod: '',
        travelLocation: '',
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedTours, setSelectedTours] = useState([]);

    useEffect(() => {
        setTours(Array.isArray(mytours) ? mytours : []);
    }, [mytours]);

    const filteredAndSortedTours = useMemo(() => {
        let filteredTours = Array.isArray(tours) ? [...tours] : [];

        filteredTours.sort((a, b) => {
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
                        onPress: () => console.log("삭제 취소"),
                        style: "cancel"
                    },
                    { 
                        text: "삭제", 
                        onPress: async () => {
                            try {
                                await deleteMyTours(selectedTours);
                                
                                setTours(prevTours => prevTours.filter(tour => !selectedTours.includes(tour.id)));
                                setSelectedTours([]);
                                setIsEditMode(false);
                                
                                Alert.alert("삭제 완료", "선택한 여행이 성공적으로 삭제되었습니다.");
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
        />

        <View style={styles.summaryContainer}>
            <Text style={styles.tourCountText}>여행 {tours.length}</Text>
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
                                            tourStartDate={tour.startDate}
                                            tourEndDate={tour.endDate}
                                            title={tour.title}
                                            location={locationString}
                                            members={tour.participants || []}
                                            isBookmarked={tour.isFavorite}
                                            onPress={() => handleTourPress(tour.id)}
                                            onBookmarkPress={() => handleBookmarkPress(tour.id)}
                                            isEditMode={isEditMode}
                                            isSelected={selectedTours.includes(tour.id)}
                                            onSelect={() => handleTourSelection(tour.id)}
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