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
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어로 요일 띄우기

// API 설정 (AccompanyList.js와 동일)
const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    } else {
      return 'http://192.168.35.178:8080'; // 본인 IP로 변경
    }
  } else {
    return 'https://your-production-api.com';
  }
};

const API_URL = getApiUrl();

export default function AccompanyPost() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { postId } = params;
    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 현재 사용자가 호스트인지 확인 (실제로는 인증 시스템에서 가져올 값)
    const currentUserId = "2"; // 실제 사용자 ID로 변경
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
    const [comments, setComments] = useState([]);

    // 현재 답글을 달고 있는 댓글 ID (null이면 일반 댓글 모드)
    const [replyingTo, setReplyingTo] = useState(null);

    // 🎯 백엔드 데이터를 프론트엔드 형식으로 변환
    const transformAccompanyDetail = (backendData) => {
        if (!backendData) return null;

        return {
            id: backendData.id?.toString() || '1',
            title: backendData.title || '제목 없음',
            location: backendData.location || '위치 미정',
            createdAt: backendData.postDate ? 
                dayjs(backendData.postDate).locale('ko').format('M월 D일(ddd)') : 
                dayjs().locale('ko').format('M월 D일(ddd)'),
            images: backendData.imageUrl || [],
            views: backendData.views || 0,
            travelStartDate: backendData.tripStartDate ? 
                dayjs(backendData.tripStartDate).locale('ko').format('M월 D일(ddd)') : 
                '호스트에게 직접 문의해주세요.',
            travelEndDate: backendData.tripEndDate ? 
                dayjs(backendData.tripEndDate).locale('ko').format('M월 D일(ddd)') : 
                '',
            recruitStartDate: backendData.recStartDate ? 
                dayjs(backendData.recStartDate).locale('ko').format('M월 D일(ddd)') : 
                '호스트에게 직접 문의해주세요.',
            recruitEndDate: backendData.recEndDate ? 
                dayjs(backendData.recEndDate).locale('ko').format('M월 D일(ddd)') : 
                '',
            description: backendData.intro || '설명이 없습니다.',
            meetingPoint: backendData.meetPlace || '미정',
            member: backendData.participants?.map(p => p.userId?.toString()) || [],
            applymember: backendData.applicants?.map(a => a.userId?.toString()) || [],
            gender: backendData.gender === 'ALL' ? '남녀무관' : (backendData.gender || '미정'),
            ageRange: (backendData.ageGroup || []).map(age => age === "ALL" ? "누구나" : age),
            category: backendData.category || [],
            tags: backendData.tag || [],
            currentParticipants: backendData.participants?.length || 0,
            maxParticipants: backendData.maxRecruit || 0,
            createdBy: backendData.host?.userId?.toString() || 'unknown',
            createdByName: backendData.host?.nickname || '알 수 없음',
            likes: 0 // 추후 구현
        };
    };

    // 🌐 API에서 동행 상세 정보 가져오기
    const fetchAccompanyDetail = async (id) => {
        try {
            setLoading(true);
            setError(null);
            
            const url = `${API_URL}/api/accompany/AccompanyPost?postId=${id}`;
            console.log('🌐 동행 상세 조회 API 호출:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                timeout: 10000,
            });
            
            console.log('📡 응답 상태:', response.status);
            
            if (response.ok) {
                const backendData = await response.json();
                console.log('✅ 백엔드 원본 데이터:', backendData);
                
                // 백엔드 데이터를 프론트엔드 형식으로 변환
                const transformedData = transformAccompanyDetail(backendData);
                console.log('🔄 변환된 데이터:', transformedData);
                
                setPostData(transformedData);
                
                // 현재 사용자가 호스트인지 확인
                setIsHost(transformedData.createdBy === currentUserId);
                
                // 신청 상태 확인
                setApplied(transformedData.applymember.includes(currentUserId));
                
            } else if (response.status === 404) {
                setError('동행을 찾을 수 없습니다.');
                Alert.alert('오류', '해당 동행을 찾을 수 없습니다.');
            } else {
                const errorText = await response.text();
                console.error('❌ API 호출 실패:', response.status, errorText);
                setError(`서버 오류 (${response.status})`);
                Alert.alert('오류', '동행 정보를 불러오지 못했습니다.');
            }
            
        } catch (error) {
            console.error('❌ 네트워크 오류:', error);
            setError('네트워크 연결 오류');
            
            if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
                Alert.alert(
                    '네트워크 오류',
                    '서버에 연결할 수 없습니다.\n서버가 실행 중인지 확인해주세요.'
                );
            } else {
                Alert.alert('오류', '예상치 못한 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 서버에 댓글/답글 저장하는 함수 (기존 유지)
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
                isHost: currentUserId === postData?.createdBy // 현재 사용자가 호스트인지
            };
            
            return mockResponse;
        } catch (error) {
            console.error('서버 저장 실패:', error);
            throw error;
        }
    };

    // 일반 댓글 추가 (기존 로직 유지)
    const handleAddComment = async (content) => {
        if (!content.trim()) return;

        const tempComment = {
            id: `temp_${Date.now()}`,
            nickname: "내닉네임", 
            time: "방금 전",
            content: content.trim(),
            profileImage: null,
            isHost: currentUserId === postData?.createdBy,
            replies: [],
            isTemporary: true
        };

        setComments(prev => [...prev, tempComment]);

        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const savedComment = await saveToServer({
                content: content.trim(),
                postId: postId
            });

            setComments(prev => 
                prev.map(comment => 
                    comment.id === tempComment.id 
                        ? { ...savedComment, replies: [], isTemporary: false }
                        : comment
                )
            );

        } catch (error) {
            setComments(prev => 
                prev.filter(comment => comment.id !== tempComment.id)
            );
            
            Alert.alert("댓글 등록 실패", "댓글 등록에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 답글 추가 (기존 로직 유지)
    const handleAddReply = async (content) => {
        if (!content.trim() || !replyingTo) return;

        const tempReply = {
            id: `temp_reply_${Date.now()}`,
            nickname: "내닉네임",
            time: "방금 전", 
            content: content.trim(),
            profileImage: null,
            isHost: currentUserId === postData?.createdBy,
            isTemporary: true
        };

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

        setReplyingTo(null);

        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const savedReply = await saveToServer({
                content: content.trim(),
                parentCommentId: replyingTo,
                postId: postId
            }, true);

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

    // 🎯 postId를 사용하여 데이터 로드
    useEffect(() => {
        if (postId) {
            console.log('📍 postId로 데이터 로드:', postId);
            fetchAccompanyDetail(postId);
        } else {
            setError('잘못된 동행 ID입니다.');
            setLoading(false);
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

    // 🎯 멤버 데이터 (실제 데이터로 변환)
    const members = postData ? [
        {
            name: postData.createdByName,
            gender: '여', // 실제 데이터에서 가져와야 함
            age: '22',   // 실제 데이터에서 가져와야 함
            isHost: true,
            tags: ['호스트']
        },
        // 참가자들도 실제 데이터로 변환 필요
    ] : [];

    // 🔄 로딩 상태
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#666' }}>동행 정보를 불러오는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ❌ 에러 상태
    if (error || !postData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 18, color: '#FF6B6B', marginBottom: 10 }}>
                        오류가 발생했습니다
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
                        {error || '동행 정보를 불러올 수 없습니다.'}
                    </Text>
                    <TouchableOpacity 
                        style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
                        onPress={() => router.back()}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>돌아가기</Text>
                    </TouchableOpacity>
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
                            <Text>{postData.createdByName} </Text>
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