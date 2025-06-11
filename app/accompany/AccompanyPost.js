import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Text, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
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

    // 댓글 상태 관리 (답글 포함)
    const [comments, setComments] = useState([
        {
            id: 1,
            nickname: "나는야서휘경",
            time: "1시간 전",
            content: "안녕하세요~ 궁금한 게 있는데요 서휘경이랑 같이 가는 건가요?",
            profileImage: null,
            isHost: false,
            replies: [
                {
                    id: 101,
                    nickname: "여라미",
                    time: "30분 전", 
                    content: "넹! 서휘경이랑 같이 가요~",
                    profileImage: null,
                    isHost: true
                }
            ]
        }
    ]);

    // 현재 답글을 달고 있는 댓글 ID (null이면 일반 댓글 모드)
    const [replyingTo, setReplyingTo] = useState(null);

    // 서버에 댓글/답글 저장하는 함수
    const saveToServer = async (data, isReply = false) => {
        try {
            // 실제 환경에서는 이 부분을 실제 API 호출로 교체
            await new Promise(resolve => setTimeout(resolve, 1000)); // 서버 지연 시뮬레이션
            
            // Mock 응답 데이터
            const mockResponse = {
                id: Date.now() + Math.random(),
                ...data,
                time: "방금 전",
                profileImage: null,
                isHost: currentUserId === "user001" // 현재 사용자가 호스트인지
            };
            
            return mockResponse;
        } catch (error) {
            console.error('서버 저장 실패:', error);
            throw error;
        }
    };

    // 일반 댓글 추가
    const handleAddComment = async (content) => {
        if (!content.trim()) return;

        const tempComment = {
            id: `temp_${Date.now()}`, // 문자열 ID로 충돌 방지
            nickname: "내닉네임", 
            time: "방금 전",
            content: content.trim(),
            profileImage: null,
            isHost: currentUserId === "user001",
            replies: [],
            isTemporary: true
        };

        // 즉시 화면에 추가
        setComments(prev => [...prev, tempComment]);

        // 스크롤 이동
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const savedComment = await saveToServer({
                content: content.trim(),
                postId: postId
            });

            // 서버 응답으로 업데이트
            setComments(prev => 
                prev.map(comment => 
                    comment.id === tempComment.id 
                        ? { ...savedComment, replies: [], isTemporary: false }
                        : comment
                )
            );

        } catch (error) {
            // 실패시 제거
            setComments(prev => 
                prev.filter(comment => comment.id !== tempComment.id)
            );
            
            Alert.alert("댓글 등록 실패", "댓글 등록에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 답글 추가
    const handleAddReply = async (content) => {
        if (!content.trim() || !replyingTo) return;

        const tempReply = {
            id: `temp_reply_${Date.now()}`,
            nickname: "내닉네임",
            time: "방금 전", 
            content: content.trim(),
            profileImage: null,
            isHost: currentUserId === "user001",
            isTemporary: true
        };

        // 해당 댓글에 답글 추가
        setComments(prev => 
            prev.map(comment => 
                comment.id === replyingTo 
                    ? { 
                        ...comment, 
                        replies: [...comment.replies, tempReply]
                      }
                    : comment
            )
        );

        // 답글 모드 해제
        setReplyingTo(null);

        // 스크롤 이동
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const savedReply = await saveToServer({
                content: content.trim(),
                parentCommentId: replyingTo,
                postId: postId
            }, true);

            // 서버 응답으로 업데이트
            setComments(prev => 
                prev.map(comment => 
                    comment.id === replyingTo
                        ? {
                            ...comment,
                            replies: comment.replies.map(reply =>
                                reply.id === tempReply.id
                                    ? { ...savedReply, isTemporary: false }
                                    : reply
                            )
                          }
                        : comment
                )
            );

        } catch (error) {
            // 실패시 답글 제거
            setComments(prev => 
                prev.map(comment => 
                    comment.id === replyingTo
                        ? {
                            ...comment,
                            replies: comment.replies.filter(reply => reply.id !== tempReply.id)
                          }
                        : comment
                )
            );
            
            Alert.alert("답글 등록 실패", "답글 등록에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 댓글 작성 핸들러 (댓글 vs 답글 구분)
    const handleSend = (content) => {
        if (replyingTo) {
            handleAddReply(content);
        } else {
            handleAddComment(content);
        }
    };

    // 답글 버튼 클릭 핸들러
    const handleReplyPress = (commentId) => {
        setReplyingTo(commentId);
        console.log("답글 모드 활성화:", commentId);
    };

    // 답글 취소
    const cancelReply = () => {
        setReplyingTo(null);
    };

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

                    {/* 댓글 목록 동적 렌더링 */}
                    {comments.map((comment) => (
                        <React.Fragment key={`comment_${comment.id}`}>
                            <Comment
                                profileImage={comment.profileImage}
                                nickname={comment.nickname}
                                time={comment.time}
                                content={comment.content}
                                isHost={comment.isHost}
                                onReplyPress={() => handleReplyPress(comment.id)}
                                style={comment.isTemporary ? { opacity: 0.7 } : {}}
                            />
                            
                            {/* 답글들 렌더링 */}
                            {comment.replies && comment.replies.map((reply) => (
                                <Reply
                                    key={`reply_${comment.id}_${reply.id}`}
                                    profileImage={reply.profileImage}
                                    nickname={reply.nickname}
                                    time={reply.time}
                                    content={reply.content}
                                    isHost={reply.isHost}
                                    onReplyPress={() => handleReplyPress(comment.id)}
                                    style={reply.isTemporary ? { opacity: 0.7 } : {}}
                                />
                            ))}
                        </React.Fragment>
                    ))}

                    <WriteComment 
                        onSend={handleSend}
                        onFocus={() => {
                            // 키보드가 보이게 된 후 스크롤을 아래로 이동시키기 위한 지연 설정
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 300);
                        }}
                        placeholder={
                            replyingTo 
                                ? "답글을 작성해주세요..." 
                                : "50자 내로 코멘트를 작성해주세요."
                        }
                        isReplyMode={!!replyingTo}
                        onCancel={cancelReply}
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