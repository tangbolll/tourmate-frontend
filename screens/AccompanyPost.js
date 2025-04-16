import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Text, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import EventSchedule from '../components/EventSchedule';
import Comment from '../components/Comment';
import Reply from '../components/Reply';
import Intro from '../components/Intro';
import GatheringPlace from '../components/GatheringPlace';
import Conditions from '../components/Conditions';
import Categories from '../components/Categories';
import WriteComment from '../components/WriteComment';
import ApplicationButton from '../components/ApplicationButton';
import AccompanyCloseButton from '../components/AccompanyCloseButton';
import AlarmPopup from '../components/AlarmPopup';
import MemberPopup from '../components/MemberPopup';
import EventHeader from '../components/EventHeader';

export default function App() {
    const [isHost] = useState(false);
    const [showAlarmPopup, setShowAlarmPopup] = useState(false);
    const [showAlarmPopupHost, setShowAlarmPopupHost] = useState(false);
    const [closed, setClosed] = useState(false); 
    const [showMemberPopupGuest, setShowMemberPopupGuest] = useState(false);
    const [showMemberPopupHost, setShowMemberPopupHost] = useState(false);
    const [applied, setApplied] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const scrollViewRef = useRef(null);

    // Host information
    const hostInfo = {
        hostName: "여라미",
        postDate: "2025.03.01",
        views: "122회"
    };

    // Keyboard listeners to handle scrolling when keyboard appears
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleApplicationPress = () => {
        setApplied((prev) => !prev);
        setShowAlarmPopup(true);
    };

    const handleCloseAlarmPopup = () => {
        setShowAlarmPopup(false);
    };

    const handleParticipantsClick = () => {
        if (isHost) {
            setShowMemberPopupHost(true);
        } else {
            setShowMemberPopupGuest(true);
        }
    };

    const handleCloseMemberPopup = () => {
        setShowMemberPopupGuest(false);
        setShowMemberPopupHost(false);
    };

    const handleClosedPress = () => {
        setShowAlarmPopupHost(true);
    };

    const handleCloseAlarmPopupHost = () => {
        setShowAlarmPopupHost(false);
    };

    const handleConfirmClose = () => {
        setClosed(true);
        setShowAlarmPopupHost(false);
    };

    // 멤버 데이터
    const members = [
        {
            name: '여라미',
            gender: '여',
            age: '22',
            isHost: true,
            tags: ['즉흥적인 계획가', '유적지 탐방']
        },
        {
            name: '지백',
            gender: '여',
            age: '24',
            isHost: false,
            tags: ['무계획여행', '맛집탐방', '호캉스']
        },
        {
            name: '주리를틀어라',
            gender: '여',
            age: '21',
            isHost: false,
            tags: ['활기찬 탐험가', '맛집탐방', '국토순례']
        }
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{flex: 1}}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.scrollView} 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Gray background that scrolls with content */}
                    <View style={styles.grayBackground} />
                    
                    {/* Back button */}
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    
                    {/* Event header card */}
                    <EventHeader 
                        location="강원도 화천" 
                        participantsCurrent={3} 
                        participantsTotal={5}
                        onParticipantsClick={handleParticipantsClick}
                    />
                    
                    {/* More button outside header */}
                    <TouchableOpacity style={styles.moreButton}>
                        <Feather name="more-vertical" size={24} color="black" />
                    </TouchableOpacity>
                    
                    {/* Host info outside header */}
                    <View style={styles.hostInfoContainer}>
                        <Text style={styles.hostInfoText}>
                            <Text style={styles.hostInfoLabel}>호스트 </Text>
                            <Text>{hostInfo.hostName} </Text>
                            <Text style={styles.hostInfoLabel}>게시일 </Text>
                            <Text>{hostInfo.postDate} </Text>
                            <Text style={styles.hostInfoLabel}>조회수 </Text>
                            <Text>{hostInfo.views}</Text>
                        </Text>
                    </View>

                    <EventSchedule 
                        eventDate="3월4일(월)"
                        eventTimeStart="15:00"
                        eventTimeEnd="19:00"
                        recruitStart="3월1일(금)"
                        recruitEnd="3월3일(일)"
                    />
                    <Intro
                        message="화천 산천어 축제 함께 갈 메이트 구해요. 얼음낚시부터 눈썰매, 다양한 먹거리까지 같이 즐겁게 겨울을 보내요! ⛄️❄️"
                    />
                    <GatheringPlace
                        location={"강원도 화천 산천어 축제"}
                    />    
                    <Conditions 
                        gender="여자만" 
                        ageGroups={["20대", "30대"]} 
                    />
                    <Categories
                        types={["아웃도어", "축제", "힐링여행"]} 
                        tags={["자유로운", "낚시대결", "활기찬사람", "회떠먹기"]} 
                    />

                    <Comment 
                        nickname="나는야서휘경" 
                        time="1시간 전" 
                        content="안녕하세요~ 궁금한 게 있는데요 서휘경이랑 같이 가는 건가요?"
                        onReplyPress={() => console.log("답글 클릭")}
                    />
                    <Reply
                        nickname="여라미" 
                        time="30분 전" 
                        content="넹! 서휘경이랑 같이 가요~"
                        onReplyPress={() => console.log("답글 클릭")}
                    />

                    <WriteComment 
                        onSend={(comment) => console.log("댓글:", comment)} 
                        onFocus={() => {
                            // 키보드가 보이게 된 후 스크롤을 아래로 이동시키기 위한 지연 설정
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 300);
                        }}
                    />
                    
                    <View />
                </ScrollView>
                
                {/* Guest: Application button */}
                {!isHost && (
                    <ApplicationButton
                        title={applied ? "동행 취소" : "동행 신청"}
                        onPress={handleApplicationPress}
                        likes={122}
                    />
                )}
                
                {/* Host: Close recruitment button */}
                {isHost && (
                    <AccompanyCloseButton
                        title={closed ? "모집이 마감된 동행입니다." : "모집 마감"}
                        onPress={handleClosedPress}
                        likes={122}
                    />
                )}

                {/* Popups */}
                {showAlarmPopup && (
                    <AlarmPopup
                        alarmText={
                            applied
                                ? `동행을 신청하였습니다.\n호스트에 의해 동행이 수락 또는 거절되면 알림이 발송됩니다.\n신청한 동행은 취소할 수 있습니다.`
                                : `동행 신청이 취소되었습니다.\n다시 신청하시려면 아래 버튼을 눌러주세요.`
                        }
                        onClose={handleCloseAlarmPopup}
                    />
                )}

                {showAlarmPopupHost && (
                    <AlarmPopup
                        alarmText={`동행을 마감하시겠습니까?\n마감된 동행은 다시 되돌릴 수 없습니다.`}
                        onClose={handleCloseAlarmPopupHost}
                        onConfirm={handleConfirmClose}
                        confirmText="네"
                        cancelText="아니오"
                        confirmButtonStyle={styles.confirmButton}
                    />
                )}

                {showMemberPopupGuest && (
                    <MemberPopup
                        members={members}
                        onClose={handleCloseMemberPopup}
                    />
                )}

                {showMemberPopupHost && (
                    <MemberPopup 
                        members={members}
                        onClose={handleCloseMemberPopup}
                        isHost={true}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        position: 'relative',
    },
    grayBackground: {
        position: 'absolute',
        top: 0,
        left: -16,
        right: -16,
        height: 90,
        backgroundColor: '#b0b0b0',
        zIndex: -1,
    },
    backButton: {
        position: 'absolute',
        top: 12,
        left: 0,
        padding: 8,
        zIndex: 10,
    },
    moreButton: {
        position: 'absolute',
        top: 45,
        right: 9,
        padding: 8,
        zIndex: 10,
    },
    hostInfoContainer: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    hostInfoText: {
        fontSize: 12,
        color: '#000',
    },
    hostInfoLabel: {
        fontWeight: 'bold',
        color: '#000',
    },
    confirmButton: {
        backgroundColor: '#FF6B6B',
    },
});