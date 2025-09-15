import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, Text, ActivityIndicator, Platform, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
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

    // 기존 상태 관리
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

    // AI 관련 상태들
    const [aiSchedules, setAiSchedules] = useState({}); // AI가 제안한 '임시' 일정
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAiBottomSheetVisible, setIsAiBottomSheetVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null); // 일정 상세 보기 모달용
    

    // 디바운스된 값들
    const debouncedSelectedAttractions = useDebounce(selectedAttractions, 2000);
    const debouncedScheduleData = useDebounce(scheduleData, 2000);
    const debouncedTitle = useDebounce(title, 1000);

    // 💡 combinedScheduleData: 원본 일정 + AI 일정 합치기
    const combinedScheduleData = useMemo(() => {
        const combined = {};
        const allDayKeys = new Set([...Object.keys(scheduleData), ...Object.keys(aiSchedules)]);

        allDayKeys.forEach(dayKey => {
            const original = scheduleData[dayKey] || [];
            const ai = aiSchedules[dayKey] || [];
            combined[dayKey] = [...original, ...ai].sort((a, b) => 
                (a.startTime || '00:00').localeCompare(b.startTime || '00:00')
            );
        });

        console.log('🔄 combinedScheduleData 업데이트:', combined);
        return combined;
    }, [scheduleData, JSON.stringify(aiSchedules)]);

    // 💡 AI 일정 선택 핸들러 (누락된 함수)
    const handleSelectSchedule = (schedule) => {
        console.log('일정 선택됨:', schedule);
        setSelectedSchedule(schedule);
    };

    // 💡 AI 관련 핸들러들 (누락된 함수들)
    const handleConfirmAiSchedules = async () => {
        try {
            console.log('AI 일정 확정 시작...');
            
            const allAiSchedules = [];
            Object.entries(aiSchedules).forEach(([dayKey, schedules]) => {
                schedules.forEach(schedule => {
                    const { isAiSuggestion, categoryColor, ...cleanSchedule } = schedule;
                    allAiSchedules.push(cleanSchedule);
                });
            });

            for (const aiSchedule of allAiSchedules) {
                const payload = {
                    travelId: currentTourId,
                    timeSlot: `${aiSchedule.startTime} ~ ${aiSchedule.endTime}`,
                    title: aiSchedule.title,
                    tag: aiSchedule.tag || '관광',
                    location: aiSchedule.location || '',
                    latitude: aiSchedule.latitude || 0.0,
                    longitude: aiSchedule.longitude || 0.0,
                    memo: aiSchedule.memo || ''
                };

                if (period.type === 'date') {
                    payload.date = aiSchedule.date;
                    payload.dayDescription = null;
                } else {
                    payload.date = null;
                    payload.dayDescription = aiSchedule.dayDescription;
                }

                await createTravelSchedule(payload);
            }

            setAiSchedules({}); // ✅ AI 임시 일정 초기화
            setIsAiBottomSheetVisible(false);
            await fetchTourData(); // ✅ 서버 데이터 다시 불러오기

            Alert.alert('성공', 'AI 추천 일정이 확정되었습니다!');
            
        } catch (error) {
            console.error('AI 일정 확정 실패:', error);
            Alert.alert('오류', 'AI 일정 확정에 실패했습니다.');
        }
    };

    const handleRetryAiSchedules = () => {
        setAiSchedules({});
        setIsAiBottomSheetVisible(false);
        setShowAiPopup(true); // AI 팝업 다시 열기
    };

    const handleRevertAiSchedules = () => {
        setAiSchedules({});
        setIsAiBottomSheetVisible(false);
    };

    const handleAiPopupConfirm = (selectedAttractions, aiOptions) => {
        // AI 팝업에서 확인 버튼을 눌렀을 때의 처리
        console.log('AI 팝업 확인:', selectedAttractions, aiOptions);
        setShowAiPopup(false);
        // 여기서 실제 AI API 호출을 하거나, BottomSheet에서 처리하도록 할 수 있습니다.
    };

    // AI 일정 제어 컴포넌트
    const AiScheduleControls = ({ onConfirm, onRetry, onRevert }) => (
        <View style={styles.aiControlsContainer}>
            <View style={styles.aiControlsContent}>
                <Text style={styles.aiControlsTitle}>AI 추천 일정이 생성되었습니다</Text>
                <View style={styles.aiControlsButtons}>
                    <TouchableOpacity style={styles.aiControlButton} onPress={onRevert}>
                        <Text style={styles.aiControlButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.aiControlButton, styles.aiConfirmButton]} onPress={onConfirm}>
                        <Text style={[styles.aiControlButtonText, styles.aiConfirmButtonText]}>확정</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    
    const handleCreateScheduleFromAI = async (selectedAttractions, aiOptions, aiResponseData) => {
        console.log('AI 응답 데이터 받음:', aiResponseData);
        
        try {
            setIsAiLoading(true);
            
            // ✅ 핵심 수정: period 정보를 함께 전달
            const transformedSchedules = await transformAIResponseToSchedules(
                aiResponseData, 
                currentTourId, 
                period  
            );
            
            setAiSchedules({ ...transformedSchedules });
            setIsAiBottomSheetVisible(true);
            
            console.log('AI 일정 임시 저장 완료:', transformedSchedules);
            
        } catch (error) {
            console.error('AI 응답 처리 실패:', error);
            Alert.alert("오류", "AI 일정을 처리하는데 실패했습니다.");
        } finally {
            setIsAiLoading(false);
        }
    };

    // AI 응답을 스케줄 형식으로 변환하는 함수
    const transformAIResponseToSchedules = async (aiData, travelId, period = { type: 'date' }) => {
    const schedules = {};
    if (!aiData || typeof aiData !== 'object') return schedules;

    const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const isOverlapping = (existingSchedules, newSchedule) => {
        return existingSchedules.some(s => {
            const sStart = parseTime(s.startTime);
            const sEnd = parseTime(s.endTime);
            const nStart = parseTime(newSchedule.startTime);
            const nEnd = parseTime(newSchedule.endTime);
            return nStart < sEnd && nEnd > sStart;
        });
    };

    // 🔥 핵심 수정: 실제 날짜를 기반으로 day 번호 계산
    Object.keys(aiData).forEach(dateKey => {
        let dayKey;

        // "2일차", "Day 2", "day2" 등에서 숫자만 추출
        const match = dateKey.match(/\d+/); 

        if (match) {
            // 숫자를 성공적으로 찾았으면 해당 숫자로 dayKey 생성
            const dayNumber = match[0];
            dayKey = `day${dayNumber}`;
            console.log(`🔄 문자열 키 매핑: "${dateKey}" -> ${dayKey}`);

        } else if (period.type === 'date' && period.startDate) {
            // 날짜 기반: 실제 날짜와 시작일의 차이로 day 번호 계산 (기존 로직 유지)
            const tripStartDate = new Date(period.startDate);
            const currentDate = new Date(dateKey);

            // currentDate가 유효한 날짜인지 확인
            if (!isNaN(currentDate.getTime())) { 
                const dayDiff = Math.floor((currentDate - tripStartDate) / (1000 * 60 * 60 * 24));
                const dayNumber = dayDiff + 1;
                dayKey = `day${dayNumber}`;
                console.log(`🔄 날짜 매핑: ${dateKey} -> ${dayKey} (시작일: ${period.startDate})`);
            } else {
                // 유효하지 않은 날짜 형식일 경우 순서 기반으로 대체 처리
                const dateIndex = Object.keys(aiData).indexOf(dateKey);
                dayKey = `day${dateIndex + 1}`;
                console.warn(`⚠️ 유효하지 않은 날짜 형식 "${dateKey}". 순서 기반으로 매핑합니다: ${dayKey}`);
            }

        } else {
            // 위 조건에 모두 해당하지 않을 경우, 최후의 수단으로 순서 기반 매핑
            const dateIndex = Object.keys(aiData).indexOf(dateKey);
            dayKey = `day${dateIndex + 1}`;
            console.log(`🔄 순서 기반 매핑: ${dateKey} -> ${dayKey}`);
        }
        
        const dayActivities = Array.isArray(aiData[dateKey]) ? aiData[dateKey] : [];
        schedules[dayKey] = [];

        const existingDaySchedules = combinedScheduleData[dayKey] || [];

        dayActivities.forEach((activity, activityIndex) => {
            // 1️⃣ 기존 일정 끝나는 시간 기준
            let startTimeMinutes = 9 * 60; // 기본 9:00
            if (existingDaySchedules.length > 0) {
                const latestEnd = existingDaySchedules
                    .map(s => parseTime(s.endTime))
                    .sort((a, b) => b - a)[0];
                startTimeMinutes = Math.max(startTimeMinutes, latestEnd);
            }

            // 2️⃣ AI 일정 길이
            const duration = (activity.stayDuration || 2) * 60;
            let endTimeMinutes = startTimeMinutes + duration;

            // 3️⃣ 겹치면 30분씩 밀기
            while (isOverlapping(existingDaySchedules, {
                startTime: `${Math.floor(startTimeMinutes/60).toString().padStart(2,'0')}:${(startTimeMinutes%60).toString().padStart(2,'0')}`,
                endTime: `${Math.floor(endTimeMinutes/60).toString().padStart(2,'0')}:${(endTimeMinutes%60).toString().padStart(2,'0')}`
            })) {
                startTimeMinutes += 30;
                endTimeMinutes = startTimeMinutes + duration;
            }

            const schedule = {
                id: `ai_${Date.now()}_${Math.random()}_${activityIndex}`,
                title: activity.scheduleTitle || activity.attractionName || '일정',
                startTime: `${Math.floor(startTimeMinutes/60).toString().padStart(2,'0')}:${(startTimeMinutes%60).toString().padStart(2,'0')}`,
                endTime: `${Math.floor(endTimeMinutes/60).toString().padStart(2,'0')}:${(endTimeMinutes%60).toString().padStart(2,'0')}`,
                location: activity.location || activity.attractionName || '',
                memo: activity.tip || '',
                tag: '관광',
                isAiSuggestion: true,
                categoryColor: scheduleUtils.getCategoryStyle('관광').borderColor,
            };

            // 🔥 수정: 실제 날짜 정보도 포함
            if (period.type === 'date') {
                schedule.date = dateKey;
            } else {
                schedule.dayDescription = dayKey.replace('day', 'Day ');
            }

            existingDaySchedules.push(schedule);
            schedules[dayKey].push(schedule);
        });
    });

    console.log('🔄 최종 AI 스케줄 매핑:', schedules);
    return schedules;
};



    // 나머지 기존 함수들은 동일하게 유지...
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

            const periodTypeMap = { 1: 'date', 2: 'duration' };
            const currentPeriodType = periodTypeMap[data.periodType] || 'date';
            
            console.log('🔍 [Debug] 현재 여행 타입:', currentPeriodType, '(DB periodType:', data.periodType, ')');

            const mappedScheduleData = {};
            if (data.schedules && Array.isArray(data.schedules)) {
                console.log('🔍 [Debug] 전체 스케줄 개수:', data.schedules.length);
                
                if (currentPeriodType === 'date' && data.startDate) {
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
                        
                        const normalizedScheduleDate = scheduleDate.startOf('day');
                        const normalizedTripStartDate = tripStartDate.startOf('day');
                        const dayNumber = normalizedScheduleDate.diff(normalizedTripStartDate, 'day') + 1;
                        
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
                    console.log('🔍 [Debug] 기간 기반 여행 - dayDescription 기준 매핑');
                    
                    data.schedules.forEach((schedule, index) => {
                        if (!schedule) return; 

                        let dayKey;

                        if (schedule.dayDescription) {
                            const dayMatch = schedule.dayDescription.match(/\d+/);
                            
                            if (dayMatch && dayMatch[0]) {
                                dayKey = `day${dayMatch[0]}`;
                            } else {
                                dayKey = 'day1';
                                console.warn(`🚨 스케줄 ${schedule.id}의 dayDescription 형식이 이상해 Day 1에 배정합니다.`);
                            }
                        } else {
                            dayKey = 'day1';
                            console.warn(`🚨 스케줄 ${schedule.id}의 dayDescription이 없어 Day 1에 배정합니다.`);
                        }
                        
                        console.log(`✅ [Debug] 스케줄 ${schedule.id}: ${schedule.dayDescription} -> ${dayKey} (최종)`);
                        
                        if (!mappedScheduleData[dayKey]) {
                            mappedScheduleData[dayKey] = [];
                        }
                        
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

    // 나머지 함수들 (기존과 동일)...
    const getCleanScheduleData = (data) => {
        const cleanData = {};
        Object.keys(data).forEach(dayKey => {
            cleanData[dayKey] = data[dayKey].map(item => ({
                id: item.id,
                date: item.date,
                dayDescription: item.dayDescription,
                title: item.title,
                tag: item.tag,
                location: item.location,
                latitude: item.latitude || item.y || 0,
                longitude: item.longitude || item.x || 0,
                memo: item.memo
            }));
        });
        return cleanData;
    };

    const handleEditInfoPress = () => {
        setIsEditModalVisible(true);
    };

    const handleSaveEditInfo = async (updatedData) => {
        if (!updatedData.title.trim()) {
            Alert.alert("알림", "제목을 입력해주세요.");
            return;
        }

        const isDateType = updatedData.startDate !== null;

        const tourDataForUpdate = {
            title: updatedData.title,
            regions: regions,
            periodType: isDateType ? 1 : 2,
            startDate: updatedData.startDate,
            endDate: updatedData.endDate,
            nightCount: updatedData.nights,
            dayCount: updatedData.days,
            attractions: selectedAttractions,
            schedule: scheduleData,
            members: members,
            ownerId: currentUserId
        };

        console.log('4️⃣ 부모: API에 보낼 최종 데이터 ->', tourDataForUpdate);

        try {
            await updateTour(currentTourId, tourDataForUpdate);
            console.log('여행 정보 업데이트 성공');
            await fetchTourData(); 
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
            setIsAutoSaving(true);
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
                setIsAutoSaving(false);
                console.log("🏁 자동 저장이 종료되었습니다.");
            }
        };

        updateServer();
    }, [scheduleData, selectedAttractions, title, regions, period, members, currentTourId, isDataLoaded]);

    // 나머지 핸들러 함수들도 기존과 동일...
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

    // 나머지 핸들러들도 동일... (handleScheduleAdded, performDeleteSchedule, etc.)
    
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

            // 시간 중복 검사
            const timeToMinutes = (timeString) => {
                if (!timeString || !timeString.includes(':')) return 0;
                const [hours, minutes] = timeString.split(':').map(Number);
                return (hours || 0) * 60 + (minutes || 0);
            };

            const checkOverlap = (newSchedule, existingSchedules) => {
                const newStart = timeToMinutes(newSchedule.startTime);
                const newEnd = timeToMinutes(newSchedule.endTime);

                for (const existingSchedule of existingSchedules) {
                    const existingStart = timeToMinutes(existingSchedule.startTime);
                    const existingEnd = timeToMinutes(existingSchedule.endTime);

                    if (newStart < existingEnd && existingStart < newEnd) {
                        return true; // 중복 발견
                    }
                }
                return false; // 중복 없음
            };

            const dayKey = newScheduleData.date 
                ? dayjs(newScheduleData.date).diff(dayjs(period.startDate), 'day') + 1 
                : parseInt((newScheduleData.dayDescription || '').match(/\d+/)[0], 10);
            
            const existingSchedulesForDay = scheduleData[`day${dayKey}`] || [];

            // 수정 모드일 경우, 현재 수정 중인 스케줄은 중복 검사에서 제외
            const schedulesToCheck = existingSchedulesForDay.filter(s => s.id !== newScheduleData.id);

            if (checkOverlap(newScheduleData, schedulesToCheck)) {
                Alert.alert('오류', '선택한 시간에 이미 다른 일정이 있습니다.');
                setScheduleLoading(false);
                return; // 저장 방지
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

    // 일정 삭제 핸들러
    const performDeleteSchedule = async (scheduleId) => {
        console.log(`[Delete Flow] Starting deletion for schedule ID: ${scheduleId}`);
        setScheduleLoading(true);
        try {
            console.log(`[Delete Flow] About to call deleteTravelSchedule with ID: ${scheduleId}`);
            const deleteResult = await deleteTravelSchedule(scheduleId);
            console.log(`[Delete Flow] deleteTravelSchedule API call result: ${deleteResult}`);

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

    // 나머지 핸들러들
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

    const handleMemberPress = () => setShowMemberPopup(true);
    const handleCloseMemberPopup = () => setShowMemberPopup(false);
    const handleMemberDelete = (memberToDelete) => {
        setMembers(prev => prev.filter(member => member.userId !== memberToDelete.userId));
    };
    const handleMemberAdd = (newMember) => setMembers(prev => [...prev, newMember]);

    const handleAddSchedule = (...args) => {
        console.log("handleAddSchedule 호출된 데이터(args):", args);

        let options = {};
        // 인자가 하나이고, 객체이며, startTime 속성을 가지고 있는지 확인
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].startTime !== undefined) {
            // CASE A: 여유시간 추가에서 호출된 경우
            options = args[0];
        } else {
            // CASE B: 그 외 다른 모든 경우
            options = {
                day: args[0],
                date: args[1],
                hour: args[2],
                attraction: args[3],
                locationValue: args[4] || ''
            };
        }

        console.log('handleAddSchedule 호출:', options);
        console.log('현재 period:', period);

        const title = options.attraction?.name || '';

        const popupData = {
            selectedDay: options.day || options.selectedDay,
            existingSchedule: null,
            location: options.locationValue,
            title: title,
            startTime: options.startTime,
            endTime: options.endTime,
            hour: options.hour,
        };

        if (period.type === 'date') {
            popupData.selectedDate = options.date || (period.startDate ? dayjs(period.startDate).add(popupData.selectedDay - 1, 'day').format('YYYY-MM-DD') : null);
            popupData.dayDescription = null;
        } else if (period.type === 'duration') {
            popupData.selectedDate = null;
            popupData.dayDescription = `Day ${popupData.selectedDay}`;
        }

        console.log('AddSchedule 팝업으로 보낼 최종 데이터:', popupData);
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

        if (period.type === 'date') {
            popupData.selectedDate = blockData.date;
            popupData.dayDescription = null;
            console.log('날짜 기반 - selectedDate:', popupData.selectedDate);
        } else if (period.type === 'duration') {
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
        setLocation('');
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
            const daySchedules = combinedScheduleData[`day${selectedDay}`] || [];
            return (
                <Schedule
                    schedules={daySchedules}
                    onAddSchedule={handleAddSchedule}
                    onScheduleDelete={handleScheduleDelete}
                    onUpdateSchedule={schedule => handleTimeBlockClick({ existingSchedule: schedule, day: selectedDay })}
                    selectedDay={selectedDay}
                    onSelectSchedule={handleSelectSchedule}
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
                    scheduleData={combinedScheduleData} 
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
            {/* AI 추천 관련 UI */}
            {isAiBottomSheetVisible && (
                <AiScheduleControls 
                    onConfirm={handleConfirmAiSchedules}
                    onRetry={handleRetryAiSchedules}
                    onRevert={handleRevertAiSchedules}
                />
            )}

            {/* 일정 상세 보기 모달 */}
            {selectedSchedule && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={!!selectedSchedule}
                    onRequestClose={() => setSelectedSchedule(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.scheduleDetailContainer}>
                            <Text style={styles.scheduleDetailTitle}>{selectedSchedule.title}</Text>
                            <Text style={styles.scheduleDetailTime}>
                                {selectedSchedule.startTime} - {selectedSchedule.endTime}
                            </Text>
                            {selectedSchedule.location && (
                                <Text style={styles.scheduleDetailLocation}>{selectedSchedule.location}</Text>
                            )}
                            {/* AI 일정일 경우에만 팁(memo) 표시 */}
                            {selectedSchedule.isAiSuggestion && selectedSchedule.memo && (
                                <View style={styles.aiTipContainer}>
                                    <Text style={styles.aiTipLabel}>AI 팁:</Text>
                                    <Text style={styles.aiTipText}>{selectedSchedule.memo}</Text>
                                </View>
                            )}
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setSelectedSchedule(null)}
                            >
                                <Text style={styles.closeButtonText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            <DesignItineraryHeader 
                title={title}
                dateRange={dateInfo.displayText}
                startDate={dateInfo.startDate}
                endDate={dateInfo.endDate}
                days={period.days}
                nights={period.nights}
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
                onCreateSchedule={handleCreateScheduleFromAI}
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
                    periodType={period.type}
                    startDate={period.startDate}
                    endDate={period.endDate}
                    days={period.days}
                    nights={period.nights}
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
                                        setShowConfirmModal(false);
                                        const scheduleIdToDelete = scheduleToDelete;
                                        setScheduleToDelete(null);
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

            {/* AI 로딩 오버레이 */}
            {isAiLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingTextWhite}>AI가 최적의 일정을 만들고 있어요...</Text>
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
    // AI 제어 버튼 스타일
    aiControlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        zIndex: 999,
    },
    aiControlsContent: {
        alignItems: 'center',
    },
    aiControlsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    aiControlsButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    aiControlButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    aiConfirmButton: {
        backgroundColor: '#007BFF',
    },
    aiControlButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    aiConfirmButtonText: {
        color: '#fff',
    },
    // 일정 상세 모달 스타일
    scheduleDetailContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
    },
    scheduleDetailTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    scheduleDetailTime: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    scheduleDetailLocation: {
        fontSize: 14,
        color: '#888',
        marginBottom: 15,
    },
    aiTipContainer: {
        backgroundColor: '#f8f9ff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        width: '100%',
        borderLeftWidth: 4,
        borderLeftColor: '#007BFF',
    },
    aiTipLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 5,
    },
    aiTipText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    closeButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});