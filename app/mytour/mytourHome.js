import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Text
} from 'react-native';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';
import { fetchMyTours } from '../../utils/MyTourApi';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function MyTourHome() {
    const { currentUserId } = useAuth();
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const loadTours = async () => {
                if (!currentUserId) {
                    // currentUserId가 없으면 로딩을 멈추고 아무것도 하지 않습니다.
                    setIsLoading(false);
                    return;
                }
                setIsLoading(true);
                try {
                    const fetchedTours = await fetchMyTours(currentUserId);
                    setTours(fetchedTours);
                    setError(null);
                } catch (e) {
                    setError('여행 정보를 불러오는 데 실패했습니다.');
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            };

            loadTours();

            return () => {
                // 화면을 벗어날 때 정리(cleanup)할 작업이 있다면 여기에 추가합니다.
                // 예를 들어, 특정 리스너를 해제하는 등의 작업을 할 수 있습니다.
            };
        }, [currentUserId]) // currentUserId가 변경될 때마다 effect를 다시 실행합니다.
    );

    const bookmarkedEvents = Array.isArray(tours) ? tours.filter(t => t.favorite) : [];

    const handleBookmarkUpdate = (tourId) => {
        setTours(prev =>
            prev.map(t =>
                t.id === tourId ? { ...t, favorite: !t.favorite } : t
            )
        );
    };

    const handleToursDeleted = (deletedTourIds) => {
        console.log('[MyTourHome] handleToursDeleted called with:', deletedTourIds);
        setTours(prevTours => {
            const newTours = prevTours.filter(tour => !deletedTourIds.includes(tour.id));
            return newTours;
        });
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
            <BookmarkedTab 
                bookmarkedEvents={bookmarkedEvents} 
                onBookmarkUpdate={handleBookmarkUpdate}
            />
            
            <View style={styles.myTourSection}>
                <MyTourTab
                    mytours={Array.isArray(tours) ? tours : []}
                    onBookmarkUpdate={handleBookmarkUpdate}
                    onToursDeleted={handleToursDeleted} 
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});