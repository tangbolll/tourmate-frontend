import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DesignItineraryHeader from '../../../components/mytour/designItinerary/designItineraryHeader';
import DateSelectButtons from '../../../components/mytour/designItinerary/DateSelectButtons';
import BottomSheet from '../../../components/mytour/designItinerary/BottomSheet';
import AiItineraryDesignPopup from '../../../components/mytour/designItinerary/AiItineraryDesignPopup';
import MemberPopup from '../../../components/mytour/designItinerary/MemberPopup'; // MemberPopup import 추가
import ItineraryWithSchedule from '../../../components/mytour/designItinerary/ItineraryWithSchedule';  

export default function DesignItinerary() {
    const router = useRouter();
    const { selectedRegions, itineraryTitle, periodData } = useLocalSearchParams();
    
    // 전달받은 데이터들을 파싱
    const regions = selectedRegions ? JSON.parse(selectedRegions) : [];
    const title = itineraryTitle || '';
    const period = periodData ? JSON.parse(periodData) : {};
    
    // 선택된 관광지 상태 관리
    const [selectedAttractions, setSelectedAttractions] = useState([]);
    
    // AI 일정 디자인 팝업 상태
    const [showAiPopup, setShowAiPopup] = useState(false);
    
    // 멤버 팝업 상태 추가
    const [showMemberPopup, setShowMemberPopup] = useState(false);
    
    // 임시 멤버 데이터 (실제로는 props나 API에서 받아올 데이터)
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

    const handleDaySelect = (dayNumber) => {
        console.log('선택된 일차:', dayNumber);
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
        setShowActionButtons(true); // 버튼 세 개 보여주기
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

    const dateInfo = formatDateRange();

    return (
        <SafeAreaView style={styles.container}>
            <DesignItineraryHeader 
                title={title}
                dateRange={dateInfo.displayText}
                startDate={dateInfo.startDate}
                endDate={dateInfo.endDate}
                periodType={period.type}
                onBackPress={handleBackPress}
                onMemberPress={handleMemberPress} // 멤버 아이콘 클릭 핸들러 전달
            />
            
            <DateSelectButtons
                periodType={period.type}
                startDate={period.startDate}
                endDate={period.endDate}
                nights={period.nights}
                days={period.days}
                onDaySelect={handleDaySelect}
            />
            

                <ItineraryWithSchedule 
                    periodType={period.type}
                    startDate={period.startDate}
                    endDate={period.endDate}
                    nights={period.nights}
                    days={period.days}
                />


            <BottomSheet
                regions={regions}
                onAttractionToggle={handleAttractionToggle}
                selectedAttractions={selectedAttractions}
                onAiItineraryPress={handleAiItineraryPress}
                showActionButtons={showActionButtons}
                onConfirmItinerary={() => setShowActionButtons(false)} // 일정 확정
                onGoBack={() => setShowActionButtons(false)} // 뒤로가기
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

            {/* MemberPopup을 최상위 레벨에서 렌더링 */}
            {showMemberPopup && (
                <MemberPopup 
                    members={members}
                    onClose={handleCloseMemberPopup}
                    onMemberDelete={handleMemberDelete}
                    onMemberAdd={handleMemberAdd}
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