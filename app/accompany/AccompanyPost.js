import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Text, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EventSchedule from '../../components/accompany/EventSchedule';
import Comment from '../../components/accompany/Comment';
import Reply from '../../components/accompany/Reply';
import Intro from '../../components/accompany/Intro';
import GatheringPlace from '../../components/accompany/GatheringPlace';
import Conditions from '../../components/accompany/Conditions';
import Categories from '../../components/accompany/Categories';
import WriteComment from '../../components/accompany/WriteComment';
import ApplicationButton from '../../components/accompany/ApplicationButton';
import AccompanyCloseButton from '../../components/accompany/AccompanyCloseButton';
import AlarmPopup from '../../components/accompany/AlarmPopup';
import MemberPopup from '../../components/accompany/MemberPopup';
import EventHeader from '../../components/accompany/EventHeader';

// Mock data - This would come from your backend in production
const mockPosts = [
  {
    id: '1',
    title: "화천 산천어 축제 동행 구해요!",
    location: "강원도 화천",
    createdAt: "2025.03.01",
    images: [],
    views: 122,
    travelStartDate: "3월4일(월) 13:00",
    travelEndDate: "3월4일(월) 19:00",
    recruitStartDate: "3월1일(금)",
    recruitEndDate: "3월3일(일)",
    description: "화천 산천어 축제 함께 갈 메이트 구해요. 얼음낚시부터 눈썰매, 다양한 먹거리까지 같이 즐겁게 겨울을 보내요! ⛄️❄️",
    meetingPoint: "강원도 화천 산천어 축제",
    member: ["user001", "user002"],
    applymember: ["user003","user004"],
    gender: "여자만",
    ageRange: ["20대", "30대"],
    category: ["아웃도어", "축제", "힐링여행"],
    tags: ["자유로운", "낚시대결", "활기찬사람", "회떠먹기"],
    currentParticipants: 3,
    maxParticipants: 5,
    createdBy: "user001",
    likes: 122
  },
//   {
//     id: '2',
//     location: "공주 공산성",
//     hostName: "민지",
//     postDate: "2025.03.02",
//     views: "89회",
//     eventDate: "3월4일(월)",
//     eventTimeStart: "16:00",
//     eventTimeEnd: "21:00",
//     recruitStart: "3월1일(금)",
//     recruitEnd: "3월3일(일)",
//     message: "공주 공산성에서 야경 같이 즐겨요! 저녁식사도 함께하고 여유롭게 산책하면서 사진도 찍어요.",
//     gatheringPlace: "공주 공산성 주차장",
//     gender: "여자만",
//     ageGroups: ["20대"],
//     types: ["야경", "산책", "사진찍기"],
//     tags: ["여유로운", "공주시", "야경투어", "걷기"],
//     participantsCurrent: 2,
//     participantsTotal: 3,
//     hostId: "user002",
//     likes: 78
//   },
//   {
//     id: '3',
//     location: "홍천",
//     hostName: "준호",
//     postDate: "2025.02.28",
//     views: "156회",
//     trableStartDate: "3월1일(금)",
//     eventTimeStart: "09:00",
//     eventTimeEnd: "18:00",
//     recruitStart: "2월25일(월)",
//     recruitEnd: "2월29일(목)",
//     message: "홍천 산천어 축제에서 놀아요! 홍천에서 1박 2일로 여행 계획중입니다. 맛있는 음식도 먹고 즐거운 추억 만들어요.",
//     gatheringPlace: "홍천버스터미널",
//     gender: "남녀무관",
//     ageGroups: ["20대", "30대"],
//     types: ["축제", "맛집"],
//     tags: ["활기찬", "산천어", "여행"],
//     participantsCurrent: 2,
//     participantsTotal: 4,
//     hostId: "user003",
//     likes: 102
//   },
//   {
//     id: '4',
//     location: "부산",
//     hostName: "혜진",
//     postDate: "2025.03.03",
//     views: "211회",
//     eventDate: "4월1일(월)",
//     eventTimeStart: "10:00",
//     eventTimeEnd: "20:00",
//     recruitStart: "3월15일(금)",
//     recruitEnd: "3월30일(토)",
//     message: "부산 벚꽃축제 같이 가실 분 찾습니다. 해운대도 들르고 부산 맛집 탐방도 할 예정이에요!",
//     gatheringPlace: "부산역",
//     gender: "남녀무관",
//     ageGroups: ["누구나"],
//     types: ["벚꽃", "맛집탐방"],
//     tags: ["부산여행", "벚꽃구경", "맛집투어"],
//     participantsCurrent: 3,
//     participantsTotal: 4,
//     hostId: "user004",
//     likes: 188
//   }
];

export default function AccompanyPost() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { postId } = params;
    const [postData, setPostData] = useState(null);
    
    // 현재 사용자가 호스트인지 확인 (실제로는 인증 시스템에서 가져올 값)
    const currentUserId = "user001"; // 예시 사용자 ID
    const [isHost, setIsHost] = useState(false);
    
    const [showAlarmPopup, setShowAlarmPopup] = useState(false);
    const [showAlarmPopupHost, setShowAlarmPopupHost] = useState(false);
    const [closed, setClosed] = useState(false); 
    const [showMemberPopupGuest, setShowMemberPopupGuest] = useState(false);
    const [showMemberPopupHost, setShowMemberPopupHost] = useState(false);
    const [applied, setApplied] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const scrollViewRef = useRef(null);

    // postId를 사용하여 데이터 로드
    useEffect(() => {
        // 실제 구현에서는 API 호출로 대체할 부분
        const post = mockPosts.find(p => p.id === postId);
        if (post) {
            setPostData(post);
            // 현재 사용자가 호스트인지 확인
            setIsHost(post.createdBy === currentUserId);
        }
    }, [postId]);

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

    // 데이터가 로드되지 않았을 때 로딩 화면 표시
    if (!postData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>로딩 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    
                    {/* Event header card */}
                    <EventHeader 
                        title={postData.title}
                        location={postData.location} 
                        participants={postData.currentParticipants} 
                        maxParticipants={postData.maxParticipants}
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
                            <Text>{postData.createdBy} </Text>
                            <Text style={styles.hostInfoLabel}>게시일 </Text>
                            <Text>{postData.createdAt} </Text>
                            <Text style={styles.hostInfoLabel}>조회수 </Text>
                            <Text>{postData.views}회</Text>
                        </Text>
                    </View>

                    <EventSchedule
                        travelStartDate={postData.travelStartDate}
                        travelEndDate={postData.travelEndDate}
                        recruitStartDate={postData.recruitStartDate}
                        recruitEndDate={postData.recruitEndDate}
                    />
                    <Intro
                        message={postData.description}
                    />
                    <GatheringPlace
                        location={postData.meetingPoint}
                    />    
                    <Conditions 
                        gender={postData.gender} 
                        ageRange={postData.ageRange} 
                    />
                    <Categories
                        category={postData.category} 
                        tags={postData.tags} 
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
                        likes={postData.likes}
                        closed={false}
                    />
                )}
                
                {/* Host: Close recruitment button */}
                {isHost && (
                    <AccompanyCloseButton
                        title={closed ? "모집이 마감된 동행입니다." : "모집 마감"}
                        onPress={handleClosedPress}
                        likes={postData.likes}
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