import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Image,
    SafeAreaView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AccompanyBottomButton from '../../components/accompany/AccompanyBottomButton'; 
import CloseAlarmPopup from '../../components/accompany/CloseAlarmPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    toggleLikeApi, 
    getLikeStatusApi, 
} from '../../utils/AccompanyPostApi';

import { 
    acceptApplicationApi, 
    rejectApplicationApi, 
    removeParticipantApi, 
    closeAccompanyApi, 
    getAccompanyManagementDataApi 
} from '../../utils/AccompanyManagementApi';
import { useAuth } from '../../context/AuthContext';

const AccompanyManagement = () => {
    const { currentUserId } = useAuth();
    const params = useLocalSearchParams();
    const router = useRouter();
    const { postId } = params;
    
    // 기본 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 동행 관리 데이터
    const [accompanyData, setAccompanyData] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [participants, setParticipants] = useState([]);
    
    // 좋아요 상태와 좋아요 수를 별도로 관리
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    
    // 동행 상태 관리
    const [accompanyStatus, setAccompanyStatus] = useState('RECRUITING');
    const [userApplicationStatus, setUserApplicationStatus] = useState(null);
    
    // UI 상태
    const [applicantScrollPosition, setApplicantScrollPosition] = useState(0);
    const [companionScrollPosition, setCompanionScrollPosition] = useState(0);
    const [popupVisible, setPopupVisible] = useState(false);
    
    const applicantScrollRef = useRef(null);
    const companionScrollRef = useRef(null);

    // 좋아요 토글 함수
    const handleLikeToggle = useCallback(async () => {
        if (!postId || !currentUserId) {
            Alert.alert('오류', '게시물 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        if (isLikeLoading) {
            return;
        }

        try {
            setIsLikeLoading(true);
            
            const result = await toggleLikeApi(postId, currentUserId);
            
            setIsLiked(Boolean(result.isLiked));
            setLikeCount(Number(result.likeCount) || 0);
            
        } catch (error) {
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLikeLoading(false);
        }
    }, [postId, currentUserId, isLikeLoading]);

    // 신청 수락 처리 - ID 타입 변환 추가
    const handleAcceptApplication = async (applicantId) => {
        try {
            
            // ✅ ID를 숫자로 변환
            const numericApplicantId = Number(applicantId);
            
            if (isNaN(numericApplicantId)) {
                Alert.alert('오류', '유효하지 않은 사용자 ID입니다.');
                return;
            }
            
            await acceptApplicationApi(postId, numericApplicantId);
            
            // UI 업데이트: 신청자를 참가자로 이동
            const acceptedApplicant = applicants.find(app => Number(app.id) === numericApplicantId);
            if (acceptedApplicant) {
                setApplicants(prev => prev.filter(app => Number(app.id) !== numericApplicantId));
                setParticipants(prev => [...prev, { ...acceptedApplicant, isHost: false }]);
            }
            
            Alert.alert('성공', '신청을 수락했습니다.');
            
        } catch (error) {
            Alert.alert('오류', error.message || '신청 수락에 실패했습니다.');
        }
    };

    // 신청 거절 처리 - ID 타입 변환 추가
    const handleRejectApplication = async (applicantId) => {
        try {
            
            // ✅ ID를 숫자로 변환
            const numericApplicantId = Number(applicantId);
            
            if (isNaN(numericApplicantId)) {
                Alert.alert('오류', '유효하지 않은 사용자 ID입니다.');
                return;
            }
            
            await rejectApplicationApi(postId, numericApplicantId);
            
            // UI 업데이트: 신청자 목록에서 제거
            setApplicants(prev => prev.filter(app => Number(app.id) !== numericApplicantId));
            
            Alert.alert('성공', '신청을 거절했습니다.');
            
        } catch (error) {
            Alert.alert('오류', error.message || '신청 거절에 실패했습니다.');
        }
    };

    // 참가자 내보내기 처리 - ID 타입 변환 추가
    const handleRemoveParticipant = async (participantId) => {
        try {
            
            // ✅ ID를 숫자로 변환
            const numericParticipantId = Number(participantId);
            
            if (isNaN(numericParticipantId)) {
                Alert.alert('오류', '유효하지 않은 사용자 ID입니다.');
                return;
            }
            
            await removeParticipantApi(postId, numericParticipantId);
            
            // UI 업데이트: 참가자 목록에서 제거
            setParticipants(prev => prev.filter(participant => Number(participant.id) !== numericParticipantId));
            
            Alert.alert('성공', '참가자를 내보냈습니다.');
            
        } catch (error) {
            Alert.alert('오류', error.message || '참가자 내보내기에 실패했습니다.');
        }
    };

    // 데이터 로드 후 ID 타입 확인을 위한 로깅 추가
    const fetchAccompanyManagementData = async () => {
        if (!currentUserId) return;
        try {
            setLoading(true);
            setError(null);
            
            const data = await getAccompanyManagementDataApi(postId, currentUserId);
            
            // ✅ 받은 데이터 구조 확인
                applicants: data.applicants,
                participants: data.participants,
                applicantsIds: data.applicants?.map(app => ({ id: app.id, type: typeof app.id })),
                participantsIds: data.participants?.map(part => ({ id: part.id, type: typeof part.id }))
            });
            
            setAccompanyData(data.accompanyInfo);
            setApplicants(data.applicants || []);
            setParticipants(data.participants || []);
            
            // 동행 상태 설정
            setAccompanyStatus(data.accompanyInfo.status || 'RECRUITING');
            
            // 좋아요 정보 설정
            setIsLiked(data.accompanyInfo.isLiked || false);
            setLikeCount(data.accompanyInfo.likeCount || data.accompanyInfo.likes || 0);
            
        } catch (err) {
            setError(err.message || '데이터를 불러오지 못했습니다.');
            Alert.alert('오류', '동행 관리 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 모집 마감 처리 함수
    const handleClosedPress = () => {
        if (accompanyStatus === 'RECRUITING') {
            setPopupVisible(true);
        }
    };

    // 마감 확인 처리
    const handleConfirmClose = async () => {
        try {
            await closeAccompanyApi(postId);
            
            setAccompanyStatus('COMPLETED');
            setPopupVisible(false);
            
            Alert.alert('성공', '동행 모집이 마감되었습니다.');
            
        } catch (error) {
            Alert.alert('오류', error.message || '동행 마감에 실패했습니다.');
        }
    };

    const handleCancelClose = () => {
        setPopupVisible(false);
    };

    // 신청자 렌더링
    const renderApplicant = (applicant) => (
        <View key={applicant.id} style={styles.memberRow}>
            <View style={styles.profileSection}>
                <Image 
                    source={applicant.profileImage ? { uri: applicant.profileImage } : require('../../assets/defaultProfile.png')} 
                    style={styles.profileImage} 
                    defaultSource={require('../../assets/defaultProfile.png')}
                />
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.nickname}>{applicant.nickname || applicant.name}</Text>
                        <Text style={styles.genderAge}> · {applicant.gender} · {applicant.age}세</Text>
                    </View>
                    <Text style={styles.hashtags}>{applicant.hashtags || applicant.tags}</Text>
                </View>
            </View>
            
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => handleAcceptApplication(applicant.id)}
                >
                    <Text style={styles.acceptText}>수락</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleRejectApplication(applicant.id)}
                >
                    <Text style={styles.rejectText}>거절</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // 동행 목록 렌더링
    const renderCompanion = (companion) => (
        <View key={companion.id} style={styles.memberRow}>
            <View style={styles.profileSection}>
                <Image 
                    source={companion.profileImage ? { uri: companion.profileImage } : require('../../assets/defaultProfile.png')} 
                    style={styles.profileImage} 
                    defaultSource={require('../../assets/defaultProfile.png')}
                />
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.nickname}>{companion.nickname || companion.name}</Text>
                        <Text style={styles.genderAge}> · {companion.gender} · {companion.age}세</Text>
                        {companion.isHost && <Text style={styles.hostTag}>호스트</Text>}
                    </View>
                    <Text style={styles.hashtags}>{companion.hashtags || companion.tags}</Text>
                </View>
            </View>
            
            {/* 호스트가 아닌 참가자에게는 내보내기 버튼 표시 */}
            {!companion.isHost && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveParticipant(companion.id)}
                    >
                        <Text style={styles.removeText}>내보내기</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    // 스크롤 위치 계산 함수들
    const handleApplicantScroll = (event) => {
        const scrollHeight = event.nativeEvent.contentSize.height;
        const scrollPosition = event.nativeEvent.contentOffset.y;
        const visibleHeight = event.nativeEvent.layoutMeasurement.height;
        
        const position = scrollPosition / (scrollHeight - visibleHeight);
        setApplicantScrollPosition(position);
    };

    const handleCompanionScroll = (event) => {
        const scrollHeight = event.nativeEvent.contentSize.height;
        const scrollPosition = event.nativeEvent.contentOffset.y;
        const visibleHeight = event.nativeEvent.layoutMeasurement.height;
        
        const position = scrollPosition / (scrollHeight - visibleHeight);
        setCompanionScrollPosition(position);
    };

    // 스크롤 인디케이터 렌더링
    const renderScrollIndicator = (position) => {
        return (
            <View style={styles.scrollIndicatorContainer}>
                <View 
                    style={[
                        styles.scrollIndicator, 
                        { top: `${Math.min(position * 100, 100)}%` }
                    ]} 
                />
            </View>
        );
    };

    // 초기 데이터 로드
    useEffect(() => {
        if (postId && currentUserId) {
            fetchAccompanyManagementData();
        } else if (postId === undefined) {
            setError('잘못된 동행 ID입니다.');
            setLoading(false);
        }
    }, [postId, currentUserId]);

    // 로딩 상태
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#666' }}>동행 관리 정보를 불러오는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 에러 상태
    if (error || !accompanyData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 18, color: '#FF6B6B', marginBottom: 10 }}>
                        오류가 발생했습니다
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
                        {error || '동행 관리 정보를 불러올 수 없습니다.'}
                    </Text>
                    <TouchableOpacity
                        style={{ backgroundColor: '#cfd2d5ff', padding: 12, borderRadius: 8 }}
                        onPress={() => router.back()}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>돌아가기</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const applicationCnt = applicants.length;
    const currentMember = participants.length;
    const totalMember = accompanyData?.maxParticipants || 5;

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>동행 관리</Text>
                <View style={{width: 24}} />
            </View>

            <View style={styles.mainContainer}>
                {/* 동행 신청 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>동행 신청 <Text style={styles.countText}> {applicationCnt}건</Text></Text>
                    
                    <View style={styles.scrollContainer}>
                        <ScrollView 
                            ref={applicantScrollRef}
                            onScroll={handleApplicantScroll}
                            scrollEventThrottle={16}
                            style={styles.applicantList}
                            nestedScrollEnabled={true}
                            contentContainerStyle={styles.scrollContentContainer}
                        >
                            {applicants.map(applicant => renderApplicant(applicant))}
                            {applicants.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>새로운 신청이 없습니다.</Text>
                                </View>
                            )}
                        </ScrollView>
                        {renderScrollIndicator(applicantScrollPosition)}
                    </View>
                </View>

                {/* 동행 목록 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>동행 목록 <Text style={styles.countText}> {currentMember}명 / {totalMember}명</Text></Text>
                    
                    <View style={styles.scrollContainer}>
                        <ScrollView 
                            ref={companionScrollRef}
                            onScroll={handleCompanionScroll}
                            scrollEventThrottle={16}
                            style={styles.companionList}
                            nestedScrollEnabled={true}
                            contentContainerStyle={styles.scrollContentContainer}
                        >
                            {participants.map(companion => renderCompanion(companion))}
                        </ScrollView>
                        {renderScrollIndicator(companionScrollPosition)}
                    </View>
                </View>
            </View>

            {/* 하단 버튼 영역 */}
            {/* <AccompanyBottomButton
                isHost={true}
                accompanyStatus={accompanyStatus}
                userApplicationStatus={userApplicationStatus}
                onPress={handleClosedPress}
                likes={likeCount}
                isLiked={isLiked}
                onLikeToggle={handleLikeToggle}
                isLoading={isLikeLoading}
            /> */}

            {/* 마감 확인 팝업 */}
            <CloseAlarmPopup 
                visible={popupVisible}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        paddingTop: 15,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    countText: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666',
    },
    scrollContainer: {
        flexDirection: 'row', 
        position: 'relative',
    },
    applicantList: {
        height: 180,
        flex: 1,
    },
    companionList: {
        height: 300,
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 15,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        minHeight: 60,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#CCCCCC',
    },
    userInfo: {
        marginLeft: 10,
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nickname: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    genderAge: {
        fontSize: 14,
        color: '#666',
    },
    hostTag: {
        fontSize: 12,
        color: '#000',
        marginLeft: 5,
        backgroundColor: '#DEE2E6',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 8,
    },
    hashtags: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        width: 120,
    },
    acceptButton: {
        backgroundColor: 'black',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginRight: 5,
        alignItems: 'center',
        width: 55,
    },
    acceptText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '500',
    },
    rejectButton: { 
        backgroundColor: 'black',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginRight: 5,
        alignItems: 'center',
        width: 55,
    },
    rejectText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '500',
    },
    removeButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 20,
        alignItems: 'center',
        width: 70,
    },
    removeText: {
        color: 'black',
        fontSize: 12,
        fontWeight: '500',
    },
    scrollIndicatorContainer: {
        width: 4,
        backgroundColor: '#EEEEEE',
        borderRadius: 2,
        position: 'absolute',
        right: 5,
        top: 0, 
        bottom: 0,
        marginVertical: 5,
    },
    scrollIndicator: {
        width: 4,
        height: 40,
        backgroundColor: '#999',
        borderRadius: 2,
        position: 'absolute',
    },
    emptyContainer: {
        padding: 80,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
});

export default AccompanyManagement;