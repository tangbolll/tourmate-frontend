import React, { useState, useEffect } from 'react'; // ❗️ useEffect 추가
import {
    View,
    StyleSheet,
    SafeAreaView,
    Platform,
    ActivityIndicator, // ❗️ ActivityIndicator 추가
    Text               // ❗️ Text 추가
} from 'react-native';
import Constants from 'expo-constants';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';

const userId = 1;

const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};

export default function MyTourHome() {
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

useEffect(() => {
    const fetchMyTours = async () => {
        try {
            const url = `${getBaseURL()}/api/myTour/list?userId=${userId}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('데이터 불러오기 실패');
            const data = await response.json();
            console.log('서버 응답:', data, Array.isArray(data));
            setTours(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    fetchMyTours();
}, []);

    const bookmarkedEvents = Array.isArray(tours) ? tours.filter(t => t.isFavorite) : [];

    const handleBookmarkUpdate = (tourId) => {
        setTours(prev =>
            prev.map(t =>
                t.id === tourId ? { ...t, isFavorite: !t.isFavorite } : t
            )
        );
    };




    // --- 로딩 및 에러 처리 UI ---
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
            <BookmarkedTab 
                bookmarkedEvents={bookmarkedEvents} 
                onBookmarkUpdate={handleBookmarkUpdate}
            />
            
            <View style={styles.myTourSection}>
                <MyTourTab
                    mytours={Array.isArray(tours) ? tours : []}
                    onBookmarkUpdate={handleBookmarkUpdate}
                />
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
    // ❗️ 로딩/에러 화면을 위한 스타일 추가
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
