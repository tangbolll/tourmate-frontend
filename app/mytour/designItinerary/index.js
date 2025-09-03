import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, Text, ActivityIndicator, Platform, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import dayjs from 'dayjs';

// 컴포넌트 ImportsW
import DesignItineraryHeader from '../../../components/mytour/designItinerary/designItineraryHeader';
import DateSelectButtons from '../../../components/mytour/designItinerary/DateSelectButtons';
import BottomSheet from '../../../components/mytour/designItinerary/BottomSheet';
import AiItineraryDesignPopup from '../../../components/mytour/designItinerary/AiItineraryDesignPopup';
import MemberPopup from '../../../components/mytour/designItinerary/MemberPopup';
import ItineraryWithSchedule from '../../../components/mytour/designItinerary/ItineraryWithSchedule';
import Schedule from '../../../components/mytour/designItinerary/schedule/Schedule';
import AddSchedule from '../../../components/mytour/designItinerary/AddSchedule/AddSchedule';
import { scheduleUtils } from '../../../utils/scheduleUtils';
import EditTourInfoPopup from '../../../components/mytour/designItinerary/EditTourInfoPopup';

 

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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false); 
    const [isManuallySaving, setIsManuallySaving] = useState(false); 
    const [location, setLocation] = useState('');




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
            
            console.log('전체 데이터:', JSON.stringify(data, null, 2));
            
            if (!data) throw new Error("여행 정보를 불러올 수 없습니다.");

            // 🔥 먼저 period 타입을 결정
            const periodTypeMap = { 1: 'date', 2: 'duration' };
            const currentPeriodType = periodTypeMap[data.periodType] || 'date';
            
            console.log('🔍 [Debug] 현재 여행 타입:', currentPeriodType, '(DB periodType:', data.periodType, ')');

            // 🔥 period 타입을 알았으니 이제 스케줄 매핑
            const mappedScheduleData = {};
            if (data.schedules && Array.isArray(data.schedules)) {
                console.log('🔍 [Debug] 전체 스케줄 개수:', data.schedules.length);
                
                if (currentPeriodType === 'date' && data.startDate) {
                    // 날짜 기반 여행: date 필드 기준으로 매핑
                    const tripStartDate = dayjs(data.startDate);
                    console.log('🔍 [Debug] 날짜 기반 - 여행 시작일:', tripStartDate.format('YYYY-MM-DD'));
                    
                    data.schedules.forEach((schedule, index) => {
                        if (!schedule || !schedule.date) {
                            console.warn(`🚨 [Debug] 스케줄 ${schedule?.id}의 date가 null:`, schedule);
                            return;
                        }
                        
                        const scheduleDate = dayjs(schedule.date);
                        if (!scheduleDate.isValid()) {
                            console.warn(`🚨 [Debug] 스케줄 ${schedule.id}의 날짜가 유효하지 않음:`, schedule.date);
                            return;
                        }
                        
                        const dayNumber = scheduleDate.diff(tripStartDate, 'day') + 1;
                        console.log(`🔍 [Debug] 스케줄 ${schedule.id}: ${schedule.date} -> day${dayNumber}`);
                        
                        if (dayNumber >= 1) {
                            const dayKey = `day${dayNumber}`;
                            if (!mappedScheduleData[dayKey]) mappedScheduleData[dayKey] = [];
                            
                            const style = scheduleUtils.getCategoryStyle(schedule.tag);
                            const scheduleWithColor = {
                                ...schedule,
                                categoryColor: style.borderColor
                            };
                            
                            mappedScheduleData[dayKey].push(scheduleWithColor);
                            console.log(`✅ [Debug] ${dayKey}에 스케줄 추가됨`);
                        }
                    });
                    
                } else if (currentPeriodType === 'duration') {
                    // 기간 기반 여행: dayDescription 필드 기준으로 매핑
                    console.log('🔍 [Debug] 기간 기반 여행 - dayDescription 기준 매핑');
                    
                    data.schedules.forEach((schedule, index) => {
                        if (!schedule || !schedule.dayDescription) {
                            console.warn(`🚨 [Debug] 스케줄 ${schedule?.id}의 dayDescription이 null:`, schedule);
                            return;
                        }
                        
                        // dayDescription에서 day 번호 추출 (임시 디버깅용)
                        const dayKey = `day${schedule.dayDescription}`;
                        
                        console.log(`🔍 [Debug] 스케줄 ${schedule.id}: ${schedule.dayDescription} -> ${dayKey}`);
                        
                        if (!mappedScheduleData[dayKey]) mappedScheduleData[dayKey] = [];
                        
                        const style = scheduleUtils.getCategoryStyle(schedule.tag);
                        const scheduleWithColor = {
                            ...schedule,
                            categoryColor: style.borderColor
                        };
                        
                        mappedScheduleData[dayKey].push(scheduleWithColor);
                        console.log(`✅ [Debug] ${dayKey}에 스케줄 추가됨`);
                    });
                }
                
                console.log('🔍 [Debug] 최종 mappedScheduleData 키들:', Object.keys(mappedScheduleData));
                console.log('🔍 [Debug] 각 날짜별 스케줄 개수:', Object.fromEntries(
                    Object.entries(mappedScheduleData).map(([key, schedules]) => [key, schedules.length])
                ));
            }

            // 상태 설정
            setTitle(data.title || '');
            setRegions(data.regions?.map(r => ({
                areaCode: r.areaCode || r.key,
                areaName: r.areaName || r.name,
                sigungu: r.sigungu?.map(s =>
                    ({ code: s.code || s.key, name: s.name })
                ) || []
            })) || []);
            setPeriod({
                type: currentPeriodType,
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
            Alert.alert("에러", "여행 정보를 불러오는데 실패했습니다.", [
                { text: "확인", onPress: () => router.push('/mytour') }
            ]);
        } finally {
            setLoading(false);
        }
    }, [currentTourId, itineraryTitle, periodData, selectedRegions]);

    useEffect(() => {
        fetchTourData();
    }, [fetchTourData]);

    // 서버에 보내는 순수 schedule 데이터만 뽑는 함수
    const getCleanScheduleData = (data) => {
        const cleanData = {};
        Object.keys(data).forEach(dayKey => {
            cleanData[dayKey] = data[dayKey].map(item => ({
                id: item.id,
                date: item.date,
                dayDescription: item.dayDescription, // 🔥 dayDescription 추가
                title: item.title,
                tag: item.tag,
                location: item.location,
                latitude: item.latitude || item.y || 0, // 🔥 여러 필드명 대응
                longitude: item.longitude || item.x || 0, // 🔥 여러 필드명 대응
                memo: item.memo
                // categoryColor, existingSchedule 등 제거
            }));
        });
        return cleanData;
    };

// ✅ 여행 정보 수정 모달 열기 핸들러
const handleEditInfoPress = () => {
    setIsEditModalVisible(true);
};

// ✅ 여행 정보 수정 저장 핸들러
// DesignItinerary.js

const handleSaveEditInfo = async (updatedData) => {
    // 1. 유효성 검사
    if (!updatedData.title.trim()) {
        Alert.alert("알림", "제목을 입력해주세요.");
        return;
    }

    // 2. updatedData에 startDate가 있는지 확인하여 기간 타입 결정
    const isDateType = updatedData.startDate !== null;

    // 3. API에 보낼 데이터 구성
    // (state가 아닌 updatedData와 기존 state를 조합하여 항상 정확한 데이터를 만듭니다)
    const tourDataForUpdate = {
        title: updatedData.title,
        regions: regions, // 기존 regions state 사용
        periodType: isDateType ? 1 : 2,
        startDate: updatedData.startDate,
        endDate: updatedData.endDate,
        nightCount: updatedData.nights,
        dayCount: updatedData.days,
        attractions: selectedAttractions, // 기존 attractions state 사용
        schedule: scheduleData,           // 기존 scheduleData state 사용
        members: members,                 // 기존 members state 사용
        ownerId: currentUserId
    };

    console.log('4️⃣ 부모: API에 보낼 최종 데이터 ->', tourDataForUpdate);

    try {
        // 4. API로 데이터 업데이트
        await updateTour(currentTourId, tourDataForUpdate);
        console.log('여행 정보 업데이트 성공');

        // 5. 성공하면, 서버에서 최신 데이터를 다시 불러와 화면 전체를 동기화
        await fetchTourData(); 
        
        // 6. 모달 닫기
        setIsEditModalVisible(false);

    } catch (error) {
        console.error("수정 정보 저장 실패:", error); 
        Alert.alert("오류", "정보를 업데이트하는 데 실패했습니다.");
    }
};

const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
};


// 자동 저장 useEffect
useEffect(() => {
    if (!isDataLoaded || !currentTourId) return;

    const updateServer = async () => {
        setIsAutoSaving(true); // ✅ 저장 시작: 플래그를 true로 설정
        console.log("🚀 자동 저장을 시작합니다...");
        try {
            const safeScheduleData = getCleanScheduleData(scheduleData);

            const tourData = {
                title,
                regions: regions,
                periodType: period.type === 'date' ? 1 : 2,
                startDate: period.startDate,
                endDate: period.endDate,
                nightCount: period.nights,
                dayCount: period.days,
                attractions: selectedAttractions.map(a => a.id || a),
                schedule: safeScheduleData,
                members,
                ownerId: currentUserId
            };

            await updateTour(currentTourId, tourData);
            console.log("자동 저장 성공");
        } catch (error) {
            console.error("자동 저장 실패:", error);
        } finally {
            setIsAutoSaving(false); // ✅ 저장 종료: 성공하든 실패하든 플래그를 false로 되돌림
            console.log("🏁 자동 저장이 종료되었습니다.");
        }
    };

    updateServer();
}, [scheduleData, selectedAttractions, title, regions, period, members, currentTourId, isDataLoaded]);



    // 여행 확정/저장 버튼
    const handleConfirmItinerary = async () => {
        try {
            if (!title.trim()) return Alert.alert("알림", "여행 제목을 입력해주세요.");
            if (period.type === 'date' && (!period.startDate || !period.endDate)) return Alert.alert("알림", "여행 날짜를 설정해주세요.");
            if (period.type === 'duration' && (!period.nights || !period.days)) return Alert.alert("알림", "여행 기간을 설정해주세요.");

            setScheduleLoading(true);

            const tourData = {
                title: title,
                regions: regions,
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

    const handleScheduleAdded = async (newScheduleData) => {
        console.log('[handleScheduleAdded] 시작:', JSON.stringify(newScheduleData, null, 2));
        setScheduleLoading(true);
        try {
            if (!currentTourId) {
                Alert.alert("알림", "먼저 여행을 저장한 후 일정을 추가할 수 있습니다.");
                return;
            }

            let locationName = '';
            let latitude = null;
            let longitude = null;

            if (newScheduleData.location) {
                if (typeof newScheduleData.location === 'string') {
                    locationName = newScheduleData.location;
                } else if (typeof newScheduleData.location === 'object' && newScheduleData.location.x && newScheduleData.location.y) {
                    locationName = newScheduleData.location.place_name || '';
                    const parsedLat = parseFloat(newScheduleData.location.y);
                    const parsedLng = parseFloat(newScheduleData.location.x);
                    if (!isNaN(parsedLat)) latitude = parsedLat;
                    if (!isNaN(parsedLng)) longitude = parsedLng;
                }
            }

            const payload = {
                travelId: currentTourId,
                timeSlot: `${newScheduleData.startTime} ~ ${newScheduleData.endTime}`,
                title: newScheduleData.title,
                tag: newScheduleData.category || 'CUSTOM',
                location: locationName,
                latitude: latitude !== null ? latitude : 0.0,
                longitude: longitude !== null ? longitude : 0.0,
                memo: newScheduleData.memo || ''
            };

            if (period.type === 'date') {
                payload.date = newScheduleData.date;
                payload.dayDescription = null;
            } else if (period.type === 'duration') {
                payload.date = null;
                payload.dayDescription = newScheduleData.dayDescription || `Day ${newScheduleData.selectedDay}`;
            }

            if (schedulePopupData?.existingSchedule?.id) {
                console.log('[handleScheduleAdded] 기존 스케줄 업데이트 중...');
                await updateTravelSchedule(schedulePopupData.existingSchedule.id, payload);
                await fetchTourData(); // 업데이트 시에는 전체 데이터를 다시 불러옵니다.
            } else {
                console.log('[handleScheduleAdded] 새 스케줄 생성 중...');
                const newScheduleFromApi = await createTravelSchedule(payload);
                console.log('[handleScheduleAdded] API로부터 받은 새 스케줄:', newScheduleFromApi);

                // 방어적 코드: 백엔드 응답에 startTime이 없는 경우 timeSlot에서 직접 파싱합니다.
                const newSchedule = { ...newScheduleFromApi };
                if (newSchedule.timeSlot && !newSchedule.startTime) {
                    const timeParts = newSchedule.timeSlot.split(' ~ ');
                    newSchedule.startTime = timeParts[0];
                    newSchedule.endTime = timeParts[1];
                }

                // 백엔드에서 받은 새 스케줄 객체로 로컬 상태를 직접 업데이트합니다.
                const dayNumber = newSchedule.date 
                    ? dayjs(newSchedule.date).diff(dayjs(period.startDate), 'day') + 1 
                    : parseInt((newSchedule.dayDescription || '').match(/\d+/)[0], 10);

                if (!dayNumber) {
                    console.error("새 스케줄의 dayKey를 결정할 수 없어 전체 데이터를 다시 로드합니다.", newSchedule);
                    await fetchTourData();
                    return;
                }
                const dayKey = `day${dayNumber}`;

                const style = scheduleUtils.getCategoryStyle(newSchedule.tag);
                const scheduleWithColor = {
                    ...newSchedule,
                    categoryColor: style.borderColor
                };

                setScheduleData(prevData => {
                    const newData = { ...prevData };
                    if (!newData[dayKey]) {
                        newData[dayKey] = [];
                    }
                    
                    const timeToMinutes = (timeString) => {
                        if (!timeString || !timeString.includes(':')) return 0;
                        const [hours, minutes] = timeString.split(':').map(Number);
                        return (hours || 0) * 60 + (minutes || 0);
                    };

                    // Add new schedule and sort
                    const updatedDaySchedules = [...newData[dayKey], scheduleWithColor];
                    updatedDaySchedules.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
                    
                    newData[dayKey] = updatedDaySchedules;
                    console.log(`[handleScheduleAdded] 로컬 상태 업데이트 완료. ${dayKey}에 새 스케줄 추가됨.`);
                    return newData;
                });
            }

        } catch (error) {
            console.error('[handleScheduleAdded] 스케줄 저장 에러:', error);
            Alert.alert('오류', '일정 저장에 실패했습니다.');
        } finally {
            setScheduleLoading(false);
            handleCloseAddSchedulePopup();
        }
    };

    // 일정 삭제 핸들러 - 팝업창에서
    const performDeleteSchedule = async (scheduleId) => {
        console.log(`[Delete Flow] Starting deletion for schedule ID: ${scheduleId}`);
        setScheduleLoading(true);
        try {
            console.log(`[Delete Flow] About to call deleteTravelSchedule with ID: ${scheduleId}`);
            const deleteResult = await deleteTravelSchedule(scheduleId);
            console.log(`[Delete Flow] deleteTravelSchedule API call result: ${deleteResult}`); // Should be true

            if (deleteResult) {
                console.log("[Delete Flow] API call successful. Current scheduleData BEFORE refresh:", JSON.stringify(scheduleData, null, 2));
                await fetchTourData();
                console.log("[Delete Flow] Data refreshed successfully. Current scheduleData AFTER refresh:", JSON.stringify(scheduleData, null, 2));
            } else {
                console.warn("[Delete Flow] deleteTravelSchedule returned false/falsy. Not refreshing data.");
                Alert.alert('알림', '삭제 요청은 성공했으나, 서버에서 문제가 발생했습니다.');
            }
        } catch (error) {
            console.error("[Delete Flow] Error during deletion process:", error);
            Alert.alert('오류', `일정 삭제에 실패했습니다: ${error.message || error}`);
        } finally {
            setScheduleLoading(false);
            handleCloseAddSchedulePopup();
            console.log("[Delete Flow] Deletion process finished.");
        }
    };

    const handleScheduleDelete = (scheduleId) => {
        console.log(`[Delete Flow] handleScheduleDelete called with scheduleId: ${scheduleId}`);
        if (Platform.OS === 'web') {
            setScheduleToDelete(scheduleId);
            setShowConfirmModal(true);
        } else {
            Alert.alert("일정 삭제", "이 일정을 삭제하시겠습니까?", [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    onPress: () => {
                        console.log(`[Delete Flow] "삭제" button pressed for schedule ID: ${scheduleId}`);
                        performDeleteSchedule(scheduleId);
                    },
                    style: "destructive"
                }
            ]);
        }
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
        setMembers(prev => prev.filter(member => member.userId !== memberToDelete.userId));
    };
    const handleMemberAdd = (newMember) => setMembers(prev => [...prev, newMember]);

    const handleAddSchedule = (day, date, hour, attraction, locationValue = '') => {
        console.log('handleAddSchedule 호출:', { day, date, hour, attraction, locationValue });
        console.log('현재 period:', period);
        
        const title = attraction?.name || '';
        setLocation(locationValue);

        const popupData = {
            selectedDay: day,
            existingSchedule: null,
            location: locationValue,
            title: title
        };

        // 🔥 periodType에 따라 다른 데이터 설정
        if (period.type === 'date') {
            // 날짜 기반: selectedDate 설정
            popupData.selectedDate = date || (period.startDate ? dayjs(period.startDate).add(day - 1, 'day').format('YYYY-MM-DD') : null);
            popupData.dayDescription = null;
            console.log('날짜 기반 - selectedDate:', popupData.selectedDate);
        } else if (period.type === 'duration') {
            // 기간 기반: dayDescription 설정
            popupData.selectedDate = null;
            popupData.dayDescription = `Day ${day}`;
            console.log('기간 기반 - dayDescription:', popupData.dayDescription);
        }

        if (hour) {
            popupData.selectedHour = hour;
        }

        console.log('팝업으로 보낼 최종 데이터 (popupData):', popupData);

        setSchedulePopupData(popupData);
        setShowAddSchedulePopup(true);
    };

    const handleTimeBlockClick = (blockData) => {
        console.log('handleTimeBlockClick 호출:', blockData);
        console.log('현재 period:', period);
        
        const popupData = {
            selectedDay: blockData.day,
            hour: blockData.hour,
            minute: blockData.minute,
            existingSchedule: blockData.existingSchedule,
            location: location,
        };

        // 🔥 periodType에 따라 다른 데이터 설정
        if (period.type === 'date') {
            // 날짜 기반
            popupData.selectedDate = blockData.date;
            popupData.dayDescription = null;
            console.log('날짜 기반 - selectedDate:', popupData.selectedDate);
        } else if (period.type === 'duration') {
            // 기간 기반
            popupData.selectedDate = null;
            popupData.dayDescription = `Day ${blockData.day}`;
            console.log('기간 기반 - dayDescription:', popupData.dayDescription);
        }
        
        console.log('타임블록 클릭 - 최종 popupData:', popupData);
        
        setSchedulePopupData(popupData);
        setShowAddSchedulePopup(true);
    };
    
    const handleCloseAddSchedulePopup = () => {
    setShowAddSchedulePopup(false);
    setSchedulePopupData(null);
    setLocation('');  // 위치 상태 초기화
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
                startDate={dateInfo.startDate}
                endDate={dateInfo.endDate}
                periodType={period.type}
                onBackPress={handleBackPress}
                onMemberPress={handleMemberPress}
                tourId={currentTourId}
                onEditPress={handleEditInfoPress}
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
                onAddToSchedule={handleAddSchedule}
                periodType={period.type}
                startDate={period.startDate}
                endDate={period.endDate}
                nights={period.nights}
                days={period.days}
                travelId={currentTourId}
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
                    tourId={currentTourId}

                />
            )}

            {showAddSchedulePopup && schedulePopupData && (
                <AddSchedule
                    visible={showAddSchedulePopup}
                    {...schedulePopupData}
                    onClose={handleCloseAddSchedulePopup}
                    onScheduleAdded={handleScheduleAdded}
                    onScheduleDelete={performDeleteSchedule}
                    currentTourId={currentTourId}
                    periodType={period.type} // 🔥 periodType 추가
                    startDate={period.startDate}
                    endDate={period.endDate}
                    days={period.days}
                    nights={period.nights} // 🔥 nights도 추가 (필요한 경우)
                    initialTitle={schedulePopupData.title || ''}
                    initialLocation={schedulePopupData.location || ''}
                />
            )}

            {showConfirmModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={showConfirmModal}
                    onRequestClose={() => setShowConfirmModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>일정 삭제</Text>
                            <Text style={styles.modalMessage}>이 일정을 삭제하시겠습니까?</Text>
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalCancelButton]}
                                    onPress={() => setShowConfirmModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalDeleteButton]}
                                    onPress={() => {
                                        // 1. Modal 닫기
                                        setShowConfirmModal(false);
                                        const scheduleIdToDelete = scheduleToDelete;
                                        setScheduleToDelete(null);
                                        // 2. API 호출
                                        performDeleteSchedule(scheduleIdToDelete);
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {(scheduleLoading || loading) && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingTextWhite}>처리 중...</Text>
                </View>
            )}

            <EditTourInfoPopup
                visible={isEditModalVisible}
                onClose={handleCloseEditModal}
                onSave={handleSaveEditInfo}
                existingData={{ 
                    title: title, 
                    startDate: period.startDate, 
                    endDate: period.endDate,
                    nights: period.nights,
                    days: period.days
                }}
                periodType={period.type}
            />
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    modalCancelButton: {
        backgroundColor: '#ccc',
    },
    modalDeleteButton: {
        backgroundColor: '#ff4d4d',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});