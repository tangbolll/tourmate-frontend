import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// 멤버 컴포넌트 - 각 사용자 정보를 표시
const Member = ({ 
    profileImage, 
    nickname, 
    gender, 
    age, 
    hashtags,
    isApplicant = false, // 신청자인지 동행 목록인지 구분
    onAccept, // 수락 버튼 클릭시
    onReject // 거절 버튼 클릭시
}) => {
    return (
        <View style={styles.container}>
        {/* 좌측 프로필 이미지 */}
        <Image 
            source={profileImage || require('../assets/defaultProfile.png')} 
            style={styles.profileImage} 
        />
        
        {/* 중앙 사용자 정보 */}
        <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
            <Text style={styles.nickname}>{nickname}</Text>
            <Text style={styles.genderAge}>{gender} · {age}세</Text>
            {!isApplicant && <Text style={styles.hostBadge}>호스트</Text>}
            </View>
            
            <Text style={styles.hashtags}>{hashtags}</Text>
        </View>
        
        {/* 우측 버튼 (신청자일 경우) */}
        {isApplicant && (
            <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={styles.acceptButton} 
                onPress={onAccept}
            >
                <Text style={styles.acceptButtonText}>수락</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.rejectButton} 
                onPress={onReject}
            >
                <Text style={styles.rejectButtonText}>거절</Text>
            </TouchableOpacity>
            </View>
        )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E1E1E1',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    nickname: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    genderAge: {
        fontSize: 12,
        color: '#777',
        marginRight: 6,
    },
    hostBadge: {
        fontSize: 10,
        color: '#fff',
        backgroundColor: '#666',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    hashtags: {
        fontSize: 12,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    acceptButton: {
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 4,
    },
    acceptButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    rejectButton: {
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    rejectButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
    }
});

export default Member;