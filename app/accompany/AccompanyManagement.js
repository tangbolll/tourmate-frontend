import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Image,
    SafeAreaView,
    Dimensions,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApplicationButton from '../../components/accompany/ApplicationButton';
import CloseAlarmPopup from '../../components/accompany/CloseAlarmPopup'; // 새로운 팝업 컴포넌트

const AccompanyManagement = ({ navigation }) => {
    const [likeCount, setLikeCount] = useState(122);
    const [isLiked, setIsLiked] = useState(false);
    const [closed, setIsClosed] = useState(false);  // 동행 마감 상태
    const [applicantScrollPosition, setApplicantScrollPosition] = useState(0);
    const [companionScrollPosition, setCompanionScrollPosition] = useState(0);
    const [popupVisible, setPopupVisible] = useState(false); // 팝업 표시 상태
    
    const applicantScrollRef = useRef(null);
    const companionScrollRef = useRef(null);

    const handleClosedPress = () => {
        // 이미 마감된 상태가 아닐 때만 팝업 표시
        if (!closed) {
            setPopupVisible(true);
        }
    };

    const handleConfirmClose = () => {
        console.log("동행 마감 확인");
        setIsClosed(true);
        setPopupVisible(false);
    };

    const handleCancelClose = () => {
        console.log("동행 마감 취소");
        setPopupVisible(false);
    };

    // 동행 신청자 데이터
    const applicants = [
        { 
        id: 1,
        nickname: '서휘경',
        gender: '여', 
        age: 20, 
        hashtags: '#안뇽 #졸려 #이것만하구자야디'
        },
        { 
        id: 2,
        nickname: '김태연',
        gender: '여', 
        age: 20, 
        hashtags: '#김태뿌지직 #아닙니다 #방구쟁이아닙니다 #사실그짓말입니다'
        },
        { 
        id: 3,
        nickname: '김윤서',
        gender: '여', 
        age: 20, 
        hashtags: '#기획팀멋져요 #파이팅'
        },
        { 
        id: 4,
        nickname: '김서연',
        gender: '여', 
        age: 20, 
        hashtags: '#관광 #21 #가지가지'
        },
        { 
        id: 5,
        nickname: '김민수',
        gender: '여', 
        age: 21, 
        hashtags: '#백엔드는 #잘 #되어가시나요'
        }
    ];

    // 동행 목록 데이터
    const companions = [
        { 
        id: 1,
        nickname: '여라미',
        gender: '여', 
        age: 22, 
        hashtags: '#즉흥적인 계획가 #맛집탐방',
        isHost: true
        },
        { 
        id: 2,
        nickname: '지백',
        gender: '여', 
        age: 24, 
        hashtags: '#무계획여행 #맛집탐방 #호캉스'
        },
        { 
        id: 3,
        nickname: '주리를틀어라',
        gender: '여', 
        age: 21, 
        hashtags: '#활기찬 탐방가 #맛집탐방 #국토순례'
        },
    ];

    // 좋아요 토글
    const toggleLike = () => {
        if (isLiked) {
        setLikeCount(likeCount - 1);
        } else {
        setLikeCount(likeCount + 1);
        }
        setIsLiked(!isLiked);
    };

    // 신청자 렌더링
    const renderApplicant = (applicant) => (
        <View key={applicant.id} style={styles.memberRow}>
        <View style={styles.profileSection}>
            <Image 
            source={require('../../assets/defaultProfile.png')} 
            style={styles.profileImage} 
            defaultSource={require('../../assets/defaultProfile.png')}
            />
            <View style={styles.userInfo}>
            <View style={styles.nameRow}>
                <Text style={styles.nickname}>{applicant.nickname}</Text>
                <Text style={styles.genderAge}> · {applicant.gender} · {applicant.age}세</Text>
            </View>
            <Text style={styles.hashtags}>{applicant.hashtags}</Text>
            </View>
        </View>
        
        <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptText}>수락</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton}>
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
            source={require('../../assets/defaultProfile.png')} 
            style={styles.profileImage} 
            defaultSource={require('../../assets/defaultProfile.png')}
            />
            <View style={styles.userInfo}>
            <View style={styles.nameRow}>
                <Text style={styles.nickname}>{companion.nickname}</Text>
                <Text style={styles.genderAge}> · {companion.gender} · {companion.age}세</Text>
                {companion.isHost && <Text style={styles.hostTag}>호스트</Text>}
            </View>
            <Text style={styles.hashtags}>{companion.hashtags}</Text>
            </View>
        </View>
        </View>
    );

    // 스크롤 위치 계산 함수
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

    // 단순화된 데이터 변수
    const applicationCnt = applicants.length;
    const currentMember = companions.length;
    const totalMemeber = 5; // 예시 총 인원

    return (
        <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>동행 관리</Text>
            <View style={{width: 24}} />
        </View>

        <View style={styles.mainContainer}>
            {/* 동행 신청 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>동행 신청 <Text style={styles.countText}>{applicationCnt}건</Text></Text>
                
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
                    </ScrollView>
                    {renderScrollIndicator(applicantScrollPosition)}
                </View>
            </View>

            {/* 동행 목록 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>동행 목록 <Text style={styles.countText}>{currentMember}명 / {totalMemeber}명</Text></Text>
                
                <View style={styles.scrollContainer}>
                    <ScrollView 
                        ref={companionScrollRef}
                        onScroll={handleCompanionScroll}
                        scrollEventThrottle={16}
                        style={styles.companionList}
                        nestedScrollEnabled={true}
                        contentContainerStyle={styles.scrollContentContainer}
                    >
                        {companions.map(companion => renderCompanion(companion))}
                    </ScrollView>
                    {renderScrollIndicator(companionScrollPosition)}
                </View>
            </View>
        </View>

        {/* 하단 버튼 영역 */}
        <ApplicationButton
            title={closed ? "모집이 마감된 동행입니다" : "모집 마감"}
            onPress={handleClosedPress}
            closed={closed}
            customStyle={closed ? styles.disabledButton : {}}
            customTextStyle={closed ? styles.ButtonText : {}}
        />

        {/* 마감 확인 팝업 - 새로운 스타일의 팝업 사용 */}
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
        height: 180, // 약 3개의 항목이 보이도록 조정 (60px * 3)
        flex: 1,
    },
    companionList: {
        height: 300, // 약 5개의 항목이 보이도록 조정 (60px * 5)
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
        height: 60,
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
    closedButton: {
        backgroundColor: '#808080',
    },
    closedButtonText: {
        color: 'white',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalContent: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'left',
    },
    modalText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    leftButton: {
        borderRightWidth: 0.5,
        borderRightColor: '#eee',
    },
    rightButton: {
        borderLeftWidth: 0.5,
        borderLeftColor: '#eee',
    },
    buttonTextBold: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default AccompanyManagement;