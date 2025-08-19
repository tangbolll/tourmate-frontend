import React, { useState, useEffect } from 'react'; 
import {
    View,
    StyleSheet,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Text
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';
import TourDesignButton from '../../components/mytour/mytourHome/TourDesignButton';

// API 기본 URL을 가져오는 헬퍼 함수
const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};

export default function MyTourHome() {
    const router = useRouter();
    
    // ❗️ 1. tours state의 초기값을 빈 배열로 설정합니다.
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ❗️ 2. API 데이터 호출을 위한 useEffect를 추가합니다.
    useEffect(() => {
        const fetchMyTours = async () => {
            const userId = 1;
            const url = `${getBaseURL()}/api/myTour/list?userId=${userId}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                const errorText = await response.text();
                throw new Error('데이터를 불러오는 데 실패했습니다.');
                }
                const data = await response.json();

                console.log("✅ 서버 응답:", data);

                // 배열 보장
                setTours(Array.isArray(data) ? data : [data]);
            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
            };
        fetchMyTours();
    }, []);

    const bookmarkedEvents = tours.filter(tour => tour.isFavorite);

    const handleBookmarkUpdate = (tourId) => {
        setTours(prevTours =>
            prevTours.map(tour =>
                tour.id === tourId ? { ...tour, isFavorite: !tour.isFavorite } : tour
            )
        );
};

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

    // ❗️ 3. 로딩 및 에러 상태에 따른 화면을 먼저 처리합니다.
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
                onBookmarkUpdate={handleBookmarkUpdate} 
            />
            
            {/* 나의 여행 탭 */}
            <View style={styles.myTourSection}>
                <MyTourTab
                    mytours={tours}
                    onBookmarkUpdate={handleBookmarkUpdate}
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