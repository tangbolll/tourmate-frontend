import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const defaultProfile = require('../../assets/defaultProfile1.png');

// 목 데이터
const mockUserData = {
    userPhoto: null, // null이면 defaultProfile 사용
    userId: '@hwi02',
    userName: '서휘경',
    userBirth: '2001-01-01',
    userSex: '여',
    userType: '계획적인 모험가',
    userInfo: '계획적인 여행을 좋아하지만, 새로운 경험을 하고 싶어요.\n다양한 활동을 하는 여행을 하고 싶습니다!'
};

export function ProfileHeader() {
    const { userPhoto, userId, userName, userBirth, userSex, userType, userInfo } = mockUserData;
    
    return (
        <View style={styles.headerContainer}>
            {/* 프로필 이미지와 수정 아이콘 */}
            <View style={styles.profileImageContainer}>
                <Image 
                    source={userPhoto ? { uri: userPhoto } : defaultProfile}
                    style={styles.profileImage}
                />
            </View>
            
            {/* 프로필 정보 */}
            <View style={styles.profileInfoContainer}>
                {/* 내 프로필 헤더와 수정 아이콘 */}
                <View style={styles.profileHeader}>
                    <Text style={styles.profileTitle}>내 프로필</Text>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="pencil" size={18} color="#666" />
                    </TouchableOpacity>
                </View>
                
                {/* 사용자 기본 정보 */}
                <View style={styles.userBasicInfo}>
                    <View style={styles.userAllInfo}>
                        <Text style={styles.userId}>{userId}</Text>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.userMeta}>· {userBirth} · {userSex}</Text>
                    </View>
                </View>
                
                {/* 사용자 타입 */}
                <Text style={styles.userType}>{userType}</Text>
                
                {/* 사용자 소개 */}
                <Text style={styles.userInfo}>{userInfo}</Text>
            </View>
        </View>
    );
}

export default function ProfileHome() {
    return (
        <View style={styles.container}>
            <ProfileHeader />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        marginTop: 60,
        height: 150,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'flex-start',
    },
    profileImageContainer: {
        marginRight: 15,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
    },
    profileInfoContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'space-between',
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    profileTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    editButton: {
        padding: 4,
    },
    userBasicInfo: {
        marginBottom: 6,
    },
    userAllInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    userId: {
        fontSize: 12,
        color: '#888',
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
    },
    userMeta: {
        fontSize: 12,
        color: '#666',
    },
    userType: {
        fontSize: 11,
        fontWeight: '500',
        color: '#555',
        marginBottom: 6,
        backgroundColor: '#f5f5f5',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    userInfo: {
        fontSize: 12,
        color: '#444',
        lineHeight: 18,
        flex: 1,
        // 한 줄 넘어가면 아래로 자동 줄바꿈
        flexWrap: 'wrap',
    },
});