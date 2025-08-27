import React, { useState, useEffect, useCallback } from 'react'; 
import {
    View,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Text
} from 'react-native';
import { useRouter } from 'expo-router';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';
import TourDesignButton from '../../components/mytour/mytourHome/TourDesignButton';
import { fetchMyTours, toggleTourFavorite } from '../../utils/MyTourApi'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';



export default function MyTourHome() {
    const router = useRouter();
    const { currentUserId } = useAuth();
    
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadMyTours = useCallback(async () => {
        // isLoading은 처음 로드할 때만 true로 설정합니다.
        if (!tours.length) setIsLoading(true);
        setError(null);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const data = await fetchMyTours(userId);
            setTours(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [tours.length]); // tours.length를 의존성에 추가

    useEffect(() => {
        loadMyTours();
    }, []); // 처음 한 번만 호출되도록 수정

    const handleToursDeleted = () => {
        console.log('MyTourHome: 삭제 완료, 데이터 새로고침');
        loadMyTours();
    };

    // ✅ Step 1: 즐겨찾기 토글 로직을 '낙관적 업데이트' 방식으로 변경합니다.
    const handleBookmarkToggle = async (tourId) => {
        // 1. UI를 되돌리기 위해 현재 상태를 저장해 둡니다.
        const originalTours = tours;

        // 2. API 성공을 가정하고 화면(state)을 즉시 업데이트합니다.
        const newTours = tours.map(tour => {
            if (tour.id === tourId) {
                // isFavorite 상태를 반전시킨 새로운 객체를 반환합니다.
                return { ...tour, isFavorite: !tour.isFavorite };
            }
            return tour;
        });
        setTours(newTours); // UI 즉시 변경!

        // 3. 백그라운드에서 실제 API를 호출합니다.
        try {
            await toggleTourFavorite(tourId, currentUserId);
            // API 호출 성공! UI는 이미 바뀌었으므로 아무것도 할 필요가 없습니다.
            console.log(`[성공] 즐겨찾기 상태 변경 완료 (tourId: ${tourId})`);

        } catch (error) {
            // 4. API 호출 실패! 화면을 원래 상태로 되돌리고 에러 메시지를 보여줍니다.
            console.error('[실패] 즐겨찾기 토글 에러, UI를 원래대로 되돌립니다:', error);
            setTours(originalTours); // UI 원상 복구
            Alert.alert("오류", "즐겨찾기 상태 변경에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleTourPress = (tourId) => {
        console.log('투어 상세 페이지로 이동:', tourId);
        router.push({
            pathname: '/mytour/designItinerary',
            params: { tourId: tourId }
        });
    };

    

    const bookmarkedEvents = tours.filter(tour => tour.isFavorite);

    const handleBookmarkedEventUpdate = (eventId) => {
            const updatedTours = tours.map(tour =>
                tour.id === eventId
                    ? { ...tour, isFavorite: false }
                    : tour
            );
            setTours(updatedTours);
        };

    const handleTourDesignPress = () => {
        console.log('여행 디자인 페이지로 이동');
        router.push('/mytour/tourDesign');
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* 즐겨찾기 섹션 */}
            <BookmarkedTab
                bookmarkedEvents={bookmarkedEvents}
                onBookmarkUpdate={handleBookmarkToggle} 
                onTourPress={handleTourPress}
            />
            
            {/* 나의 여행 탭 */}
            <View style={styles.myTourSection}>
                <MyTourTab
                    mytours={tours}
                    onBookmarkUpdate={handleBookmarkToggle}
                    onToursDeleted={handleToursDeleted} 
                    onTourPress={handleTourPress}
                />
            </View>

            {/* 플로팅 여행 디자인 버튼 */}
            <View style={styles.floatingButton}>
                <TourDesignButton onPress={handleTourDesignPress} />
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
    floatingButton: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        zIndex: 10
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});