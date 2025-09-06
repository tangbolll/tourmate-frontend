import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTourScheduleDetailApi } from '../../utils/HomeTourApi';

const TourItinerary = ({ travelId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    

    // 여행 일정 데이터 가져오기
    useEffect(() => {
        const fetchItinerary = async () => {
            if (!travelId) return;

            try {
                setLoading(true);
                setError(null);
                console.log('📅 여행 일정 로딩 시작, travelId:', travelId);
                
                const data = await getTourScheduleDetailApi(travelId);
                console.log('✅ 여행 일정 로딩 성공:', data);
                
                // API에서 이미 변환된 데이터를 그대로 사용
                setSchedule(data);
            } catch (error) {
                console.error('❌ 여행 일정 로딩 실패:', error);
                setError('일정을 불러오는데 실패했습니다.');
                // 에러 시 빈 배열로 설정
                setSchedule([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItinerary();
    }, [travelId]);

    // 백엔드 일정 데이터를 프론트엔드 형식으로 변환
    const transformItineraryData = (backendData) => {
        if (!backendData || !Array.isArray(backendData)) {
            console.warn('⚠️ 일정 데이터가 올바르지 않습니다:', backendData);
            return []; // 빈 배열 반환
        }

        return backendData.map((item, index) => {
            // time_slot 파싱 (예: "09:00-11:00" 또는 "09:00")
            let startHour = 0;
            let endHour = 0;
            let timeDisplay = '시간 미정';
            
            if (item.timeSlot) {
                if (item.timeSlot.includes('-')) {
                    const [startTime, endTime] = item.timeSlot.split('-');
                    startHour = parseInt(startTime.split(':')[0]) || 0;
                    endHour = parseInt(endTime.split(':')[0]) || 0;
                    timeDisplay = `${startTime} - ${endTime}`;
                } else {
                    // 단일 시간인 경우 (예: "09:00")
                    startHour = parseInt(item.timeSlot.split(':')[0]) || 0;
                    endHour = startHour + 1; // 1시간 기본 설정
                    timeDisplay = `${item.timeSlot} - ${(startHour + 1).toString().padStart(2, '0')}:00`;
                }
            }

            // 카테고리 매핑 (정확한 4개 태그만)
            const categoryMap = {
                '숙소': '숙소',
                '식사': '식사', 
                '관광': '관광',
                '휴식': '휴식'
            };
            
            const category = categoryMap[item.tag] || '기타';
            
            return {
                id: item.id || index + 1,
                title: item.title || item.attributeTitle || '일정 없음',
                time: timeDisplay,
                category: category,
                startHour: startHour,
                endHour: endHour,
                location: item.location,
                memo: item.memo,
                tip: item.tip,
                latitude: item.latitude,
                longitude: item.longitude,
                stayDuration: item.stayDuration,
                date: item.date,
                tag: item.tag
            };
        });
    };
    // 1. 오늘 날짜 확인 함수 추가
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 2. 지난 일정 확인 함수 추가
    const isPastSchedule = (endHour) => {
        const currentHour = getCurrentHour();
        return currentHour >= endHour;
    };

    // 3. 채도 낮춘 색상 정의
    const categoryColors = {
        '숙소': '#FFD965',
        '식사': '#FF9E6D',
        '관광': '#A3C8E9',
        '휴식': '#C6D6C3',
        '기타': '#E0E0E0'
    };

    // 지난 일정용 채도 낮춘 색상
    const pastCategoryColors = {
        '숙소': '#F0E9B8',
        '식사': '#F0C5A8',
        '관광': '#D1DCE8',
        '휴식': '#DDE6DB',
        '기타': '#EEEEEE'
    };

    // 현재 시간 체크
    const getCurrentHour = () => {
        return new Date().getHours();
    };

    const isCurrentSchedule = (startHour, endHour) => {
        const currentHour = getCurrentHour();
        return currentHour >= startHour && currentHour < endHour;
    };

    // 오늘 날짜 필터링 추가
    const getDisplayedSchedule = () => {
    const todayString = getTodayDateString();
    
    // 오늘 날짜의 일정만 필터링
    const todaySchedule = schedule.filter(item => {
        // item.date가 "YYYY-MM-DD" 형식이라고 가정
        return item.date === todayString;
    });
    
    // 시간순으로 정렬 (startHour 기준 오름차순)
    const sortedSchedule = todaySchedule.sort((a, b) => {
        // startHour가 같으면 endHour로 비교
        if (a.startHour === b.startHour) {
            return a.endHour - b.endHour;
        }
        return a.startHour - b.startHour;
    });
    
    return isExpanded ? sortedSchedule : sortedSchedule.slice(0, 4);
    };

    const getDayOfWeek = () => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[new Date().getDay()];
    };

    const getFormattedDate = () => {
        const date = new Date();
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };


    const renderScheduleItem = (item) => {
        const isActive = isCurrentSchedule(item.startHour, item.endHour);
        const isPast = isPastSchedule(item.endHour);
        
        // 지난 일정이면 채도 낮춘 색상 사용
        const colorPalette = isPast ? pastCategoryColors : categoryColors;
        const categoryColor = colorPalette[item.category] || colorPalette['기타'];
        
        return (
            <View 
                key={item.id} 
                style={[
                    styles.scheduleItem,
                    isActive && { backgroundColor: categoryColor + '20' }
                ]}
            >
                <View 
                    style={[
                        styles.categoryBar, 
                        { backgroundColor: categoryColor }
                    ]} 
                />
                <View style={styles.scheduleContent}>
                    <Text style={[
                        styles.scheduleTitle,
                        isPast && { color: '#999' } // 지난 일정은 회색 글자
                    ]}>
                        {item.title}
                    </Text>
                    <Text style={[
                        styles.scheduleTime,
                        isPast && { color: '#999' } // 지난 일정은 회색 글자
                    ]}>
                        {item.time}
                    </Text>
                </View>
            </View>
        );
    };

    // 로딩 중일 때
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    <Text style={styles.dayText}>{getDayOfWeek()}</Text>
                    <Text style={styles.dateText}>{getFormattedDate()}</Text>
                </View>
                
                <View style={styles.rightSection}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#666" />
                        <Text style={styles.loadingText}>일정 로딩 중...</Text>
                    </View>
                </View>
            </View>
        );
    }

    // 에러가 있거나 일정이 없을 때
    if (error || schedule.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    <Text style={styles.dayText}>{getDayOfWeek()}</Text>
                    <Text style={styles.dateText}>{getFormattedDate()}</Text>
                </View>
                
                <View style={styles.rightSection}>
                    <View style={styles.noScheduleContainer}>
                        <Text style={styles.noScheduleText}>
                            {error || '등록된 일정이 없습니다.'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <Text style={styles.dayText}>{getDayOfWeek()}</Text>
                <Text style={styles.dateText}>{getFormattedDate()}</Text>
            </View>
            
            <View style={styles.rightSection}>
                <View style={styles.scheduleContainer}>
                    {getDisplayedSchedule().map(renderScheduleItem)}
                </View>
                
                {schedule.filter(item => item.date === getTodayDateString()).length > 4 && (
                    <TouchableOpacity 
                        style={styles.expandButton}
                        onPress={() => setIsExpanded(!isExpanded)}
                    >
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: '#fff',
    },
    leftSection: {
        width: 56,
        marginLeft: 8,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingTop: 8,
    },
    dayText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    rightSection: {
        flex: 1,
        marginLeft: 8,
    },
    scheduleContainer: {
        flex: 1,
    },
    scheduleItem: {
        flexDirection: 'row',
        borderRadius: 8,
        padding: 4,
        backgroundColor: '#fff',
    },
    categoryBar: {
        width: 4,
        borderRadius: 2,
        marginRight: 12,
    },
    scheduleContent: {
        flex: 1,
    },
    scheduleTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    scheduleTime: {
        fontSize: 10,
        color: '#666',
    },
    expandButton: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingVertical: 4,
        marginRight: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    noScheduleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    noScheduleText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});

export default TourItinerary;