import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Image,
    SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AccompanyManagement = ({ navigation }) => {
    const [likeCount, setLikeCount] = useState(122);
    const [isLiked, setIsLiked] = useState(false);

    // 동행 신청자 데이터
    const applicants = [
        { 
        id: 1,
        nickname: '서휘경',
        gender: '여', 
        age: 20, 
        hashtags: '#안녕하세요 #졸려 #이것만하구자야디'
        },
        { 
        id: 2,
        nickname: '김태연',
        gender: '여', 
        age: 20, 
        hashtags: '#김태뿌지직 #아닙니다 #방구쟁이아닙니다'
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
        }
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
            source={require('../assets/defaultProfile.png')} 
            style={styles.profileImage} 
            defaultSource={require('../assets/defaultProfile.png')}
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
            <TouchableOpacity style={applicant.id === 1 ? styles.acceptButtonGray : styles.acceptButton}>
            <Text style={applicant.id === 1 ? styles.acceptTextGray : styles.acceptText}>수락</Text>
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
            source={require('../assets/defaultProfile.png')} 
            style={styles.profileImage} 
            defaultSource={require('../assets/defaultProfile.png')}
            />
            <View style={styles.userInfo}>
            <View style={styles.nameRow}>
                <Text style={styles.nickname}>{companion.nickname}</Text>
                <Text style={styles.genderAge}> · {companion.gender} · {companion.age}세</Text>
                {companion.id === 1 && <Text style={styles.hostTag}>호스트</Text>}
            </View>
            <Text style={styles.hashtags}>{companion.hashtags}</Text>
            </View>
        </View>
        </View>
    );

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

        <ScrollView>
            {/* 동행 신청 섹션 */}
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>동행 신청 <Text style={styles.countText}>5건</Text></Text>
            
            {applicants.map(applicant => renderApplicant(applicant))}
            </View>

            {/* 동행 목록 섹션 */}
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>동행 목록 <Text style={styles.countText}>3명 / 5명</Text></Text>
            
            {companions.map(companion => renderCompanion(companion))}
            </View>
        </ScrollView>

        {/* 하단 버튼 영역 */}
        <View style={styles.footer}>
            <TouchableOpacity style={styles.recruitButton}>
            <Text style={styles.recruitButtonText}>모집 마감</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.likeButton} onPress={toggleLike}>
            <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked ? "red" : "black"} 
            />
            <Text style={styles.likeCount}>{likeCount}</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        fontWeight: '600',
    },
    section: {
        paddingTop: 15,
        paddingBottom: 5,
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
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
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
        fontWeight: '500',
    },
    genderAge: {
        fontSize: 14,
        color: '#666',
    },
    hostTag: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5,
    },
    hashtags: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    acceptButton: {
        backgroundColor: 'black',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
        marginRight: 5,
    },
    acceptButtonGray: {
        backgroundColor: '#CCCCCC',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
        marginRight: 5,
    },
    acceptText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    acceptTextGray: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    rejectButton: {
        backgroundColor: 'black',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    rejectText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        padding: 15,
    },
    recruitButton: {
        flex: 1,
        backgroundColor: 'black',
        borderRadius: 4,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recruitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    likeCount: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    }
});

export default AccompanyManagement;