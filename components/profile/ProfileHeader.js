import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const defaultProfile = require('../../assets/defaultProfile1.png');

// 목 데이터
const mockUserData = {
    userPhoto: null, // null이면 defaultProfile 사용
    userNickname: '생귤탱귤김탱볼',
    userAge: '22세',
    userSex: '여',
    userType: '#계획적인 모험가',
};

export function ProfileHeader() {
    const { userPhoto, userNickname, userAge, userSex, userType } = mockUserData;
    
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
                        <Text style={styles.userNickname}>{userNickname}</Text>
                        <Text style={styles.userMeta}>· {userSex} · {userAge}</Text>
                    </View>
                </View>
                
                {/* 사용자 타입 */}
                <Text style={styles.userType}>{userType}</Text>
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
        height: 100,
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
        gap: 4,
        flexWrap: 'wrap',
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userNickname: {
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
});