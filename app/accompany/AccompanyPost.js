import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Text, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAccompanyStore from '../../context/accompanyStore'; // Import the new store
import { useFocusEffect } from '@react-navigation/native';
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
import AccompanyManagement from './AccompanyManagement';
import EventHeader from '../../components/accompany/EventHeader';
import AccompanyBottomButton from '../../components/accompany/AccompanyBottomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 분리된 API 함수 임포트
import {
    fetchAccompanyDetailApi,
    fetchCommentsApi,
    saveCommentApi,
    toggleLikeApi,
    getLikeStatusApi,
    toggleApplicationApi,
    closeAccompanyPostApi,
    deleteAccompanyPostApi,
    // 새로운 API 함수들 추가
    getUnreadApplicationsApi,
    markApplicationsViewedApi,
    getChatAccessApi
} from '../../utils/AccompanyPostApi';
import { getAccompanyManagementDataApi } from '../../utils/AccompanyManagementApi';

import { useAuth } from '../../context/AuthContext';

export default function AccompanyPost() {
    const { currentUserId } = useAuth();
    const params = useLocalSearchParams();
    const router = useRouter();
    const { postId } = params;

    const [memberPopupData, setMemberPopupData] = useState([]);
    const [memberDataLoading, setMemberDataLoading] = useState(false);

    // Get states and actions from Zustand store
    const { accompanyData, applicants, participants, currentParticipants, maxParticipants, setAccompanyData } = useAccompanyStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userApplicationStatusLocal, setUserApplicationStatusLocal] = useState(null); // New local state
    // 좋아요 상태와 좋아요 수를 별도로 관리
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLikeLoading, setIsLikeLoading] = useState(false); // 좋아요 로딩 상태 추가
    const [chatAccess, setChatAccess] = useState({ canAccess: false, isCompleted: false });

    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [showAlarmPopup, setShowAlarmPopup] = useState(false);
    const [showAlarmPopupHost, setShowAlarmPopupHost] = useState(false);
    const [closed, setClosed] = useState(false);
    const [showMemberPopupGuest, setShowMemberPopupGuest] = useState(false);
    // const [showMemberPopupHost, setShowMemberPopupHost] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const scrollViewRef = useRef(null);


    // 새로운 신청 관련 상태 추가
    const [unreadApplicationsCount, setUnreadApplicationsCount] = useState(0);
    const [hasNewApplications, setHasNewApplications] = useState(false);

    // 댓글 상태 관리 (답글 포함)
    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);

    // userApplicationStatus로 신청 여부 계산하는 헬퍼 함수
    const isUserApplied = (status) => {
        return status && ['PENDING', 'ACCEPTED'].includes(status);
    };

    // 읽지 않은 신청 개수를 가져오는 함수
    const fetchUnreadApplications = async () => {
        if (!isHost || !postId) return;
        
        try {
            const result = await getUnreadApplicationsApi(postId, currentUserId);
            setUnreadApplicationsCount(result.unreadCount);
            setHasNewApplications(result.unreadCount > 0);
        } catch (error) {
            console.error('❌ 읽지 않은 신청 개수 조회 실패:', error);
        }
    };

    // 신청을 읽음으로 표시하는 함수
    const markApplicationsAsViewed = async () => {
        if (!isHost || !postId || !hasNewApplications) return;
        
        try {
            await markApplicationsViewedApi(postId, currentUserId);
            setUnreadApplicationsCount(0);
            setHasNewApplications(false);
        } catch (error) {
            console.error('❌ 신청 읽음 표시 실패:', error);
        }
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
        if (!currentUserId) return;
        try {
            setLoading(true);
            setError(null);
            
            // 병렬로 모든 데이터 호출
            const [backendData, chatAccessData] = await Promise.all([
                fetchAccompanyDetailApi(id, currentUserId),
                getChatAccessApi(id, currentUserId)
            ]);

            const transformedData = transformAccompanyDetail(backendData);
            
            setAccompanyData({ // Use Zustand store action
                accompanyInfo: transformedData,
                applicants: backendData.applyMember || [], // Assuming backendData contains applicants
                participants: backendData.member || [], // Assuming backendData contains participants
            });
            console.log('DEBUG: AccompanyPost - accompanyData.accompanyInfo.imageUrls:', transformedData.imageUrls); // ADD THIS LINE
            setChatAccess(chatAccessData);
            
            // ✅ 호스트 판별 로직 수정 - createdBy 또는 userId 사용
            const hostStatus = String(transformedData.createdBy || transformedData.userId) === String(currentUserId);
            
            console.log('🔍 호스트 체크 상세:', {
                transformedData_createdBy: transformedData.createdBy,
                transformedData_userId: transformedData.userId,
                currentUserId: currentUserId,
                hostStatus: hostStatus,
                타입체크: {
                    createdBy_type: typeof transformedData.createdBy,
                    userId_type: typeof transformedData.userId,
                    currentUserId_type: typeof currentUserId
                }
            });
            
            setIsHost(hostStatus);
            setClosed(['COMPLETED', 'CLOSED'].includes(transformedData.status));
            setIsLiked(transformedData.isLiked);
            setLikeCount(transformedData.likes);

            // ✅ 호스트인 경우 읽지 않은 신청 조회
            if (hostStatus) {
                console.log('✅ 호스트 확인! 읽지 않은 신청 조회 시작');
                try {
                    const result = await getUnreadApplicationsApi(id, currentUserId);
                    console.log('📍 읽지 않은 신청 결과:', result);
                    setUnreadApplicationsCount(result.unreadCount);
                    setHasNewApplications(result.unreadCount > 0);
                } catch (err) {
                    console.error('❌ 읽지 않은 신청 조회 실패:', err);
                }
            } else {
                console.log('❌ 호스트가 아님');
            }

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
            isHost: currentUserId === accompanyData?.accompanyInfo?.createdBy,
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

    // 좋아요 토글 함수 - AccompanyBottomButton에서 호출됨
    const handleLikeToggle = useCallback(async () => {
        if (!postId || !currentUserId) {
            console.error('❌ AccompanyPost: postId 또는 currentUserId가 유효하지 않음', { postId, currentUserId });
            Alert.alert('오류', '게시물 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        // 이미 로딩 중이면 중복 처리 방지
        if (isLikeLoading) {
            console.log('⚠️ AccompanyPost: 이미 좋아요 처리 중이므로 무시');
            return;
        }

        console.log('💖 AccompanyPost: 좋아요 토글 시작', {
            postId,
            currentUserId,
            현재_isLiked: isLiked,
            현재_likeCount: likeCount,
            타입_확인: {
                isLiked_type: typeof isLiked,
                likeCount_type: typeof likeCount
            }
        });

        try {
            setIsLikeLoading(true);

            // ✅ API 호출 - 서버가 최종 상태 결정
            console.log('🚀 toggleLikeApi 호출 중...');
            const result = await toggleLikeApi(postId, currentUserId);
            
            console.log('✅ AccompanyPost: 좋아요 토글 API 응답:', result);
            
            // ✅ API 응답으로 상태 업데이트
            const newIsLiked = Boolean(result.isLiked);
            const newLikeCount = Number(result.likeCount) || 0;
            
            console.log('🔄 상태 업데이트 진행:', {
                이전_isLiked: isLiked,
                새로운_isLiked: newIsLiked,
                이전_likeCount: likeCount,
                새로운_likeCount: newLikeCount,
                변경됨: isLiked !== newIsLiked ? '예' : '아니오'
            });
            
            setIsLiked(newIsLiked);
            setLikeCount(newLikeCount);
            
            console.log('✨ AccompanyPost: 상태 업데이트 완료');

        } catch (error) {
            console.error('❌ AccompanyPost: 좋아요 토글 실패:', {
                error: error.message,
                postId,
                currentUserId,
                현재상태: { isLiked, likeCount }
            });
            
            // 에러 타입별 메시지 처리
            let errorMessage = '좋아요 처리 중 오류가 발생했습니다.';
            
            if (error.message.includes('게시물을 찾을 수 없습니다')) {
                errorMessage = '게시물을 찾을 수 없습니다.';
            } else if (error.message.includes('서버 오류')) {
                errorMessage = '서버 오류입니다. 잠시 후 다시 시도해주세요.';
            } else if (error.message.includes('시간이 초과')) {
                errorMessage = '네트워크 상태를 확인해주세요.';
            } else if (error.message.includes('인증이 필요')) {
                errorMessage = '다시 로그인해주세요.';
            }
            
            Alert.alert('오류', errorMessage);
            
            // 에러를 다시 throw하여 자식 컴포넌트에서도 인지할 수 있도록
            throw error;
        } finally {
            setIsLikeLoading(false);
        }
    }, [postId, currentUserId, isLikeLoading]);

    useEffect(() => {
        if (accompanyData?.accompanyInfo) { // Use accompanyData from Zustand
            const postDataFromStore = accompanyData.accompanyInfo; // Alias for clarity
            console.log('🔍 AccompanyPost: accompanyData.accompanyInfo 전체 구조 확인:', {
                postData: postDataFromStore,
                keys: Object.keys(postDataFromStore),
                isLiked: postDataFromStore.isLiked,
                likeCount: postDataFromStore.likeCount,
                likes: postDataFromStore.likes,
                liked: postDataFromStore.liked
            });
            
            // ✅ 좋아요 정보 초기화 - 다양한 필드명 처리
            let initialIsLiked = false; // 기본값 false
            let initialLikeCount = 0;   // 기본값 0
            let needsSeparateLikeQuery = true; // 별도 좋아요 상태 조회 필요 여부
            
            // isLiked 필드 확인 (다양한 가능성 체크)
            if (typeof postDataFromStore.isLiked === 'boolean') {
                initialIsLiked = postDataFromStore.isLiked;
                needsSeparateLikeQuery = false;
                console.log('🔍 AccompanyPost: 초기 좋아요 상태 설정 (isLiked)', postDataFromStore.isLiked);
            } else if (typeof postDataFromStore.liked === 'boolean') {
                initialIsLiked = postDataFromStore.liked;
                needsSeparateLikeQuery = false;
                console.log('🔍 AccompanyPost: 초기 좋아요 상태 설정 (liked)', postDataFromStore.liked);
            } else {
                console.log('⚠️ AccompanyPost: 좋아요 상태 필드를 찾을 수 없어 별도 API 조회 필요');
            }
            
            // likeCount 필드 확인
            if (typeof postDataFromStore.likeCount === 'number') {
                initialLikeCount = postDataFromStore.likeCount;
                console.log('🔍 AccompanyPost: 초기 좋아요 수 설정 (likeCount)', postDataFromStore.likeCount);
            } else if (typeof postDataFromStore.likes === 'number') {
                initialLikeCount = postDataFromStore.likes;
                console.log('🔍 AccompanyPost: 초기 좋아요 수 설정 (likes)', postDataFromStore.likes);
            } else {
                console.log('⚠️ AccompanyPost: 좋아요 수 필드를 찾을 수 없어 기본값 0 사용');
            }
            
            setIsLiked(initialIsLiked);
            setLikeCount(initialLikeCount);
            
            console.log('✨ AccompanyPost: 좋아요 상태 초기화 완료', {
                설정된_isLiked: initialIsLiked,
                설정된_likeCount: initialLikeCount,
                별도조회필요: needsSeparateLikeQuery
            });
            
            // 별도 좋아요 상태 조회 필요한 경우
            if (needsSeparateLikeQuery && postId && currentUserId) {
                fetchLikeStatus();
            }
        }
    }, [accompanyData?.accompanyInfo]); // Dependency on accompanyData.accompanyInfo

    // 별도 좋아요 상태 조회 함수
    const fetchLikeStatus = useCallback(async () => {
        if (!postId || !currentUserId) return;
        
        try {
            console.log('🔍 AccompanyPost: 별도 좋아요 상태 조회 시작');
            setIsLikeLoading(true);
            
            const likeStatus = await getLikeStatusApi(postId, currentUserId);
            
            setIsLiked(likeStatus.isLiked);
            setLikeCount(likeStatus.likeCount);
            
            console.log('✨ AccompanyPost: 별도 좋아요 상태 조회 완료', likeStatus);
        } catch (error) {
            console.error('❌ AccompanyPost: 별도 좋아요 상태 조회 실패:', error);
            // 실패 시 기본값 유지
            setIsLiked(false);
            setLikeCount(0);
        } finally {
            setIsLikeLoading(false);
        }
    }, [postId, currentUserId]);

    
    // 동행 신청/취소 함수
    // AccompanyPost.jsx - 수정된 handleApplicationPress

    const handleApplicationPress = async () => {
        const currentStatus = userApplicationStatusLocal; // Use local state
        const isCurrentlyApplied = isUserApplied(currentStatus);
        
        console.log('🔄 신청/취소 시작:', {
            currentStatus,
            isCurrentlyApplied,
            postId,
            userId: currentUserId
        });
        
        // 낙관적 업데이트
        const newStatus = isCurrentlyApplied ? null : 'PENDING';
        setUserApplicationStatusLocal(newStatus); // Update local state
        
        try {
            // currentStatus 대신 isCurrentlyApplied 전달
            const result = await toggleApplicationApi(postId, currentUserId, currentStatus);
            console.log('✅ API 호출 성공:', result);
            
            // API 결과의 newStatus를 사용해서 최종 상태 업데이트
            setUserApplicationStatusLocal(result.newStatus); // Update local state
            
            setShowAlarmPopup(true);
            
        } catch (error) {
            console.error(`❌ 동행 ${isCurrentlyApplied ? '취소' : '신청'} 오류:`, error);
            Alert.alert('오류', error.message);
            
            // 🔥 오류 발생 시 원래 상태로 롤백
            setUserApplicationStatusLocal(currentStatus); // Rollback local state
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

    // 참가자 클릭 핸들러 수정 - 읽음 표시 기능 추가
    const handleParticipantsClick = async () => {
    if (isHost) {
        // 호스트는 기존대로 관리 페이지로 이동
        router.push({
            pathname: '/accompany/AccompanyManagement',
            params: {
                postId: postId,
            }
        });
        markApplicationsAsViewed();
    } else {
        // ✅ 게스트의 경우 접근 권한 확인
        const userStatus = userApplicationStatusLocal || accompanyData?.accompanyInfo?.userApplicationStatus;
        const hasAccess = userStatus && ['ACCEPTED'].includes(userStatus);
        
        console.log('🔍 멤버 팝업 접근 권한 확인:', {
            userStatus,
            hasAccess,
            isHost
        });
        
        if (!hasAccess) {
            Alert.alert(
                '접근 제한', 
                '동행을 신청한 사용자만 멤버 목록을 확인할 수 있습니다.',
                [{ text: '확인', style: 'default' }]
            );
            return;
        }
        
        // 권한이 있는 경우에만 멤버 데이터 로딩
        console.log('🔍 게스트용 멤버 팝업 열기 시작');
        const members = await fetchMemberData();
        setMemberPopupData(members);
        setShowMemberPopupGuest(true);
    }
};

    // postId를 사용하여 데이터 로드
    useFocusEffect(
        useCallback(() => {
            if (postId && currentUserId) {
                fetchAccompanyDetail(postId);
                fetchComments(postId);
            } else if (postId === undefined) {
                setError('잘못된 동행 ID입니다.');
                setLoading(false);
            }
            // Cleanup function (optional, but good practice if you have subscriptions/listeners)
            return () => {
                // Any cleanup when the screen loses focus
            };
        }, [postId, currentUserId])
    );

    // // 정기적으로 새로운 신청을 확인하는 useEffect 추가
    // useEffect(() => {
    //     if (!isHost || !postId) return;

    //     const interval = setInterval(() => {
    //         fetchUnreadApplications();
    //     }, 30000); // 30초마다 확인

    //     return () => clearInterval(interval);
    // }, [isHost, postId]);

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

    const handleCloseMemberPopup = () => {
        setShowMemberPopupGuest(false);
        // setShowMemberPopupHost(false);
    };

    const handleClosedPress = () => {
        setShowAlarmPopupHost(true);
    };

    const handleCloseAlarmPopupHost = () => {
        setShowAlarmPopupHost(false);
    };

    const handleConfirmClose = async () => {
        // 1. 즉시 UI 업데이트 (낙관적 업데이트)
        setAccompanyData(prev => ({ // Use Zustand store action
            ...prev,
            accompanyInfo: {
                ...prev.accompanyInfo,
                status: 'COMPLETED'  // 동행 상태를 COMPLETED로 변경
            }
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
            setAccompanyData(prev => ({
                ...prev,
                accompanyInfo: {
                    ...prev.accompanyInfo,
                    status: 'RECRUITING'  // 원래 상태로 되돌리기
                }
            }));
            setClosed(false);
            
            Alert.alert('오류', error.message || '동행 마감 처리 중 오류가 발생했습니다.');
        }
    };
    

const fetchMemberData = async () => {
    if (!postId || !currentUserId) return [];
    
    try {
        setMemberDataLoading(true);
        console.log('🔍 멤버 팝업용 데이터 로딩 시작');
        
        const data = await getAccompanyManagementDataApi(postId, currentUserId);
        console.log('🔍 받은 관리 데이터:', data);
        
        // 참가자 데이터를 members 형태로 변환
        const membersList = (data.participants || []).map(participant => ({
            id: participant.id || participant.userId,
            name: participant.nickname || participant.name,
            gender: participant.gender || '미정',
            age: participant.age || '미정',
            isHost: participant.isHost || false,
            tags: participant.tags || (participant.isHost ? ['호스트'] : ['참가자']),
            profileImage: participant.profileImage || null,
            status: 'ACCEPTED'
        }));
        
        console.log('🔍 변환된 멤버 데이터:', membersList);
        return membersList;
        
    } catch (error) {
        console.error('❌ 멤버 데이터 로딩 실패:', error);
        Alert.alert('오류', '멤버 정보를 불러오지 못했습니다.');
        return [];
    } finally {
        setMemberDataLoading(false);
    }
};
const displayParticipants = isHost ? currentParticipants : currentParticipants + 1;

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
    if (error || !accompanyData?.accompanyInfo) {
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
                            { paddingBottom: keyboardVisible ? 0 : 100 }
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
                            title={accompanyData?.accompanyInfo?.title}
                            location={accompanyData?.accompanyInfo?.location}
                            participants={displayParticipants}// From Zustand store
                            maxParticipants={maxParticipants} // From Zustand store
                            newApplication={hasNewApplications} 
                            onParticipantsClick={handleParticipantsClick}
                            postId={postId}
                            currentUserId={currentUserId}
                            status={accompanyData?.accompanyInfo?.status}
                            chatAccess={chatAccess}
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
                                {accompanyData?.accompanyInfo?.createdByName}
                                <Text style={styles.hostInfoLabel}>  게시일 </Text>
                                {accompanyData?.accompanyInfo?.createdAt}
                                <Text style={styles.hostInfoLabel}>  조회수 </Text>
                                {accompanyData?.accompanyInfo?.views}
                            </Text>
                        </View>

                        <EventSchedule
                            travelStartDate={accompanyData?.accompanyInfo?.travelStartDate}
                            travelEndDate={accompanyData?.accompanyInfo?.travelEndDate}
                            recruitStartDate={accompanyData?.accompanyInfo?.recruitStartDate}
                            recruitEndDate={accompanyData?.accompanyInfo?.recruitEndDate}
                        />
                        <Intro
                            message={accompanyData?.accompanyInfo?.description}
                            // photos={accompanyData?.accompanyInfo?.imageUrls || []}
                        />

                        <GatheringPlace
                            location={accompanyData?.accompanyInfo?.meetingPoint}
                        />
                        <Conditions
                            gender={accompanyData?.accompanyInfo?.gender}
                            ageRange={Array.from(accompanyData?.accompanyInfo?.ageRange || [])}
                        />
                        <Categories
                            category={Array.from(accompanyData?.accompanyInfo?.category || [])}
                            tags={Array.from(accompanyData?.accompanyInfo?.tags || [])}
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
                {accompanyData?.accompanyInfo && (
                <View style={styles.bottomButtonContainer}>
                    <AccompanyBottomButton
                        isHost={isHost}
                        accompanyStatus={accompanyData?.accompanyInfo?.status}
                        userApplicationStatus={accompanyData?.accompanyInfo?.userApplicationStatus}
                        onPress={isHost ? handleClosedPress : handleApplicationPress}
                        likes={likeCount}
                        isLiked={isLiked}
                        onLikeToggle={handleLikeToggle}
                        isLoading={isLikeLoading}
                    />
                </View>
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
                                {isUserApplied(userApplicationStatusLocal)
                                    ? `동행 신청이 완료되었습니다.\n호스트가 수락하거나 거절하면 알림이 발송됩니다.\n수락되기 전까지 신청을 취소할 수 있습니다.`
                                    : `동행 신청이 취소되었습니다.\n다시 신청하시려면 아래 버튼을 눌러주세요.`}
                            </Text>
                        }
                        onClose={handleCloseAlarmPopup}
                    />
                )}

                {showDeletePopup && (
                    <AlarmPopup
                        alarmText={
                            <Text style={styles.alarmPopupText}>
                                {`정말 이 동행을 삭제하시겠습니까?\n삭제된 게시물은 복구할 수 없습니다.`}
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
                        members={memberPopupData}
                        // 올바른 최대 참가자 수 전달
                        maxParticipants={accompanyData?.accompanyInfo?.maxParticipants || 0}
                        currentCount={memberPopupData.length} // 실제 멤버 수
                        onClose={() => {
                            setShowMemberPopupGuest(false);
                            setMemberPopupData([]);
                        }}
                        loading={memberDataLoading}
                    />
                )}

                {/* {showMemberPopupHost && (
                    <AccompanyManagement
                        members={participants}
                        onClose={handleCloseMemberPopup}
                        isHost={true}
                    />
                )} */}
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