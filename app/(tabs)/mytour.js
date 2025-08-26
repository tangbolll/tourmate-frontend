import React, { useState, useEffect } from 'react'; 
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
import { fetchMyTours } from '../../utils/MyTourApi';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function MyTourHome() {
    const router = useRouter();
    
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMyTours = async () => {
            const userId = await AsyncStorage.getItem('userId');
            
            try {
                const data = await fetchMyTours(userId);
                setTours(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadMyTours();
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