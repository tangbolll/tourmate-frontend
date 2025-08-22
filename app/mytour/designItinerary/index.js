import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DesignItineraryHeader from '../../../components/mytour/designItinerary/designItineraryHeader';
import DateSelectButtons from '../../../components/mytour/designItinerary/DateSelectButtons';
import BottomSheet from '../../../components/mytour/designItinerary/BottomSheet';
import AiItineraryDesignPopup from '../../../components/mytour/designItinerary/AiItineraryDesignPopup';
import MemberPopup from '../../../components/mytour/designItinerary/MemberPopup';
import ItineraryWithSchedule from '../../../components/mytour/designItinerary/ItineraryWithSchedule';
import Schedule from '../../../components/mytour/designItinerary/schedule/Schedule';
import AddSchedule from '../../../components/mytour/designItinerary/AddSchedule/AddSchedule';
import { createTour, updateTour, getTourDetails } from '../../../utils/MyTourApi';
import { currentUserId } from '../../../constants/testUserId';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export default function DesignItinerary() {
    const { selectedRegions, itineraryTitle, periodData, tourId } = useLocalSearchParams();
    const router = useRouter();

    const [title, setTitle] = useState(itineraryTitle || '');
    const [regions, setRegions] = useState(selectedRegions ? JSON.parse(selectedRegions) : []);
    const [period, setPeriod] = useState(periodData ? JSON.parse(periodData) : {});
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

    const debouncedSelectedAttractions = useDebounce(selectedAttractions, 1000);
    const debouncedScheduleData = useDebounce(scheduleData, 1000);

    useEffect(() => {
        const fetchTourData = async () => {
            if (tourId) {
                setLoading(true);
                try {
                    console.log(`기존 여행 데이터 불러오는 중... tourId: ${tourId}`);
                    const data = await getTourDetails(tourId);
                    if (data) {
                        setTitle(data.title);
                        setRegions(data.regions);
                        setPeriod({
                            type: data.periodType, // ✅ periodType으로 수정
                            startDate: data.startDate,
                            endDate: data.endDate,
                            nights: data.nights,
                            days: data.days
                        });
                        setSelectedAttractions(data.attractions || []);
                        setScheduleData(data.schedule || {});
                        setMembers(data.members || []);
                        console.log("여행 데이터 불러오기 성공:", data);
                    }
                } catch (error) {
                    console.error("여행 데이터 불러오기 실패:", error);
                    Alert.alert("에러", "여행 정보를 불러오는데 실패했습니다.");
                } finally {
                    setLoading(false);
                }
            } else {
                setTitle(itineraryTitle || '');
                setRegions(selectedRegions ? JSON.parse(selectedRegions) : []);
                setPeriod(periodData ? JSON.parse(periodData) : {});
                setLoading(false);
                console.log("새로운 여행 생성 페이지로 시작");
            }
        };

        fetchTourData();
    }, [tourId, selectedRegions, itineraryTitle, periodData]);

    const handleConfirmItinerary = async () => {
        try {
            if (!tourId) {
                const tourData = {
                    title: title,
                    startDate: period.startDate,
                    endDate: period.endDate,
                    nights: period.nights,
                    days: period.days,
                    regions: regions.map(r => r.key),
                    attractions: selectedAttractions.map(a => a.id),
                    schedule: scheduleData,
                    members: members,
                    userId: currentUserId
                };
                console.log("새 여행 생성 요청 데이터:", tourData);
                const newTour = await createTour(tourData);
                setTourId(newTour.id);
                Alert.alert("성공", "새로운 여행 일정이 생성되었습니다.");
            } else {
                const tourData = {
                    title: title,
                    startDate: period.startDate,
                    endDate: period.endDate,
                    nights: period.nights,
                    days: period.days,
                    periodType: period.type,
                    regions: regions.map(r => r.key),
                    attractions: selectedAttractions.map(a => a.id),
                    schedule: scheduleData,
                    members: members,
                    userId: currentUserId
                };
                console.log("여행 수정 요청 데이터 (확인 버튼):", tourData);
                await updateTour(tourId, tourData);
                Alert.alert("성공", "여행 일정이 저장되었습니다.");
            }
            setShowActionButtons(false);
        } catch (error) {
            console.error("일정 저장 실패:", error);
            Alert.alert("에러", "일정 저장에 실패했습니다.");
        }
    };
    
    useEffect(() => {
        const updateServer = async () => {
            if (tourId) {
                try {
                    const tourData = {
                        title: title,
                        startDate: period.startDate,
                        endDate: period.endDate,
                        nights: period.nights,
                        days: period.days,
                        periodType: period.type,
                        regions: regions.map(r => r.key),
                        attractions: debouncedSelectedAttractions.map(a => a.id),
                        schedule: debouncedScheduleData,
                        members: members,
                        userId: currentUserId
                    };
                    console.log("여행 수정 요청 (debounced):", tourData);
                    await updateTour(tourId, tourData);
                } catch (error) {
                    console.error("자동 저장 실패:", error);
                }
            }
        };
        updateServer();
    }, [debouncedSelectedAttractions, debouncedScheduleData, tourId]);

    const formatDateRange = () => {
        if (period.type === 'date' && period.startDate && period.endDate) {
            return {
                startDate: period.startDate,
                endDate: period.endDate,
                displayText: `${period.startDate} - ${period.endDate}`
            };
        } else if (period.type === 'duration' && period.nights && period.days) {
            return {
                displayText: `${period.nights}박 ${period.days}일`
            };
        }
        return { displayText: '' };
    };

    const handleBackPress = () => {
        router.push('/mytour');
    };

    const handleDaySelect = (dayNumber) => {
        setSelectedDay(dayNumber);
        setIsGridMode(false);
    };

    const handleGridToggle = (gridMode) => {
        setIsGridMode(gridMode);
        if (gridMode) {
            setSelectedDay(null);
        }
    };

    const handleAttractionToggle = (attraction) => {
        setSelectedAttractions(prev => {
            const isSelected = prev.some(item => item.id === attraction.id);
            if (isSelected) {
                return prev.filter(item => item.id !== attraction.id);
            } else {
                return [...prev, attraction];
            }
        });
    };

    const handleAiItineraryPress = () => {
        setShowAiPopup(true);
    };

    const handleAiPopupConfirm = (result) => {
        setShowActionButtons(true);
    };

    const handleMemberPress = () => {
        setShowMemberPopup(true);
    };

    const handleCloseMemberPopup = () => {
        setShowMemberPopup(false);
    };

    const handleMemberDelete = (memberToDelete) => {
        setMembers(prev => prev.filter(member => member.id !== memberToDelete.id));
    };

    const handleMemberAdd = (newMember) => {
        setMembers(prev => [...prev, newMember]);
    };

    const handleAddSchedule = (selectedDay, selectedDate = null, selectedHour = null) => {
        setSchedulePopupData({
            selectedDay: selectedDay,
            selectedDate: selectedDate,
            selectedHour: selectedHour,
            existingSchedule: null
        });
        setShowAddSchedulePopup(true);
    };

    const handleTimeBlockClick = (blockData) => {
        setSchedulePopupData({
            selectedDay: blockData.day || null,
            selectedDate: blockData.date || null,
            selectedHour: blockData.hour || null,
            existingSchedule: blockData.existingSchedule || null
        });
        setShowAddSchedulePopup(true);
    };

    const handleCloseAddSchedulePopup = () => {
        setShowAddSchedulePopup(false);
        setSchedulePopupData(null);
    };

    const handleScheduleAdded = (newScheduleData) => {
        setScheduleData(prev => {
            const dayKey = `day${schedulePopupData?.selectedDay || newScheduleData.day || 1}`;
            const existingSchedules = prev[dayKey] || [];
            
            const scheduleWithId = {
                ...newScheduleData,
                id: newScheduleData.id || Date.now().toString(),
                day: schedulePopupData?.selectedDay || newScheduleData.day || 1
            };
            
            const updatedSchedules = [...existingSchedules, scheduleWithId];
            
            return {
                ...prev,
                [dayKey]: updatedSchedules
            };
        });
        handleCloseAddSchedulePopup();
    };

    const handleScheduleDelete = (scheduleId, day) => {
        setScheduleData(prev => {
            const dayKey = `day${day}`;
            const existingSchedules = prev[dayKey] || [];
            const updatedSchedules = existingSchedules.filter(schedule => schedule.id !== scheduleId);
            return {
                ...prev,
                [dayKey]: updatedSchedules
            };
        });
    };

    const dateInfo = formatDateRange();

    const renderMainContent = () => {
        if (selectedDay) {
            const daySchedules = scheduleData[`day${selectedDay}`] || [];
            return (
                <Schedule 
                    selectedDay={selectedDay}
                    schedules={daySchedules}
                    onAddSchedule={(day) => handleAddSchedule(day)}
                    onScheduleDelete={handleScheduleDelete}
                />
            );
        } else if (isGridMode) {
            return (
                <ItineraryWithSchedule 
                    periodType={period.type}
                    startDate={period.startDate}
                    endDate={period.endDate}
                    nights={period.nights}
                    days={period.days}
                    scheduleData={scheduleData}
                    onAddSchedule={handleAddSchedule}
                    onScheduleDelete={handleScheduleDelete}
                    onTimeBlockClick={handleTimeBlockClick}
                    showAddButtons={true}
                />
            );
        } else {
            return (
                <ItineraryWithSchedule 
                    periodType={period.type}
                    startDate={period.startDate}
                    endDate={period.endDate}
                    nights={period.nights}
                    days={period.days}
                    scheduleData={scheduleData}
                    onScheduleDelete={handleScheduleDelete}
                    onTimeBlockClick={handleTimeBlockClick}
                    showAddButtons={false}
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
                startDate={dateInfo.startDate}
                endDate={dateInfo.endDate}
                periodType={period.type}
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
            
            {renderMainContent()}

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
                onConfirm={() => {handleAiPopupConfirm(); setShowAiPopup(false)}}
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
                    selectedDay={schedulePopupData.selectedDay}
                    selectedDate={schedulePopupData.selectedDate}
                    selectedHour={schedulePopupData.selectedHour}
                    existingSchedule={schedulePopupData.existingSchedule}
                    onClose={handleCloseAddSchedulePopup}
                    onScheduleAdded={handleScheduleAdded}
                    onScheduleDelete={handleScheduleDelete}
                    periodType={period.type}
                    startDate={period.startDate}
                    endDate={period.endDate}
                    nights={period.nights}
                    days={period.days}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    content: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    dateBasedContent: {
        flex: 1,
        padding: 16,
    },
    durationBasedContent: {
        flex: 1,
        padding: 16,
    },
});