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

// 분리된 API 함수 임포트
import {
    fetchAccompanyDetailApi,
    fetchCommentsApi,
    saveCommentApi,
    toggleLikeApi,
    toggleApplicationApi,
    closeAccompanyPostApi
} from '../../utils/AccompanyPostApi'; // 경로는 프로젝트 구조에 맞게 조정

export default function AccompanyPost() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { postId } = params;
    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // 좋아요 상태와 좋아요 수를 별도로 관리
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const currentUserId = "2";
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
    const [replyingTo, setReplyingTo] = useState(null);

    // API에서 동행 상세 정보 가져오기 (리팩토링 적용)
    const fetchAccompanyDetail = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const transformedData = await fetchAccompanyDetailApi(id, currentUserId);
            setPostData(transformedData);
            setIsHost(transformedData.createdBy === currentUserId);
            setApplied(transformedData.applymember.includes(currentUserId));
            setClosed(transformedData.isClosed);
            // 초기 상태 설정
            setIsLiked(transformedData.isLiked);
            setLikeCount(transformedData.likes);
            console.log('✅ fetchAccompanyDetail: 초기 좋아요 상태:', transformedData.isLiked);
            console.log('✅ fetchAccompanyDetail: 초기 좋아요 수:', transformedData.likes);
        } catch (err) {
            console.error('❌ 데이터 로드 오류:', err);
            setError(err.message || '데이터를 불러오지 못했습니다.');
            Alert.alert('오류', '동행 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 댓글 불러오기 함수 (리팩토링 적용)
    const fetchComments = async (accompanyId) => {
        try {
            const transformedComments = await fetchCommentsApi(accompanyId);
            setComments(transformedComments);
        } catch (error) {
            console.error('❌ 댓글 조회 오류:', error);
        }
    };

    // 서버에 댓글 저장하는 함수 (리팩토링 적용)
    const handleSend = async (content) => {
        if (!content.trim()) return;

        const isReply = !!replyingTo;
        const parentCommentId = isReply ? replyingTo : null;

        const tempItem = {
            id: `temp_${Date.now()}`,
            nickname: "내닉네임",
            time: "방금 전",
            content: content.trim(),
            profileImage: null,
            isHost: currentUserId === postData?.createdBy,
            isTemporary: true
        };

        if (isReply) {
            setComments(prev =>
                prev.map(comment =>
                    comment.id === replyingTo
                        ? { ...comment, replies: [...comment.replies, tempItem] }
                        : comment
                )
            );
            setReplyingTo(null);
        } else {
            setComments(prev => [...prev, { ...tempItem, replies: [] }]);
        }

        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const savedItem = await saveCommentApi(postId, content, currentUserId, parentCommentId);
            setComments(prev =>
                prev.map(comment =>
                    comment.id === (isReply ? replyingTo : tempItem.id)
                        ? {
                            ...comment,
                            replies: isReply
                                ? comment.replies.map(reply =>
                                    reply.id === tempItem.id ? { ...savedItem, isTemporary: false } : reply
                                )
                                : [],
                            ...(isReply ? {} : { ...savedItem, replies: [], isTemporary: false })
                        }
                        : comment
                ).filter(c => !c.isTemporary)
            );
        } catch (error) {
            setComments(prev =>
                prev.map(comment => ({
                    ...comment,
                    replies: isReply
                        ? comment.replies.filter(reply => reply.id !== tempItem.id)
                        : comment.replies
                })).filter(comment => comment.id !== tempItem.id)
            );
            Alert.alert("댓글 등록 실패", "댓글 등록에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 좋아요 토글 함수 (리팩토링 적용)
    const handleLikeToggle = async () => {
        if (!postId || !currentUserId) {
            console.error('❌ AccompanyPost: postId 또는 currentUserId가 유효하지 않아 좋아요 토글을 할 수 없습니다.', { postId, currentUserId });
            Alert.alert('오류', '게시물 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        try {
            console.log('🔄 handleLikeToggle: 좋아요 API 호출 전 현재 isLiked 상태:', isLiked);

            // API 호출 전에 UI 상태를 먼저 변경하여 즉각적인 피드백 제공
            const newIsLiked = !isLiked;
            const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
            setIsLiked(newIsLiked);
            setLikeCount(newLikeCount);

            const result = await toggleLikeApi(postId, currentUserId);
            
            console.log('✅ handleLikeToggle: 좋아요 API 응답 result.isLiked:', result.isLiked);
            console.log('✨ handleLikeToggle: API 응답으로 상태 업데이트 완료.');
            // API 응답으로 최종 상태를 업데이트 (혹시라도 불일치 발생 시 대비)
            setIsLiked(result.isLiked);
            setLikeCount(result.likeCount);

        } catch (error) {
            console.error('❌ 좋아요 토글 오류:', error);
            // 오류 발생 시 원래 상태로 롤백
            setIsLiked(isLiked);
            setLikeCount(likeCount);
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    // 동행 신청/취소 API 호출 함수 (리팩토링 적용)
    const handleApplicationPress = async () => {
        try {
            await toggleApplicationApi(postId, currentUserId, applied);
            setApplied(!applied);
            setShowAlarmPopup(true);
        } catch (error) {
            console.error(`❌ 동행 ${applied ? '취소' : '신청'} 오류:`, error);
            Alert.alert('오류', error.message);
        }
    };

    // 동행 모집 마감 API 호출 함수 (리팩토링 적용)
    const closeAccompanyPost = async () => {
        try {
            await closeAccompanyPostApi(postId);
            setClosed(true);
            setShowAlarmPopupHost(false);
            Alert.alert("성공", "동행 모집이 마감되었습니다.");
        } catch (error) {
            console.error('❌ 동행 모집 마감 오류:', error);
            Alert.alert('오류', error.message);
        }
    };

    // 답글 버튼 클릭 핸들러
    const handleReplyPress = (commentId) => {
        setReplyingTo(commentId);
    };

    // 답글 취소
    const cancelReply = () => {
        setReplyingTo(null);
    };

    // postId를 사용하여 데이터 로드
    useEffect(() => {
        if (postId) {
            fetchAccompanyDetail(postId);
            fetchComments(postId);
        } else {
            setError('잘못된 동행 ID입니다.');
            setLoading(false);
        }
    }, [postId, currentUserId]); // postData 의존성 제거

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
        closeAccompanyPost();
    };

    const members = postData ? [
        {
            name: postData.createdByName,
            gender: '여',
            age: '22',
            isHost: true,
            tags: ['호스트']
        },
        ...(postData.member || []).filter(userId => userId !== postData.createdBy).map(userId => ({
            name: `참가자 ${userId}`,
            gender: '미정',
            age: '미정',
            isHost: false,
            tags: ['참가자']
        }))
    ] : [];

    // 로딩 상태
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#666' }}>동행 정보를 불러오는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 에러 상태
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
                style={{ flex: 1 }}
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
                        postId={postId}
                        currentUserId={currentUserId}
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
                            <Text style={styles.hostInfoLabel}> 게시일 </Text>
                            <Text>{postData.createdAt} </Text>
                            <Text style={styles.hostInfoLabel}> 조회수 </Text>
                            <Text>{postData.views}</Text>
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
                        photos={postData.imageUrl ? [postData.imageUrl] : []}
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

                    {/* 댓글 섹션 제목 (항상 표시) */}
                    <View style={styles.commentDivider} />
                    <Text style={styles.commentTitle}> 코멘트</Text>

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

                {/* Conditional Rendering for Buttons */}
                {postData && (
                    isHost ? (
                        <AccompanyCloseButton
                            title={closed ? "모집이 마감된 동행입니다." : "모집 마감"}
                            onPress={handleClosedPress}
                            likes={likeCount} 
                            isLiked={isLiked} 
                            onLikeToggle={handleLikeToggle} // AccompanyPost의 handleLikeToggle 전달
                            isClosed={closed}
                            postId={postId} // postId 전달
                            currentUserId={currentUserId} // currentUserId 전달
                        />
                    ) : (
                        <ApplicationButton
                            title={applied ? "동행 취소" : "동행 신청"}
                            onPress={handleApplicationPress}
                            likes={likeCount}
                            isLiked={isLiked}
                            postId={postId} // postId 전달
                            currentUserId={currentUserId} // currentUserId 전달
                            closed={closed}
                            onLikeToggle={handleLikeToggle} // AccompanyPost의 handleLikeToggle 전달
                            applied={applied}
                        />
                    )
                )}

                {/* Popups */}
                {showAlarmPopupHost && (
                    <AlarmPopup
                        alarmText={
                            <Text style={styles.alarmPopupText}>
                                {`동행을 마감하시겠습니까?\n마감된 동행은 다시 되돌릴 수 없습니다.`}
                            </Text>
                        }
                        onClose={handleCloseAlarmPopupHost}
                        onConfirm={handleConfirmClose}
                        confirmText="네"
                        cancelText="아니오"
                        showConfirmButton={true}
                    />
                )}

                {showAlarmPopup && (
                    <AlarmPopup
                        alarmText={
                            <Text style={styles.alarmPopupText}>
                                {applied
                                    ? `동행 신청이 완료되었습니다.\n호스트가 수락하거나 거절하면 알림이 발송됩니다.\n수락되기 전까지 신청을 취소할 수 있습니다.`
                                    : `동행 신청이 취소되었습니다.\n다시 신청하시려면 아래 버튼을 눌러주세요.`}
                            </Text>
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
    alarmPopupText: {
        fontSize: 15,

    },
    commentDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginTop: 12,
        marginBottom: 4,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 16,
    },
});
