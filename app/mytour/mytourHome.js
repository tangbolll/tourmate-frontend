import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Text
} from 'react-native';
import Constants from 'expo-constants';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';
import { fetchMyTours } from '../../utils/MyTourApi';
import { currentUserId } from '../../constants/testUserId';

export default function MyTourHome() {
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

useEffect(() => {
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
    // 로딩/에러 화면을 위한 스타일 추가
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
