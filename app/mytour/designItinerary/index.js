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
import { 
    createTour, 
    updateTour, 
    getTourDetails,
    createTravelSchedule,
    getTravelScheduleDetails,
    updateTravelSchedule,
    deleteTravelSchedule,
    deleteTravelSchedules,
    getSchedulesByDate
} from '../../../utils/MyTourApi';
import { currentUserId } from '../../../constants/testUserId';

// 디바운스 기능을 위한 커스텀 훅
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

    // 디바운스된 값들 (자동 저장용)
    const debouncedSelectedAttractions = useDebounce(selectedAttractions, 2000);
    const debouncedScheduleData = useDebounce(scheduleData, 2000);
    const debouncedTitle = useDebounce(title, 1000);

    // 날짜별 스케줄 로드 함수
    const loadSchedulesByDate = async (travelId, date) => {
        try {
            const schedules = await getSchedulesByDate(travelId, date);
            return schedules;
        } catch (error) {
            console.error(`날짜별 스케줄 로드 실패 (${date}):`, error);
            return [];
        }
    };

    // 스케줄 생성 함수
    const createSchedule = async (scheduleData) => {
        try {
            setScheduleLoading(true);

            const timeSlot = `${scheduleData.startTime} ~ ${scheduleData.endTime}`;
            
            // 서버 엔티티 구조에 맞게 페이로드 수정
            const schedulePayload = {
                travelId: scheduleData.travelId,
                date: scheduleData.date,
                timeSlot: timeSlot,
                title: scheduleData.title,
                tag: scheduleData.category || 'CUSTOM',
                attributeTitle: scheduleData.title,
                location: scheduleData.location,
                latitude: scheduleData.latitude || 0,
                longitude: scheduleData.longitude || 0,
                memo: scheduleData.memo || ''
            };

            console.log('수정된 스케줄 생성 요청:', schedulePayload);
            const newScheduleResponse = await createTravelSchedule(schedulePayload);
            
            // ⭐ 이 부분이 수정되었습니다.
            // 서버 응답 객체에서 순환 참조를 끊고 필요한 데이터만 추출
            const newSchedule = {
                id: newScheduleResponse.id,
                title: newScheduleResponse.title,
                tag: newScheduleResponse.tag,
                timeSlot: newScheduleResponse.timeSlot || '', // timeSlot 유효성 검사 추가
                location: newScheduleResponse.location,
                date: newScheduleResponse.date,
                latitude: newScheduleResponse.latitude,
                longitude: newScheduleResponse.longitude,
                memo: newScheduleResponse.memo,
                attributeTitle: newScheduleResponse.attributeTitle,
                travelId: newScheduleResponse.travelId,
                startTime: scheduleData.startTime,
                endTime: scheduleData.endTime,
            };

            // 로컬 상태 업데이트
            const dayKey = `day${scheduleData.day}`;
            setScheduleData(prev => ({
                ...prev,
                [dayKey]: [...(prev[dayKey] || []), newSchedule]
            }));

            return newSchedule;
        } catch (error) {
            console.error('스케줄 생성 실패:', error);
            Alert.alert('오류', '일정 생성에 실패했습니다.');
            throw error;
        } finally {
            setScheduleLoading(false);
        }
    };

    // 스케줄 업데이트 함수
    const updateSchedule = async (scheduleId, updatedData) => {
        try {
            setScheduleLoading(true);
            
            console.log('스케줄 업데이트 요청:', { scheduleId, updatedData });
            const updatedSchedule = await updateTravelSchedule(scheduleId, updatedData);
            
            // 로컬 상태 업데이트
            setScheduleData(prev => {
                const newData = { ...prev };
                Object.keys(newData).forEach(dayKey => {
                    newData[dayKey] = newData[dayKey].map(schedule => 
                        schedule.id === scheduleId ? { ...schedule, ...updatedSchedule } : schedule
                    );
                });
                return newData;
            });

            return updatedSchedule;
        } catch (error) {
            console.error('스케줄 업데이트 실패:', error);
            Alert.alert('오류', '일정 수정에 실패했습니다.');
            throw error;
        } finally {
            setScheduleLoading(false);
        }
    };

    // 단일 스케줄 삭제 함수
    const deleteSchedule = async (scheduleId, day) => {
        try {
            setScheduleLoading(true);
            
            console.log('스케줄 삭제 요청:', scheduleId);
            await deleteTravelSchedule(scheduleId);
            
            // 로컬 상태에서 제거
            const dayKey = `day${day}`;
            setScheduleData(prev => ({
                ...prev,
                [dayKey]: (prev[dayKey] || []).filter(schedule => schedule.id !== scheduleId)
            }));

            return true;
        } catch (error) {
            console.error('스케줄 삭제 실패:', error);
            Alert.alert('오류', '일정 삭제에 실패했습니다.');
            throw error;
        } finally {
            setScheduleLoading(false);
        }
    };

    // 다중 스케줄 삭제 함수
    const deleteMultipleSchedules = async (scheduleIds) => {
        try {
            setScheduleLoading(true);
            
            console.log('다중 스케줄 삭제 요청:', scheduleIds);
            await deleteTravelSchedules(scheduleIds);
            
            // 로컬 상태에서 제거
            setScheduleData(prev => {
                const newData = { ...prev };
                Object.keys(newData).forEach(dayKey => {
                    newData[dayKey] = newData[dayKey].filter(schedule => 
                        !scheduleIds.includes(schedule.id)
                    );
                });
                return newData;
            });

            return true;
        } catch (error) {
            console.error('다중 스케줄 삭제 실패:', error);
            Alert.alert('오류', '일정 삭제에 실패했습니다.');
            throw error;
        } finally {
            setScheduleLoading(false);
        }
    };

    // 초기 데이터 로드 및 매핑 로직
    useEffect(() => {
        const fetchTourData = async () => {
            if (tourId) {
                // 기존 여행 수정 모드
                setLoading(true);
                try {
                    console.log(`기존 여행 데이터 불러오는 중... tourId: ${tourId}`);
                    const data = await getTourDetails(tourId);
                    
                    if (data) {
                        console.log("불러온 여행 데이터:", data);
                        
                        // 서버 데이터를 프론트엔드 형식으로 변환
                        const mappedRegions = [];
                        if (data.areaName && data.areaCode) {
                            const areaSet = new Set(data.areaName.map((_, index) => data.areaCode[index]));
                            
                            areaSet.forEach(areaCode => {
                                const areaName = data.areaName[data.areaCode.indexOf(areaCode)];
                                const sigungu = [];
                                data.sigunguCode.forEach((sigunguCode, index) => {
                                    if (data.areaCode[index] === areaCode) {
                                        sigungu.push({
                                            key: sigunguCode,
                                            name: data.sigunguName[index]
                                        });
                                    }
                                });
                                
                                mappedRegions.push({
                                    key: areaCode,
                                    name: areaName,
                                    sigungu: sigungu
                                });
                            });
                        }

                        const periodTypeMap = {
                            1: 'date',
                            2: 'duration'
                        };
                        const periodType = periodTypeMap[data.periodType] || 'date';
                        
                        // 스케줄 데이터 변환
                        const mappedScheduleData = {};
                        if (data.schedules && Array.isArray(data.schedules)) {
                            data.schedules.forEach(schedule => {
                                // timeSlot이 undefined 또는 null일 경우 빈 문자열로 대체
                                const safeSchedule = {
                                    ...schedule,
                                    timeSlot: schedule.timeSlot || ''
                                };
                                
                                const dayKey = `day${schedule.day || 1}`;
                                if (!mappedScheduleData[dayKey]) {
                                    mappedScheduleData[dayKey] = [];
                                }
                                mappedScheduleData[dayKey].push(safeSchedule);
                            });
                        }
                        
                        setTitle(data.title || '');
                        setRegions(mappedRegions);
                        setPeriod({
                            type: periodType,
                            startDate: data.startDate,
                            endDate: data.endDate,
                            nights: data.nightCount,
                            days: data.dayCount
                        });
                        setSelectedAttractions(data.attractions || []);
                        setScheduleData(mappedScheduleData);
                        setMembers(data.participants || []);
                        
                        setIsDataLoaded(true);
                    }
                } catch (error) {
                    console.error("여행 데이터 불러오기 실패:", error);
                    Alert.alert("에러", "여행 정보를 불러오는데 실패했습니다.", [
                        { text: "확인", onPress: () => router.push('/mytour') }
                    ]);
                } finally {
                    setLoading(false);
                }
            } else {
                // 새 여행 생성 모드
                try {
                    setTitle(itineraryTitle || '');
                    setRegions(selectedRegions ? JSON.parse(selectedRegions) : []);
                    setPeriod(periodData ? JSON.parse(periodData) : {});
                    setIsDataLoaded(true);
                } catch (error) {
                    console.error("초기 데이터 파싱 에러:", error);
                    setTitle('');
                    setRegions([]);
                    setPeriod({});
                    setIsDataLoaded(true);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTourData();
    }, [tourId, selectedRegions, itineraryTitle, periodData]);

    // 자동 저장 (기존 여행 수정시에만)
    useEffect(() => {
        if (!isDataLoaded || !currentTourId) {
            return;
        }

        const updateServer = async () => {
            try {
                if (!title.trim() || (period.type === 'date' && (!period.startDate || !period.endDate)) || (period.type === 'duration' && (!period.nights || !period.days))) {
                    console.log("필수 데이터 누락으로 자동 저장 건너뜀");
                    return;
                }

                const tourData = {
                    title: debouncedTitle,
                    areaCode: regions.map(r => r.key),
                    sigunguCode: regions.flatMap(r => r.sigungu.map(s => s.key)),
                    areaName: regions.map(r => r.name),
                    sigunguName: regions.flatMap(r => r.sigungu.map(s => s.name)),
                    periodType: period.type === 'date' ? 1 : 2,
                    startDate: period.type === 'date' ? period.startDate : null,
                    endDate: period.type === 'date' ? period.endDate : null,
                    nightCount: period.type === 'duration' ? period.nights : null,
                    dayCount: period.type === 'duration' ? period.days : null,
                    schedule: debouncedScheduleData,
                    attractions: debouncedSelectedAttractions,
                    members: members,
                    userId: currentUserId
                };

                await updateTour(currentTourId, tourData);
                console.log("✅ 자동 저장 완료");
            } catch (error) {
                console.error("자동 저장 실패:", error);
            }
        };

        updateServer();
    }, [debouncedSelectedAttractions, debouncedScheduleData, debouncedTitle, members, currentTourId, isDataLoaded]);

    // 여행 확정/저장 버튼 핸들러
    const handleConfirmItinerary = async () => {
        try {
            if (!title.trim()) {
                Alert.alert("알림", "여행 제목을 입력해주세요.");
                return;
            }

            if (period.type === 'date' && (!period.startDate || !period.endDate)) {
                Alert.alert("알림", "여행 날짜를 설정해주세요.");
                return;
            }

            if (period.type === 'duration' && (!period.nights || !period.days)) {
                Alert.alert("알림", "여행 기간을 설정해주세요.");
                return;
            }

            const tourData = {
                title: title,
                areaCode: regions.map(r => r.key),
                sigunguCode: regions.flatMap(r => r.sigungu.map(s => s.key)),
                areaName: regions.map(r => r.name),
                sigunguName: regions.flatMap(r => r.sigungu.map(s => s.name)),
                periodType: period.type === 'date' ? 1 : 2,
                startDate: period.type === 'date' ? period.startDate : null,
                endDate: period.type === 'date' ? period.endDate : null,
                nightCount: period.type === 'duration' ? period.nights : null,
                dayCount: period.type === 'duration' ? period.days : null,
                schedule: scheduleData,
                attractions: selectedAttractions.map(a => a.id || a),
                members: members,
                userId: currentUserId
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
        }
    };
    
    // 날짜 범위 포맷팅
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
            const isSelected = prev.some(item => (item.id || item) === (attraction.id || attraction));
            if (isSelected) {
                return prev.filter(item => (item.id || item) !== (attraction.id || attraction));
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

    // 일정 추가 핸들러
    const handleAddSchedule = (selectedDay, selectedDate = null, selectedHour = null) => {
        if (!currentTourId && !tourId) {
            Alert.alert("알림", "먼저 여행을 저장한 후 일정을 추가할 수 있습니다.");
            return;
        }

        setSchedulePopupData({
            selectedDay: selectedDay,
            selectedDate: selectedDate,
            selectedHour: selectedHour,
            existingSchedule: null
        });
        setShowAddSchedulePopup(true);
    };

    // 시간 블록 클릭 핸들러
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

    // 일정 추가 완료 핸들러 (API 통합)
    const handleScheduleAdded = async (newScheduleData) => {
        try {
            if (!currentTourId && !tourId) {
                Alert.alert("오류", "여행 ID가 없습니다. 먼저 여행을 저장해주세요.");
                return;
            }

            const scheduleData = {
                ...newScheduleData,
                day: schedulePopupData?.selectedDay || newScheduleData.day || 1,
                travelId: currentTourId || tourId,
                // category, title, location, memo 등은 newScheduleData에 포함되어 있음
            };

            if (schedulePopupData?.existingSchedule) {
                // 기존 스케줄 업데이트
                await updateSchedule(schedulePopupData.existingSchedule.id, scheduleData);
            } else {
                // 새 스케줄 생성
                await createSchedule(scheduleData);
            }

            handleCloseAddSchedulePopup();
        } catch (error) {
            console.error('일정 저장 실패:', error);
        }
    };

    // 일정 삭제 핸들러 (API 통합)
    const handleScheduleDelete = async (scheduleId, day) => {
        try {
            Alert.alert(
                "일정 삭제",
                "이 일정을 삭제하시겠습니까?",
                [
                    { text: "취소", style: "cancel" },
                    { 
                        text: "삭제", 
                        onPress: async () => {
                            await deleteSchedule(scheduleId, day);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('일정 삭제 실패:', error);
        }
    };

    const dateInfo = formatDateRange();

    // 메인 컨텐츠 렌더링
    const renderMainContent = () => {
        if (selectedDay) {
            const daySchedules = scheduleData[`day${selectedDay}`] || [];
            return (
                <Schedule 
                    selectedDay={selectedDay}
                    schedules={daySchedules}
                    onAddSchedule={(day) => handleAddSchedule(day)}
                    onScheduleDelete={handleScheduleDelete}
                    loading={scheduleLoading}
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
                    loading={scheduleLoading}
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
                    loading={scheduleLoading}
                />
            );
        }
    };

    // 로딩 화면
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
                    currentTourId={currentTourId || tourId}
                />
            )}

            {scheduleLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>처리 중...</Text>
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});