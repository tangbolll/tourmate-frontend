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
import AlarmPopup from '../../components/accompany/AlarmPopup';
import MemberPopup from '../../components/accompany/MemberPopup';
import EventHeader from '../../components/accompany/EventHeader';
import AccompanyBottomButton from '../../components/accompany/AccompanyBottomButton';

// 분리된 API 함수 임포트
import {
    fetchAccompanyDetailApi,
    // transformAccompanyDetail,
    fetchCommentsApi,
    saveCommentApi,
    toggleLikeApi,
    toggleApplicationApi,
    closeAccompanyPostApi,
    deleteAccompanyPostApi
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
    const [isLoadingLikeStatus, setIsLoadingLikeStatus] = useState(true); // 초기 로딩 상태
    const [isTogglingLike, setIsTogglingLike] = useState(false); // 토글 로딩 상태

    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const currentUserId = "2";
    const [isHost, setIsHost] = useState(false);
    const [showAlarmPopup, setShowAlarmPopup] = useState(false);
    const [showAlarmPopupHost, setShowAlarmPopupHost] = useState(false);
    const [closed, setClosed] = useState(false);
    const [showMemberPopupGuest, setShowMemberPopupGuest] = useState(false);
    const [showMemberPopupHost, setShowMemberPopupHost] = useState(false);
    // const [applied, setApplied] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const scrollViewRef = useRef(null);

    // 댓글 상태 관리 (답글 포함)
    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);

    // userApplicationStatus로 신청 여부 계산하는 헬퍼 함수
    const isUserApplied = (status) => {
        return status && ['PENDING', 'ACCEPTED'].includes(status);
    };

    // AccompanyPost.jsx에 추가할 누락된 함수
    const handleDeletePost = () => {
        console.log("🔥 handleDeletePost 함수 시작됨!");
        setShowDeletePopup(true);
    };

    // 수정된 handleConfirmDelete (더 안전하게)
    const handleConfirmDelete = () => {
        // 즉시 나가기
        setShowDeletePopup(false);
        router.replace('/accompany');
        
        // 백그라운드에서 삭제 (에러 무시)
        deleteAccompanyPostApi(postId)
            .then(() => console.log('✅ 삭제 성공'))
            .catch(error => {
                console.error('❌ 삭제 실패:', error);
                // 사용자는 이미 나갔으므로 에러 알림 없음
            });
    };


    // 백엔드 데이터 구조를 프론트에서 사용할 수 있도록 변환
const transformAccompanyDetail = (backendData) => {
    return {
        ...backendData,
        userApplicationStatus: backendData.userApplicationStatus || null,
    };
};

    // 동행 상세 정보를 가져오는 함수
    const fetchAccompanyDetail = async (id) => {
    try {
        setLoading(true);
        setError(null);
        
        const backendData = await fetchAccompanyDetailApi(id, currentUserId);
        const transformedData = transformAccompanyDetail(backendData);

        console.log('🔍 백엔드 원본 데이터:', {
            id: backendData.id,
            userApplicationStatus: backendData.userApplicationStatus,
            member: backendData.member,
            applyMember: backendData.applyMember,
            userId: backendData.userId,
            currentUserId: currentUserId
        });

        console.log('🔍 변환된 데이터:', {
            userApplicationStatus: transformedData.userApplicationStatus,
            member: transformedData.member,
            applymember: transformedData.applymember,
            createdBy: transformedData.createdBy
        });

        setPostData(transformedData);
        setIsHost(transformedData.createdBy === currentUserId);

        console.log('✅ 최종 상태 체크:', {
            status: transformedData.status,
            userApplicationStatus: transformedData.userApplicationStatus,
            isApplied: isUserApplied(transformedData.userApplicationStatus),
            closed: ['COMPLETED', 'CLOSED'].includes(transformedData.status),
            isHost: transformedData.createdBy === currentUserId
        });

        setClosed(['COMPLETED', 'CLOSED'].includes(transformedData.status));
        setIsLiked(transformedData.isLiked);
        setLikeCount(transformedData.likes);

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

    // 컴포넌트 마운트 시 좋아요 상태 로드
    const loadLikeStatus = useCallback(async () => {
        if (!postId || !currentUserId) {
            console.log('⚠️ AccompanyPost: postId 또는 currentUserId가 없어서 좋아요 상태 로드 건너뛰기');
            setIsLoadingLikeStatus(false);
            return;
        }

        try {
            setIsLoadingLikeStatus(true);
            console.log(`🔄 AccompanyPost: 좋아요 상태 로딩 시작 (postId: ${postId}, userId: ${currentUserId})`);
            
            const result = await getLikeStatusApi(postId, currentUserId);
            
            console.log(`✅ AccompanyPost: 좋아요 상태 로딩 완료`, result);
            
            setIsLiked(result.isLiked);
            setLikeCount(result.likeCount);
            
        } catch (error) {
            console.error('❌ AccompanyPost: 좋아요 상태 로딩 실패:', error);
            // 에러 발생 시 기본값 유지
            setIsLiked(false);
            setLikeCount(0);
        } finally {
            setIsLoadingLikeStatus(false);
        }
    }, [postId, currentUserId]);

    // postId나 currentUserId가 변경되면 좋아요 상태 재로드
    useEffect(() => {
        loadLikeStatus();
    }, [loadLikeStatus]);

    // 좋아요 토글 함수 (개선된 버전)
    const handleLikeToggle = useCallback(async () => {
        if (!postId || !currentUserId) {
            console.error('❌ AccompanyPost: postId 또는 currentUserId가 유효하지 않아 좋아요 토글을 할 수 없습니다.', { postId, currentUserId });
            Alert.alert('오류', '게시물 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        // 이미 토글 중이면 중복 호출 방지
        if (isTogglingLike) {
            console.log('⚠️ AccompanyPost: 이미 좋아요 토글 처리 중...');
            return;
        }

        // 현재 상태 백업 (롤백용)
        const originalIsLiked = isLiked;
        const originalLikeCount = likeCount;

        try {
            setIsTogglingLike(true);
            console.log('🔄 AccompanyPost: 좋아요 토글 시작', {
                postId,
                currentUserId,
                currentIsLiked: isLiked,
                currentLikeCount: likeCount
            });

            // 낙관적 업데이트 (API 호출 전에 UI 먼저 변경)
            const newIsLiked = !isLiked;
            const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
            
            console.log(`🔄 AccompanyPost: 낙관적 업데이트 ${isLiked} → ${newIsLiked}, 좋아요 수: ${likeCount} → ${newLikeCount}`);
            
            setIsLiked(newIsLiked);
            setLikeCount(newLikeCount);

            // API 호출
            const result = await toggleLikeApi(postId, currentUserId);
            
            console.log('✅ AccompanyPost: 좋아요 토글 API 응답:', result);
            
            // API 응답으로 최종 상태 업데이트 (낙관적 업데이트 보정)
            setIsLiked(result.isLiked);
            setLikeCount(result.likeCount);
            
            console.log('✨ AccompanyPost: 좋아요 토글 완료', {
                finalIsLiked: result.isLiked,
                finalLikeCount: result.likeCount
            });

        } catch (error) {
            console.error('❌ AccompanyPost: 좋아요 토글 오류:', error);
            
            // 오류 발생 시 원래 상태로 롤백
            console.log('🔄 AccompanyPost: 좋아요 상태 롤백', {
                rollbackIsLiked: originalIsLiked,
                rollbackLikeCount: originalLikeCount
            });
            
            setIsLiked(originalIsLiked);
            setLikeCount(originalLikeCount);
            
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            setIsTogglingLike(false);
        }
    }, [postId, currentUserId, isLiked, likeCount, isTogglingLike]);

    
    // 동행 신청/취소 함수
    // AccompanyPost.jsx - 수정된 handleApplicationPress

const handleApplicationPress = async () => {
    const currentStatus = postData?.userApplicationStatus;
    const isCurrentlyApplied = isUserApplied(currentStatus);
    
    console.log('🔄 신청/취소 시작:', {
        currentStatus,
        isCurrentlyApplied,
        postId,
        userId: currentUserId
    });
    
    // 낙관적 업데이트
    const newStatus = isCurrentlyApplied ? null : 'PENDING';
    setPostData(prev => ({
        ...prev,
        userApplicationStatus: newStatus
    }));
    
    try {
        // 🔥 currentStatus 대신 isCurrentlyApplied 전달
        const result = await toggleApplicationApi(postId, currentUserId, currentStatus);
        console.log('✅ API 호출 성공:', result);
        
        // 🔥 API 결과의 newStatus를 사용해서 최종 상태 업데이트
        setPostData(prev => ({
            ...prev,
            userApplicationStatus: result.newStatus
        }));
        
        setShowAlarmPopup(true);
        
    } catch (error) {
        console.error(`❌ 동행 ${isCurrentlyApplied ? '취소' : '신청'} 오류:`, error);
        Alert.alert('오류', error.message);
        
        // 🔥 오류 발생 시 원래 상태로 롤백
        setPostData(prev => ({
            ...prev,
            userApplicationStatus: currentStatus
        }));
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

    const handleConfirmClose = async () => {
    // 1. 즉시 UI 업데이트 (낙관적 업데이트)
    setPostData(prev => ({
        ...prev,
        status: 'COMPLETED'  // 동행 상태를 COMPLETED로 변경
    }));
    setClosed(true);  // closed 상태도 즉시 변경
    setShowAlarmPopupHost(false);  // 팝업 닫기
    
    // 2. 백엔드 API 호출
    try {
        await closeAccompanyPostApi(postId);
        Alert.alert("성공", "동행 모집이 마감되었습니다.");
    } catch (error) {
        console.error('❌ 동행 모집 마감 오류:', error);
        
        // 3. API 실패 시 UI 롤백
        setPostData(prev => ({
            ...prev,
            status: 'RECRUITING'  // 원래 상태로 되돌리기
        }));
        setClosed(false);
        
        Alert.alert('오류', error.message || '동행 마감 처리 중 오류가 발생했습니다.');
    }
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
                        style={{ backgroundColor: '#cfd2d5ff', padding: 12, borderRadius: 8 }}
                        onPress={() => router.push('/accompany')}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>돌아가기</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{ flex: 1 }}>
                {/* ScrollView를 KeyboardAvoidingView로 감쌈 */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: keyboardVisible ? 0 : 100 } // 키보드가 없을 때만 하단 패딩
                        ]}
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
                            status={postData.status}
                        />

                        {/* 더보기 버튼 */}
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => setShowMoreMenu(prev => !prev)}
                        >
                            <Feather name="more-vertical" size={24} color="black" />
                        </TouchableOpacity>

                        {/* "더보기" 메뉴 드롭다운 */}
                        {isHost && showMoreMenu && (
                            <View style={styles.moreMenu}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        console.log("삭제 버튼 클릭됨!");
                                        setShowMoreMenu(false); // 메뉴 닫기
                                        handleDeletePost(); 
                                    }}
                                >
                                    <Text style={styles.menuText}>삭제하기</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                

                        {/* Host info outside header */}
                        <View style={styles.hostInfoContainer}>
                            <Text style={styles.hostInfoText}>
                                <Text style={styles.hostInfoLabel}>호스트 </Text>
                                {postData.createdByName}
                                <Text style={styles.hostInfoLabel}> 게시일 </Text>
                                {postData.createdAt}
                                <Text style={styles.hostInfoLabel}> 조회수 </Text>
                                {postData.views}
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
                            photos={postData.imageUrls || []}
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
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* 하단 버튼을 절대 위치로 고정 */}
                {postData && (
                <View style={styles.bottomButtonContainer}>
                    <AccompanyBottomButton
                        isHost={isHost}
                        accompanyStatus={postData.status}
                        userApplicationStatus={postData.userApplicationStatus}
                        onPress={isHost ? handleClosedPress : handleApplicationPress}
                        likes={likeCount}
                        isLiked={isLiked}
                        onLikeToggle={handleLikeToggle}
                    />
                </View>
                )}

                {/* Popups */}
                {showAlarmPopupHost && (
                    <AlarmPopup
                        alarmText={
                            <Text style={styles.alarmPopupText}>
                                동행을 마감하시겠습니까?{'\n'}마감된 동행은 다시 되돌릴 수 없습니다.
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
                                {isUserApplied(postData?.userApplicationStatus)
                                    ? `동행 신청이 완료되었습니다.${'\n'}호스트가 수락하거나 거절하면 알림이 발송됩니다.${'\n'}수락되기 전까지 신청을 취소할 수 있습니다.`
                                    : `동행 신청이 취소되었습니다.${'\n'}다시 신청하시려면 아래 버튼을 눌러주세요.`}
                            </Text>
                        }
                        onClose={handleCloseAlarmPopup}
                    />
                )}

                {showDeletePopup && (
                    <AlarmPopup
                        alarmText={
                            <Text style={styles.alarmPopupText}>
                                정말 이 동행을 삭제하시겠습니까?{'\n'}삭제된 게시물은 복구할 수 없습니다.
                            </Text>
                        }
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                        confirmText="삭제"
                        cancelText="취소"
                        showConfirmButton={true}
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
            </View>
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
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        // 필요시 그림자 추가
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
        moreMenu: {
        position: 'absolute',
        top: 80, // moreButton 위치에 맞게 조정
        right: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 20, // 다른 컴포넌트 위로 올라오도록
    },
    menuItem: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        width: 100, // 메뉴 너비 설정
        alignItems: 'center',
    },
    menuText: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
});