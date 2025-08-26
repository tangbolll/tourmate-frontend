import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TourInfo from './TourInfo';
import TourItinerary from './TourItinerary'; 
import FindTour from './FindTour';

const TourSection = () => {
    // 예시 여행 데이터
    const tourData = {
        title: '싸우지말자 런던여행',
        date: '2025.3.1 ~ 3.4',
        members: [
            {
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            },
            {
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            },
        ],
    };

    // 여행 상태를 판단하는 함수들
    const getTravelStatus = () => {
        // 테스트용 - 실제로는 여행 시작/종료 날짜를 파싱해서 비교
        const today = new Date();
        const travelStartDate = new Date('2025-08-19'); // 여행 시작일
        const travelEndDate = new Date('2025-08-20'); // 여행 종료일
        
        const timeDiff = travelStartDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (today >= travelStartDate && today <= travelEndDate) {
            return { status: 'ongoing', daysLeft: 0 };
        } else if (daysDiff > 0 && daysDiff <= 3) {
            return { status: 'upcoming', daysLeft: daysDiff };
        } else {
            return { status: 'none', daysLeft: 0 };
        }
    };

    const renderContent = () => {
        const travelStatus = getTravelStatus();
        
        switch (travelStatus.status) {
            case 'ongoing':
                return (
                    <View style={styles.ongoingContainer}>
                        <TourInfo tourData={tourData} />
                        <TourItinerary />
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
                        <TourInfo tourData={tourData} />
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
        marginTop: -8, // 제목과 TourInfo 사이의 간격을 줄임
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
});

export default TourSection;