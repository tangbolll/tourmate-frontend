import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DesignItineraryHeader from '../../../components/mytour/designItinerary/designItineraryHeader';
import DateSelectButtons from '../../../components/mytour/designItinerary/DateSelectButtons';
import BottomSheet from '../../../components/mytour/designItinerary/BottomSheet';
import AiItineraryDesignPopup from '../../../components/mytour/designItinerary/AiItineraryDesignPopup';
import MemberPopup from '../../../components/mytour/designItinerary/MemberPopup';
import ItineraryWithSchedule from '../../../components/mytour/designItinerary/ItineraryWithSchedule';
import Schedule from '../../../components/mytour/designItinerary/schedule/Schedule';
import AddSchedule from '../../../components/mytour/designItinerary/AddSchedule';

export default function DesignItinerary() {
    const router = useRouter();
    const { selectedRegions, itineraryTitle, periodData } = useLocalSearchParams();
    
    // 전달받은 데이터들을 파싱
    const regions = selectedRegions ? JSON.parse(selectedRegions) : [];
    const title = itineraryTitle || '';
    const period = periodData ? JSON.parse(periodData) : {};
    
    // 선택된 관광지 상태 관리
    const [selectedAttractions, setSelectedAttractions] = useState([]);
    
    // 선택된 날짜 상태 관리
    const [selectedDay, setSelectedDay] = useState(null);
    
    // 그리드 모드 상태 관리
    const [isGridMode, setIsGridMode] = useState(false);
    
    // AddSchedule 팝업 상태 - 중앙 집중식으로 관리
    const [showAddSchedulePopup, setShowAddSchedulePopup] = useState(false);
    const [schedulePopupData, setSchedulePopupData] = useState(null);
    
    // AI 일정 디자인 팝업 상태
    const [showAiPopup, setShowAiPopup] = useState(false);
    
    // 멤버 팝업 상태
    const [showMemberPopup, setShowMemberPopup] = useState(false);
    
    // 일정 데이터 상태
    const [scheduleData, setScheduleData] = useState({});
    
    // 임시 멤버 데이터
    const [members, setMembers] = useState([
        {
            id: 'current_user',
            name: '여라미',
            gender: '여',
            age: 22,
            isUser: true,
            tags: ['즉흥적인', '계획가', '유머러스']
        },
        {
            id: 'member1',
            name: '지백',
            gender: '여',
            age: 24,
            isUser: false,
            tags: ['무계획여행', '맛집탐방']
        },
        {
            id: 'member2',
            name: '주리를틀어라',
            gender: '여',
            age: 21,
            isUser: false,
            tags: ['힐링', '탐험', '맛집탐방']
        }
    ]);
    
    console.log('전달받은 데이터들:');
    console.log('- 지역 데이터:', regions);
    console.log('- 여행 제목:', title);
    console.log('- 기간 데이터:', period);
    console.log('- 기간 타입:', period.type);
    
    if (period.type === 'date') {
        console.log('- 시작 날짜:', period.startDate);
        console.log('- 종료 날짜:', period.endDate);
    } else if (period.type === 'duration') {
        console.log('- 숙박 기간:', period.nights + '박');
        console.log('- 총 기간:', period.days + '일');
    }

    // 날짜 포맷팅 함수
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
        router.back();
    };

    // 날짜 선택 핸들러
    const handleDaySelect = (dayNumber) => {
        console.log('선택된 일차:', dayNumber);
        setSelectedDay(dayNumber);
        setIsGridMode(false);
    };

    // 그리드 토글 핸들러
    const handleGridToggle = (gridMode) => {
        console.log('그리드 모드:', gridMode);
        setIsGridMode(gridMode);
        if (gridMode) {
            setSelectedDay(null);
        }
    };

    // 관광지 선택/해제 핸들러
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

    // AI 일정 버튼 클릭 핸들러
    const [showActionButtons, setShowActionButtons] = useState(false);
    
    const handleAiItineraryPress = () => {
        setShowAiPopup(true);
    };

    const handleAiPopupConfirm = (result) => {
        setShowActionButtons(true);
    };

    // 멤버 아이콘 클릭 핸들러
    const handleMemberPress = () => {
        setShowMemberPopup(true);
    };

    const handleCloseMemberPopup = () => {
        setShowMemberPopup(false);
    };

    // 멤버 삭제 핸들러
    const handleMemberDelete = (memberToDelete) => {
        setMembers(prev => prev.filter(member => member.id !== memberToDelete.id));
    };

    // 멤버 추가 핸들러
    const handleMemberAdd = (newMember) => {
        setMembers(prev => [...prev, newMember]);
    };

    // 일정 추가 핸들러 - 통합 관리
    const handleAddSchedule = (selectedDay, selectedDate = null, selectedHour = null) => {
        console.log('일정 추가 요청 - 선택된 날짜:', selectedDay, '선택된 시간:', selectedHour);
        
        setSchedulePopupData({
            selectedDay: selectedDay,
            selectedDate: selectedDate,
            selectedHour: selectedHour,
            existingSchedule: null
        });
        setShowAddSchedulePopup(true);
    };

    // 블록 클릭 핸들러 - 통합 관리
    const handleTimeBlockClick = (blockData) => {
        console.log('블록 클릭:', blockData);
        
        setSchedulePopupData({
            selectedDay: blockData.day || null,
            selectedDate: blockData.date || null,
            selectedHour: blockData.hour || null,
            existingSchedule: blockData.existingSchedule || null
        });
        setShowAddSchedulePopup(true);
    };

    // AddSchedule 팝업 닫기 핸들러
    const handleCloseAddSchedulePopup = () => {
        console.log('AddSchedule 팝업 닫기');
        setShowAddSchedulePopup(false);
        setSchedulePopupData(null);
    };

    // 일정 추가 완료 핸들러
    const handleScheduleAdded = (newScheduleData) => {
        console.log('새 일정 추가:', newScheduleData);
        
        // 일정 데이터를 상태에 저장
        setScheduleData(prev => {
            // 날짜 또는 day 기반으로 키 생성
            let dayKey;
            if (newScheduleData.day) {
                dayKey = `day${newScheduleData.day}`;
            } else if (schedulePopupData?.selectedDay) {
                dayKey = `day${schedulePopupData.selectedDay}`;
            } else {
                // 날짜 기반으로 day 계산
                dayKey = `day1`; // 기본값
            }
            
            const existingSchedules = prev[dayKey] || [];
            
            // 새 일정에 고유 ID 추가
            const scheduleWithId = {
                ...newScheduleData,
                id: newScheduleData.id || Date.now().toString(),
                day: schedulePopupData?.selectedDay || 1
            };
            
            console.log('일정 저장 완료:', scheduleWithId);
            
            return {
                ...prev,
                [dayKey]: [...existingSchedules, scheduleWithId]
            };
        });
        
        // 팝업 닫기
        handleCloseAddSchedulePopup();
    };

    // 일정 삭제 핸들러
    const handleScheduleDelete = (scheduleId, day) => {
        console.log('일정 삭제 요청:', scheduleId, day);
        
        setScheduleData(prev => {
            const dayKey = `day${day}`;
            const existingSchedules = prev[dayKey] || [];
            
            const updatedSchedules = existingSchedules.filter(schedule => schedule.id !== scheduleId);
            console.log('삭제 후 남은 일정들:', updatedSchedules);
            
            return {
                ...prev,
                [dayKey]: updatedSchedules
            };
        });
    };

    const dateInfo = formatDateRange();

    // 현재 보여줄 컨텐츠 결정
    const renderMainContent = () => {
        if (selectedDay) {
            // 날짜가 선택된 경우: Schedule 컴포넌트 표시
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
            // 그리드 모드인 경우: 일정 생성 블록이 있는 탭 표시
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
            // 기본 상태: 일반 일정 표시
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
                onConfirmItinerary={() => setShowActionButtons(false)}
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

            {/* 중앙 집중식 AddSchedule 팝업 관리 */}
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