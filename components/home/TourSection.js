import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import TourInfo from './TourInfo';
import TourItinerary from './TourItinerary'; 
import FindTour from './FindTour';
import { getMyToursBriefApi, getCurrentTourStatus } from '../../utils/HomeApi';
import { useAuth } from '../../context/AuthContext';

const TourSection = () => {
    const [tourList, setTourList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUserId, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchTourData = async () => {
            try {
                // AuthContext가 아직 로딩 중이면 대기
                if (authLoading) {
                    console.log('🔄 Auth 컨텍스트 로딩 중...');
                    return;
                }

                if (!currentUserId) {
                    console.log('❌ 사용자 ID 없음');
                    setError('로그인이 필요합니다.');
                    setLoading(false);
                    return;
                }

                setLoading(true);
                setError(null);
                
                console.log('👤 현재 사용자 ID:', currentUserId);
                const data = await getMyToursBriefApi(currentUserId);
                console.log('✅ 여행 데이터 로딩 성공:', data);
                setTourList(data);
            } catch (error) {
                console.error('❌ 여행 데이터 로딩 실패:', error);
                setError('여행 정보를 불러오는데 실패했습니다.');
                setTourList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTourData();
    }, [currentUserId, authLoading]);

    // AuthContext 로딩 중일 때
    if (authLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>진행 중인 여행</Text>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="small" color="#333" />
                    <Text style={styles.loadingText}>사용자 정보 확인 중...</Text>
                </View>
            </View>
        );
    }

    // 사용자 ID가 없는 경우
    if (!currentUserId) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>진행 중인 여행</Text>
                <View style={styles.centerContainer}>
                    <Text style={styles.noTravelText}>로그인이 필요합니다.</Text>
                </View>
            </View>
        );
    }

    // 콘텐츠 렌더링
    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="small" color="#333" />
                    <Text style={styles.loadingText}>여행 정보를 불러오는 중...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            );
        }

        const travelStatus = getCurrentTourStatus(tourList);
        
        switch (travelStatus.status) {
            case 'ongoing':
                return (
                    <View style={styles.ongoingContainer}>
                        <TourInfo 
                            tourData={{
                                ...travelStatus.currentTour,
                                date: travelStatus.currentTour.dateRange,
                                members: travelStatus.currentTour.members || []
                            }} 
                        />
                        <TourItinerary travelId={travelStatus.currentTour.travelId} />
                    </View>
                );
            
            case 'upcoming':
                return (
                    <View>
                        <View style={styles.upcomingNotice}>
                            <Text style={styles.upcomingText}>
                                여행 <Text style={styles.boldText}>{travelStatus.daysLeft}일 전</Text>이에요. 
                                여행 시작 전에 미리 일정 확인해보세요!
                            </Text>
                        </View>
                        <TourInfo 
                            tourData={{
                                ...travelStatus.currentTour,
                                date: travelStatus.currentTour.dateRange,
                                members: travelStatus.currentTour.members || []
                            }} 
                        />
                    </View>
                );
            
            case 'none':
            default:
                return (
                    <View>
                        <Text style={styles.noTravelText}>현재 진행 중인 여행이 없어요.</Text>
                        <FindTour />
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>진행 중인 여행</Text>
            {renderContent()}
        </View>
    );
};

// 스타일은 동일...
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingTop: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    ongoingContainer: {
        marginTop: -8,
    },
    upcomingNotice: {
        paddingHorizontal: 20,
    },
    upcomingText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#333',
    },
    noTravelText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'flex-start',
        paddingHorizontal: 20,
    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#ff6b6b',
        textAlign: 'center',
    },
});

export default TourSection;