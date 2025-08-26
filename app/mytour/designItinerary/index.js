import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import dayjs from 'dayjs';

// 컴포넌트 Imports
import DesignItineraryHeader from '../../../components/mytour/designItinerary/designItineraryHeader';
import DateSelectButtons from '../../../components/mytour/designItinerary/DateSelectButtons';
import BottomSheet from '../../../components/mytour/designItinerary/BottomSheet';
import AiItineraryDesignPopup from '../../../components/mytour/designItinerary/AiItineraryDesignPopup';
import MemberPopup from '../../../components/mytour/designItinerary/MemberPopup';
import ItineraryWithSchedule from '../../../components/mytour/designItinerary/ItineraryWithSchedule';
import Schedule from '../../../components/mytour/designItinerary/schedule/Schedule';
import AddSchedule from '../../../components/mytour/designItinerary/AddSchedule/AddSchedule';
 import { scheduleUtils } from '../../../utils/scheduleUtils';

// API Imports
import { 
    createTour, 
    updateTour, 
    getTourDetails,
    createTravelSchedule,
    updateTravelSchedule,
    deleteTravelSchedule,
    deleteTravelSchedules,
    getSchedulesByDate,
} from '../../../utils/MyTourApi';
import { useAuth } from '../../../context/AuthContext';

// 디바운스 기능을 위한 커스텀 훅
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function DesignItinerary() {
    const { selectedRegions, itineraryTitle, periodData, tourId } = useLocalSearchParams();
    const router = useRouter();
    const { currentUserId } = useAuth();

    // 상태 관리
    const [title, setTitle] = useState('');
    const [regions, setRegions] = useState([]);
    const [period, setPeriod] = useState({});
    const [selectedAttractions, setSelectedAttractions] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [isGridMode, setIsGridMode] = useState(false);
    const [showAddSchedulePopup, setShowAddSchedulePopup] = useState(false);
    const [schedulePopupData, setSchedulePopupData] = useState(null);
    const [showAiPopup, setShowAiPopup] = useState(false);
    const [showMemberPopup, setShowMemberPopup] = useState(false);
    const [scheduleData, setScheduleData] = useState({});
    const [showActionButtons, setShowActionButtons] = useState(false);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [currentTourId, setCurrentTourId] = useState(tourId);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    // 디바운스된 값들 (자동 저장용 모두 복구)
    const debouncedSelectedAttractions = useDebounce(selectedAttractions, 2000);
    const debouncedScheduleData = useDebounce(scheduleData, 2000);
    const debouncedTitle = useDebounce(title, 1000);

    // 여행 데이터 로딩 및 일정 데이터 day-key 기준 변환
    const fetchTourData = useCallback(async () => {
        if (!currentTourId) {
            setTitle(itineraryTitle || '');
            setRegions(selectedRegions ? JSON.parse(selectedRegions) : []);
            setPeriod(periodData ? JSON.parse(periodData) : {});
            setLoading(false);
            setIsDataLoaded(true);
            return;
        }
        setLoading(true);
        try {
            const data = await getTourDetails(currentTourId);
            if (!data) throw new Error("여행 정보를 불러올 수 없습니다.");

            const mappedScheduleData = {};
            if (data.schedules && Array.isArray(data.schedules) && data.startDate) {
                const tripStartDate = dayjs(data.startDate);
                data.schedules.forEach(schedule => {
                    if (schedule && schedule.date) {
                        const scheduleDate = dayjs(schedule.date);
                        const dayNumber = scheduleDate.diff(tripStartDate, 'day') + 1;
                        if (dayNumber > 0) {
                            const dayKey = `day${dayNumber}`;
                            if (!mappedScheduleData[dayKey]) mappedScheduleData[dayKey] = [];
                            const style = scheduleUtils.getCategoryStyle(schedule.tag);
                            const scheduleWithColor = {
                                ...schedule,
                                categoryColor: style.borderColor
                            };
                            mappedScheduleData[dayKey].push(scheduleWithColor);
                        }
                    }
                });
            }

            // 지역 영역 가공
            const periodTypeMap = { 1: 'date', 2: 'duration' };
            setTitle(data.title || '');
            setRegions(data.regions?.map(r => ({
                key: r.areaCode || r.key,
                name: r.areaName || r.name,
                sigungu: r.sigungu?.map(s =>
                    ({ key: s.code || s.key, name: s.name })
                ) || []
            })) || []);
            setPeriod({
                type: periodTypeMap[data.periodType] || 'date',
                startDate: data.startDate,
                endDate: data.endDate,
                nights: data.nightCount,
                days: data.dayCount
            });
            setSelectedAttractions(data.attractions || []);
            setScheduleData(mappedScheduleData);
            setMembers(data.participants || []);
            setIsDataLoaded(true);
        } catch (error) {
            console.error("여행 데이터 불러오기 실패:", error);
            Alert.alert("에러", "여행 정보를 불러오는데 실패했습니다.", [{ text: "확인", onPress: () => router.push('/mytour') }]);
        } finally {
            setLoading(false);
        }
    }, [currentTourId, itineraryTitle, periodData, selectedRegions]);

    useEffect(() => {
        fetchTourData();
    }, [fetchTourData]);

    // 자동 저장
    useEffect(() => {
        if (!isDataLoaded || !currentTourId) return;

        const updateServer = async () => {
            try {
                if (!title.trim() ||
                    (period.type === 'date' && (!period.startDate || !period.endDate)) ||
                    (period.type === 'duration' && (!period.nights || !period.days))
                ) {
                    console.log("필수 데이터 누락으로 자동 저장 건너뜀");
                    return;
                }
                // regions 계층 구조 변환
                const mappedRegions = regions.map(r => ({
                    areaCode: r.key,
                    areaName: r.name,
                    sigungu: r.sigungu.map(s => ({ key: s.key, name: s.name }))
                }));

                const tourData = {
                    title: debouncedTitle || title,
                    regions: mappedRegions,
                    periodType: period.type === 'date' ? 1 : 2,
                    startDate: period.type === 'date' ? period.startDate : null,
                    endDate: period.type === 'date' ? period.endDate : null,
                    nightCount: period.type === 'duration' ? period.nights : null,
                    dayCount: period.type === 'duration' ? period.days : null,
                    attractions: debouncedSelectedAttractions.map(a => a.id || a),
                    schedule: debouncedScheduleData,
                    members: members,
                    ownerId: currentUserId
                };
                await updateTour(currentTourId, tourData);
                console.log("✅ 자동 저장 완료");
            } catch (error) {
                console.error("자동 저장 실패:", error);
            }
        };
        updateServer();
    }, [debouncedTitle, debouncedSelectedAttractions, debouncedScheduleData, members, currentTourId, isDataLoaded]);

    // 여행 확정/저장 버튼
    const handleConfirmItinerary = async () => {
        try {
            if (!title.trim()) return Alert.alert("알림", "여행 제목을 입력해주세요.");
            if (period.type === 'date' && (!period.startDate || !period.endDate)) return Alert.alert("알림", "여행 날짜를 설정해주세요.");
            if (period.type === 'duration' && (!period.nights || !period.days)) return Alert.alert("알림", "여행 기간을 설정해주세요.");

            setScheduleLoading(true);

            const mappedRegions = regions.map(r => ({
                areaCode: r.key,
                areaName: r.name,
                sigungu: r.sigungu.map(s => ({ key: s.key, name: s.name }))
            }));

            const tourData = {
                title: title,
                regions: mappedRegions,
                periodType: period.type === 'date' ? 1 : 2,
                startDate: period.type === 'date' ? period.startDate : null,
                endDate: period.type === 'date' ? period.endDate : null,
                nightCount: period.type === 'duration' ? period.nights : null,
                dayCount: period.type === 'duration' ? period.days : null,
                attractions: selectedAttractions.map(a => a.id || a),
                schedule: scheduleData,
                members: members,
                ownerId: currentUserId
            };

            if (!currentTourId) {
                const newTour = await createTour(tourData);
                setCurrentTourId(newTour.id);
                Alert.alert("성공", "새로운 여행 일정이 생성되었습니다.");
            } else {
                await updateTour(currentTourId, tourData);
                Alert.alert("성공", "여행 일정이 저장되었습니다.");
            }

            setShowActionButtons(false);

        } catch (error) {
            console.error("일정 저장 실패:", error);
            Alert.alert("에러", "일정 저장에 실패했습니다.");
        } finally {
            setScheduleLoading(false);
        }
    };

    // 일정 추가/수정 핸들러
    const handleScheduleAdded = async (newScheduleData) => {
        setScheduleLoading(true);
        try {
            if (!currentTourId) {
                Alert.alert("알림", "먼저 여행을 저장한 후 일정을 추가할 수 있습니다.");
                return;
            }
            const payload = {
                travelId: currentTourId,
                date: newScheduleData.date,
                timeSlot: `${newScheduleData.startTime} ~ ${newScheduleData.endTime}`,
                title: newScheduleData.title,
                tag: newScheduleData.category || 'CUSTOM',
                location: newScheduleData.location,
                latitude: newScheduleData.latitude || 0,
                longitude: newScheduleData.longitude || 0,
                memo: newScheduleData.memo || ''
            };

            if (schedulePopupData?.existingSchedule?.id) {
                await updateTravelSchedule(schedulePopupData.existingSchedule.id, payload);
            } else {
                await createTravelSchedule(payload);
            }
            await fetchTourData();
        } catch (error) {
            Alert.alert('오류', '일정 저장에 실패했습니다.');
        } finally {
            setScheduleLoading(false);
            handleCloseAddSchedulePopup();
        }
    };

    // 일정 삭제 핸들러 - 팝업창에서
    const handleScheduleDelete = (scheduleId) => {
        Alert.alert("일정 삭제", "이 일정을 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "삭제",
                onPress: async () => {
                    setScheduleLoading(true);
                    try {
                        await deleteTravelSchedule(scheduleId);
                        await fetchTourData();
                    } catch (error) {
                        Alert.alert('오류', '일정 삭제에 실패했습니다.');
                    } finally {
                        setScheduleLoading(false);
                        handleCloseAddSchedulePopup();
                    }
                },
                style: "destructive"
            }
        ]);
    };

    // 그 외 핸들링
    const handleBackPress = () => router.push('/mytour');
    const handleDaySelect = (dayNumber) => {
        setSelectedDay(dayNumber);
        setIsGridMode(false);
    };
    const handleGridToggle = (gridMode) => {
        setIsGridMode(gridMode);
        if (gridMode) setSelectedDay(null);
    };
    const handleAttractionToggle = (attraction) => {
        setSelectedAttractions(prev => {
            const isSelected = prev.some(item => (item.id || item) === (attraction.id || attraction));
            return isSelected
                ? prev.filter(item => (item.id || item) !== (attraction.id || attraction))
                : [...prev, attraction];
        });
    };
    const handleAiItineraryPress = () => setShowAiPopup(true);
    const handleAiPopupConfirm = () => {
        setShowAiPopup(false);
        setShowActionButtons(true);
    };
    const handleMemberPress = () => setShowMemberPopup(true);
    const handleCloseMemberPopup = () => setShowMemberPopup(false);
    const handleMemberDelete = (memberToDelete) => {
        setMembers(prev => prev.filter(member => member.id !== memberToDelete.id));
    };
    const handleMemberAdd = (newMember) => setMembers(prev => [...prev, newMember]);
    const handleAddSchedule = (day, date, hour) => {
        if (!currentTourId) {
            return Alert.alert("알림", "먼저 여행을 저장한 후 일정을 추가할 수 있습니다.");
        }
        const dateForDay = date || (period.startDate ? dayjs(period.startDate).add(day - 1, 'day').format('YYYY-MM-DD') : null);
        setSchedulePopupData({ selectedDay: day, selectedDate: dateForDay, selectedHour: hour, existingSchedule: null });
        setShowAddSchedulePopup(true);
    };
    const handleTimeBlockClick = (blockData) => {
        setSchedulePopupData(blockData);
        setShowAddSchedulePopup(true);
    };
    const handleCloseAddSchedulePopup = () => {
        setShowAddSchedulePopup(false);
        setSchedulePopupData(null);
    };

    const formatDateRange = () => {
        if (period.type === 'date' && period.startDate && period.endDate) {
            return { startDate: period.startDate, endDate: period.endDate, displayText: `${period.startDate} - ${period.endDate}` };
        } else if (period.type === 'duration' && period.nights && period.days) {
            return { displayText: `${period.nights}박 ${period.days}일` };
        }
        return { displayText: '' };
    };
    const dateInfo = formatDateRange();

    const renderMainContent = () => {
        if (selectedDay) {
            const daySchedules = scheduleData[`day${selectedDay}`] || [];
            return (
                <Schedule
                    schedules={daySchedules}
                    onAddSchedule={() => handleAddSchedule(selectedDay)}
                    onScheduleDelete={handleScheduleDelete}
                    onUpdateSchedule={schedule => handleTimeBlockClick({ existingSchedule: schedule, day: selectedDay })}
                    selectedDay={selectedDay}
                    loading={scheduleLoading}
                />
            );
        } else {
            return (
                <ItineraryWithSchedule
                    periodType={period.type}
                    startDate={period.startDate}
                    endDate={period.endDate}
                    days={period.days}
                    scheduleData={scheduleData}
                    onAddSchedule={handleAddSchedule}
                    onTimeBlockClick={handleTimeBlockClick}
                    onScheduleDelete={handleScheduleDelete}
                    showAddButtons={isGridMode}
                    loading={scheduleLoading}
                />
            );
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>여행 정보를 불러오는 중입니다...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <DesignItineraryHeader
                title={title}
                dateRange={dateInfo.displayText}
                onBackPress={handleBackPress}
                onMemberPress={handleMemberPress}
            />

            <DateSelectButtons
                periodType={period.type}
                startDate={period.startDate}
                endDate={period.endDate}
                nights={period.nights}
                days={period.days}
                onDaySelect={handleDaySelect}
                onGridToggle={handleGridToggle}
            />

            <View style={styles.content}>
                {renderMainContent()}
            </View>

            <BottomSheet
                regions={regions}
                onAttractionToggle={handleAttractionToggle}
                selectedAttractions={selectedAttractions}
                onAiItineraryPress={handleAiItineraryPress}
                showActionButtons={showActionButtons}
                onConfirmItinerary={handleConfirmItinerary}
                onGoBack={() => setShowActionButtons(false)}
            />

            <AiItineraryDesignPopup
                visible={showAiPopup}
                onClose={() => setShowAiPopup(false)}
                onConfirm={handleAiPopupConfirm}
                periodType={period.type}
                startDate={period.startDate}
                endDate={period.endDate}
                nights={period.nights}
                days={period.days}
            />

            {showMemberPopup && (
                <MemberPopup
                    members={members}
                    onClose={handleCloseMemberPopup}
                    onMemberDelete={handleMemberDelete}
                    onMemberAdd={handleMemberAdd}
                />
            )}

            {showAddSchedulePopup && schedulePopupData && (
                <AddSchedule
                    visible={showAddSchedulePopup}
                    {...schedulePopupData}
                    onClose={handleCloseAddSchedulePopup}
                    onScheduleAdded={handleScheduleAdded}
                    onScheduleDelete={handleScheduleDelete}
                    currentTourId={currentTourId}
                    periodType={period.type}
                    startDate={period.startDate}
                    endDate={period.endDate}
                />
            )}

            {(scheduleLoading || loading) && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingTextWhite}>처리 중...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    loadingTextWhite: {
        marginTop: 10,
        fontSize: 16,
        color: '#fff',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});
