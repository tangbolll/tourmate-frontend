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

    const handleBookmarkToggle = async (tourId) => {
        try {
            // 1. API를 호출하여 서버 상태를 변경하고, 최종 즐겨찾기 상태(boolean)를 받습니다.
            const newIsFavorite = await toggleTourFavorite(tourId, currentUserId);

            // 2. 반환된 최종 상태를 사용하여 UI를 직접, 그리고 최종적으로 업데이트합니다.
            setTours(prevTours =>
                prevTours.map(tour =>
                    tour.id === tourId ? { ...tour, isFavorite: newIsFavorite } : tour
                )
            );
            console.log(`[성공] 즐겨찾기 상태 최종 반영 (tourId: ${tourId}, isFavorite: ${newIsFavorite})`);

        } catch (error) {
            // API 호출 자체에 실패한 경우
            console.error('[실패] 즐겨찾기 토글 API 호출 에러:', error);
            Alert.alert("오류", "즐겨찾기 상태 변경에 실패했습니다. 네트워크 상태를 확인해주세요.");
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