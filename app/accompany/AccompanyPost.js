import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Text, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
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

const getBaseURL = () => {
    if (__DEV__) { // 개발 환경
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080'; // 안드로이드 에뮬레이터는 '10.0.2.2'를 로컬호스트로 사용
        }
        // iOS 시뮬레이터, 웹, 또는 안드로이드 실기기 개발 시 app.json의 DEV URL 사용
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else { // 운영(배포) 환경
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
};

const API_URL = getBaseURL();

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

        const getImageUrl = (item) => {
    // images 필드가 있으면 사용 (Response DTO)
    if (item.images && item.images.length > 0) {
        return item.images[0];
    }
    
    // imageUrls 필드가 있으면 사용 (엔티티 직접)
    if (item.imageUrls && item.imageUrls.length > 0) {
        return item.imageUrls[0];
    }
    
    // imageUrl 필드가 있으면 사용 (다른 구조)
    if (item.imageUrl) {
        return item.imageUrl;
    }
    
    // 모두 없으면 빈 문자열
    return '';
    };

    // 댓글 상태 관리 (답글 포함)
    const [comments, setComments] = useState([]);

    // 현재 답글을 달고 있는 댓글 ID (null이면 일반 댓글 모드)
    const [replyingTo, setReplyingTo] = useState(null);

    //  backedend 데이터 변환 함수
    const transformAccompanyDetail = (backendData) => {
        if (!backendData) return null;

        return {
            id: backendData.id?.toString() || '1',
            title: backendData.title || '제목 없음',
            location: backendData.location || '위치 미정',
            createdAt: backendData.postDate ? 
                dayjs(backendData.postDate).locale('ko').format('YYYY.MM.DD') : 
                dayjs().locale('ko').format('YYYY.MM.DD'),
            imageUrl: getImageUrl(backendData), 
            views: backendData.views || 0,
            travelStartDate: backendData.tripStartDate ? 
                dayjs(backendData.tripStartDate).locale('ko').format('YYYY.MM.DD') : 
                '기간미정',
            travelEndDate: backendData.tripEndDate ? 
                dayjs(backendData.tripEndDate).locale('ko').format('YYYY.MM.DD') : 
                '',
            recruitStartDate: backendData.recStartDate ? 
                dayjs(backendData.recStartDate).locale('ko').format('YYYY.MM.DD') : 
                '기간미정',
            recruitEndDate: backendData.recEndDate ? 
                dayjs(backendData.recEndDate).locale('ko').format('YYYY.MM.DD') : 
                '',
            description: backendData.intro || '설명이 없습니다.',
            meetingPoint: backendData.meetPlace || '미정',
            member: backendData.participants?.map(p => p.userId?.toString()) || [],
            applymember: backendData.applicants?.map(a => a.userId?.toString()) || [],
            gender: backendData.gender === 'ALL' ? '남녀무관' : (backendData.gender || '미정'),
            ageRange: (backendData.ageGroup || []).map(age => age === "ALL" ? "누구나" : age),
            category: backendData.category || [],
            tags: backendData.tag || [],
            currentParticipants: backendData.participants?.length || 1,
            maxParticipants: backendData.maxRecruit || 0,
            createdBy: backendData.host?.userId?.toString() || 'unknown',
            createdByName: backendData.host?.nickname || '알 수 없음',
            likes: backendData.likeCount || 0
        };
    };

        // 1. 페이지 로딩 시 댓글 불러오기 함수 추가
    const fetchComments = async (accompanyId) => {
        try {
            const url = `${API_URL}/api/accompany/${accompanyId}/comments`;
            console.log('🌐 댓글 조회 API 호출:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const commentsData = await response.json();
                console.log('✅ 댓글 조회 성공:', commentsData);
                
                // 백엔드 댓글 데이터를 프론트엔드 형식으로 변환
                const transformedComments = commentsData.map(comment => ({
                    id: comment.id?.toString() || `comment_${Date.now()}`,
                    nickname: comment.authorName || '익명',
                    time: comment.createdAt ? formatTimeAgo(comment.createdAt) : '방금 전',
                    content: comment.content || '',
                    profileImage: comment.authorProfileImage || null,
                    isHost: comment.isAuthor || false, // 백엔드에서 호스트 여부 확인
                    replies: comment.replies?.map(reply => ({
                        id: reply.id?.toString() || `reply_${Date.now()}`,
                        nickname: reply.authorName || '익명',
                        time: reply.createdAt ? formatTimeAgo(reply.createdAt) : '방금 전',
                        content: reply.content || '',
                        profileImage: reply.authorProfileImage || null,
                        isHost: reply.isAuthor || false,
                        isTemporary: false
                    })) || [],
                    isTemporary: false
                }));
                
                setComments(transformedComments);
            } else {
                console.error('❌ 댓글 조회 실패:', response.status);
            }
        } catch (error) {
            console.error('❌ 댓글 조회 오류:', error);
        }
    };

    // 2. 시간 포맷팅 함수 추가
    const formatTimeAgo = (dateString) => {
        const now = dayjs();
        const commentTime = dayjs(dateString);
        const diffMinutes = now.diff(commentTime, 'minute');
        const diffHours = now.diff(commentTime, 'hour');
        const diffDays = now.diff(commentTime, 'day');
        
        if (diffMinutes < 1) return '방금 전';
        if (diffMinutes < 60) return `${diffMinutes}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return commentTime.format('M월 D일');
    };
    // API에서 동행 상세 정보 가져오기
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
                console.log('🔍 API 응답:', backendData);
                console.log('🔍 imageUrls 필드:', backendData.imageUrls);

                // 백엔드 데이터를 프론트엔드 형식으로 변환
                const transformedData = transformAccompanyDetail(backendData);
                
                
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

    // 3. 서버에 댓글 저장하는 함수 수정
    // 디버깅을 위한 수정된 saveToServer 함수
const saveToServer = async (data, isReply = false) => {
    try {
        const url = `${API_URL}/api/accompany/${postId}/comments`;
        console.log('🌐 댓글 작성 API 호출:', url);
        
        // 🔍 currentUserId 타입 확인
        console.log('🧑 currentUserId 원본:', currentUserId, '타입:', typeof currentUserId);
        const userIdNumber = parseInt(currentUserId);
        console.log('🧑 parseInt 결과:', userIdNumber, '타입:', typeof userIdNumber, 'isNaN:', isNaN(userIdNumber));
        
        const requestBody = {
            content: data.content,
            userId: userIdNumber, // parseInt 결과 사용
            ...(isReply && data.parentCommentId && { parentCommentId: parseInt(data.parentCommentId) })
        };
        

        // 요청 전 유효성 검사
        if (!requestBody.content || requestBody.content.trim() === '') {
            throw new Error('댓글 내용이 비어있습니다');
        }
        
        if (isNaN(requestBody.userId)) {
            throw new Error('유효하지 않은 사용자 ID입니다');
        }
        
        if (!postId || isNaN(parseInt(postId))) {
            throw new Error('유효하지 않은 게시글 ID입니다');
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        console.log('📡 응답 상태:', response.status);
        console.log('📡 응답 헤더 Content-Type:', response.headers.get('content-type'));
        
        // 응답 내용을 먼저 텍스트로 읽어보기
        const responseText = await response.text();

        
        if (response.ok) {
            let result;
            try {
                result = JSON.parse(responseText);
                console.log('✅ 댓글 작성 성공:', result);
            } catch (parseError) {
                console.error('❌ JSON 파싱 오류:', parseError);
                console.log('응답이 JSON이 아님:', responseText);
                throw new Error('서버 응답이 올바른 JSON 형식이 아닙니다');
            }
            
            // 백엔드 응답을 프론트엔드 형식으로 변환 
            return {
                id: result.id?.toString() || `comment_${Date.now()}`,
                nickname: result.userNickname || '내닉네임', // authorName -> userNickname
                time: result.createdAt ? formatTimeAgo(result.createdAt) : '방금 전',
                content: result.content || '',
                profileImage: null, // 프로필 이미지는 별도 처리 필요
                isHost: result.isHostComment || false, // isAuthor -> isHostComment
                replies: [],
                isTemporary: false
            };
        } else {
            console.error('❌ 댓글 작성 실패:', response.status);
            console.error('❌ 오류 응답:', responseText);
            
            throw new Error(`댓글 작성 실패: ${response.status} - ${responseText}`);
        }
    } catch (error) {
        console.error('❌ 댓글 작성 오류:', error);
        
        throw error;
    }
};


   // 5. 일반 댓글 추가 함수 수정
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

// 6. 답글 추가 함수 수정 (같은 API 사용)
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
        // 답글도 같은 API 사용, parentCommentId만 추가
        const savedReply = await saveToServer({
            content: content.trim(),
            parentCommentId: parseInt(replyingTo), // 부모 댓글 ID 추가
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

    // postId를 사용하여 데이터 로드
    useEffect(() => {
        if (postId) {
            console.log('📍 postId로 데이터 로드:', postId);
            fetchAccompanyDetail(postId);
            fetchComments(postId); // 댓글도 함께 로딩
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
                        photos={postData.imageUrl ? [postData.imageUrl] : []}  // API_URL 제거!
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
                
                {/* Guest: Application button */}
                {!isHost && (
                    <ApplicationButton
                        title={applied ? "동행 취소" : "동행 신청"}
                        onPress={handleApplicationPress}
                        initialLikes={postData.likes || 0}
                        isLiked={postData.isLiked || false}  
                        postId={postId}
                        currentUserId={currentUserId}
                        closed={closed}
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
                        alarmText={
                            <Text style={styles.alarmPopupText}>
                                `동행을 마감하시겠습니까?\n마감된 동행은 다시 되돌릴 수 없습니다.`
                            </Text>}
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