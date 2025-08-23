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
    const [isDataLoaded, setIsDataLoaded] = useState(false); // 데이터 로드 완료 여부
    const [currentTourId, setCurrentTourId] = useState(tourId); // 현재 투어 ID

    // 디바운스된 값들 (자동 저장용)
    const debouncedSelectedAttractions = useDebounce(selectedAttractions, 2000);
    const debouncedScheduleData = useDebounce(scheduleData, 2000);
    const debouncedTitle = useDebounce(title, 1000);

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
                            // areaName과 areaCode를 기반으로 regions 배열 생성
                            const areaSet = new Set(data.areaName.map((_, index) => data.areaCode[index]));
                            
                            areaSet.forEach(areaCode => {
                                const areaName = data.areaName[data.areaCode.indexOf(areaCode)];
                                const sigungu = [];
                                // 해당 areaCode에 속한 sigungu를 찾아서 추가
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

                        // periodType 숫자를 문자열로 변환 (1: date, 2: duration)
                        const periodTypeMap = {
                            1: 'date',
                            2: 'duration'
                        };
                        const periodType = periodTypeMap[data.periodType] || 'date';
                        
                        // 스케줄 데이터 변환 (백엔드에서 받은 scheduleId를 활용)
                        const mappedScheduleData = {};
                        if (data.schedules && Array.isArray(data.schedules)) {
                            // 스케줄 데이터가 없는 경우를 고려
                            data.schedules.forEach(schedule => {
                                // 백엔드에서 각 스케줄에 day 정보가 있다고 가정하고 그룹화
                                const dayKey = `day${schedule.day || 1}`;
                                if (!mappedScheduleData[dayKey]) {
                                    mappedScheduleData[dayKey] = [];
                                }
                                mappedScheduleData[dayKey].push(schedule);
                            });
                        }
                        
                        // 서버에서 받은 데이터로 상태 설정
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
                        
                        setIsDataLoaded(true); // 데이터 로드 완료 표시
                        console.log("여행 데이터 매핑 완료:", {
                            title: data.title,
                            regions: mappedRegions,
                            period: {
                                type: periodType,
                                startDate: data.startDate,
                                endDate: data.endDate,
                                nights: data.nightCount,
                                days: data.dayCount
                            },
                            schedules: mappedScheduleData,
                            members: data.participants
                        });
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
                    setIsDataLoaded(true); // 새 여행도 데이터 로드 완료로 표시
                    console.log("새로운 여행 생성 모드로 시작");
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
        // 데이터가 로드되지 않았거나, 새 여행 생성 모드이면 자동 저장하지 않음
        if (!isDataLoaded || !currentTourId) {
            return;
        }

        const updateServer = async () => {
            try {
                // 필수 데이터가 있는지 확인
                if (!title.trim() || (period.type === 'date' && (!period.startDate || !period.endDate)) || (period.type === 'duration' && (!period.nights || !period.days))) {
                    console.log("필수 데이터 누락으로 자동 저장 건너뜀");
                    return;
                }

                // 서버로 보낼 데이터 구조를 백엔드 DTO에 맞게 변환
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
                    schedule: debouncedScheduleData, // 백엔드에서 변환을 처리한다고 가정
                    attractions: debouncedSelectedAttractions, // 백엔드에서 변환을 처리한다고 가정
                    members: members,
                    userId: currentUserId
                };

                console.log("여행 자동 저장 요청:", tourData);
                await updateTour(currentTourId, tourData);
                console.log("✅ 자동 저장 완료");
            } catch (error) {
                console.error("자동 저장 실패:", error);
                // 자동 저장 실패는 사용자에게 알리지 않음
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

            // 기간 타입에 따른 유효성 검사
            if (period.type === 'date' && (!period.startDate || !period.endDate)) {
                Alert.alert("알림", "여행 날짜를 설정해주세요.");
                return;
            }

            if (period.type === 'duration' && (!period.nights || !period.days)) {
                Alert.alert("알림", "여행 기간을 설정해주세요.");
                return;
            }

            // 서버로 보낼 데이터 구조를 백엔드 DTO에 맞게 변환
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
                // 새 여행 생성
                console.log("새 여행 생성 요청 데이터:", tourData);
                const newTour = await createTour(tourData);
                setCurrentTourId(newTour.id);
                Alert.alert("성공", "새로운 여행 일정이 생성되었습니다.");
            } else {
                // 기존 여행 최종 저장
                console.log("여행 최종 저장 요청 데이터:", tourData);
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

    // 뒤로 가기 핸들러
    const handleBackPress = () => {
        router.push('/mytour');
    };

    // 일별 선택 핸들러
    const handleDaySelect = (dayNumber) => {
        setSelectedDay(dayNumber);
        setIsGridMode(false);
    };

    // 그리드 모드 토글
    const handleGridToggle = (gridMode) => {
        setIsGridMode(gridMode);
        if (gridMode) {
            setSelectedDay(null);
        }
    };

    // 명소 선택/해제
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

    // AI 일정 생성 핸들러
    const handleAiItineraryPress = () => {
        setShowAiPopup(true);
    };

    const handleAiPopupConfirm = (result) => {
        setShowActionButtons(true);
    };

    // 멤버 관련 핸들러
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

    // 일정 추가 팝업 닫기
    const handleCloseAddSchedulePopup = () => {
        setShowAddSchedulePopup(false);
        setSchedulePopupData(null);
    };

    // 일정 추가 완료
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

    // 일정 삭제
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
});
