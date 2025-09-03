import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Text,
    Alert // Alert 추가
} from 'react-native';
import { useRouter } from 'expo-router';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';
import TourDesignButton from '../../components/mytour/mytourHome/TourDesignButton';
import { fetchMyTours, toggleTourFavorite } from '../../utils/MyTourApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function MyTourHome() {
    const router = useRouter();
    const { currentUserId } = useAuth();

    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadMyTours = useCallback(async () => {
        setIsLoading(true); // 로딩 상태를 무조건 true로 설정
        setError(null);
        try {
            const userId = await AsyncStorage.getItem('userId');
            console.log('데이터 로드 시작 - userId:', userId);

            const data = await fetchMyTours(userId);
            console.log('서버에서 받은 데이터:', JSON.stringify(data, null, 2));

            // 각 투어의 즐겨찾기 상태 로깅
            data.forEach(tour => {
                console.log(`투어 ${tour.id}: favorite = ${tour.favorite}`);
            });

            setTours(data);
        } catch (e) {
            setError(e.message);
            Alert.alert("오류", "여행 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []); // 의존성 배열에서 `tours.length` 제거하여 불필요한 재실행 방지

    useFocusEffect(
        useCallback(() => {
            loadMyTours();
        }, [loadMyTours]) // loadMyTours 함수가 변경될 때마다 재실행
    );

    // useEffect는 이제 필요 없으므로 제거
    // useFocusEffect가 화면 진입 시마다 호출되므로, 한 번만 호출되는 useEffect는 중복

    const handleToursDeleted = () => {
        console.log('MyTourHome: 삭제 완료, 데이터 새로고침');
        loadMyTours();
    };

    const handleBookmarkToggle = async (tourId) => {
        console.log('1단계: MyTourHome의 즐겨찾기 버튼 클릭됨!');

        const prevFavoriteState = tours.find(tour => tour.id === tourId)?.favorite;
        
        try {
            // 1. 낙관적 UI 업데이트 (즉시 UI 변경)
            setTours(prevTours =>
                prevTours.map(tour =>
                    tour.id === tourId ? { ...tour, favorite: !prevFavoriteState } : tour
                )
            );
            console.log('2단계: UI 즉시 업데이트 완료');

            // 2. API 호출
            const newIsFavorite = await toggleTourFavorite(tourId, currentUserId);
            console.log(`3단계: API 호출 완료, 서버 응답 (tourId: ${tourId}):`, newIsFavorite);

            // 3. 서버 응답과 다르면 다시 수정
            setTours(prevTours =>
                prevTours.map(tour =>
                    tour.id === tourId ? { ...tour, favorite: newIsFavorite } : tour
                )
            );
            console.log(`4단계: 최종 상태 반영 (tourId: ${tourId}, favorite: ${newIsFavorite})`);

        } catch (error) {
            console.error('5단계: 에러 발생, 원상 복구');
            // 에러 시 원상 복구
            setTours(prevTours =>
                prevTours.map(tour =>
                    tour.id === tourId ? { ...tour, favorite: prevFavoriteState } : tour
                )
            );
            Alert.alert("오류", "즐겨찾기 상태 변경에 실패했습니다.");
        }
    };

    const handleTourPress = (tourId) => {
        console.log('투어 상세 페이지로 이동:', tourId);
        router.push({
            pathname: '/mytour/designItinerary',
            params: { tourId: tourId }
        });
    };

    const bookmarkedEvents = tours.filter(tour => tour.favorite);

    const handleTourDesignPress = () => {
        console.log('여행 디자인 페이지로 이동');
        router.push('/mytour/tourDesign');
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
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
        bottom: 0,
        right: 20,
        zIndex: 10
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});