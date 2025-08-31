import React from 'react';
import useUserStore from '../../context/userStore';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

const defaultProfile = require('../../assets/defaultProfile1.png');

export function ProfileHeader() {
    const router = useRouter();
    const { userData } = useUserStore();

    if (!userData) {
        return null;
    }

    const { profileImage, nickname, age, gender, tags } = userData;
    
    return (
        <View style={styles.headerContainer}>
            {/* 프로필 이미지 */}
            <View style={styles.profileImageContainer}>
                <Image 
                    source={profileImage ? { uri: profileImage } : defaultProfile}
                    style={styles.profileImage}
                />
            </View>
            
            {/* 프로필 정보 */}
            <View style={styles.profileInfoContainer}>
                {/* 헤더 제목 및 아이콘 */}
                <View style={styles.profileHeader}>
                    <Text style={styles.profileTitle}>내 프로필</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity 
                            onPress={() => router.push('/profile/edit')}
                            style={styles.editButton}
                        >
                            <Ionicons name="pencil" size={22} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => router.push('/profile/settings')} 
                            style={styles.settingsButton}
                        >
                            <Ionicons name="reorder-three" size={28} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* 사용자 기본 정보 (닉네임, 성별, 나이) */}
                <View style={styles.userBasicInfo}>
                    <Text style={styles.userNickname}>{nickname}</Text>
                    <Text style={styles.userMeta}>· {gender} · {age}세</Text>
                </View>
                
                {/* 사용자 태그 */}
                <View style={styles.tagsContainer}>
                    <Text style={styles.userType}>{tags?.join(' ')}</Text>
                </View>
            </View>
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
        flexDirection: 'row',
        paddingHorizontal: 30,
        paddingVertical: 15,
        alignItems: 'flex-start',
    },
    profileImageContainer: {
        marginRight: 15,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f0f0f0',
    },
    profileInfoContainer: {
        flex: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        padding: 4,
    },
    settingsButton: {
        padding: 4,
        marginLeft: 8,
    },
    userBasicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    userNickname: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    userMeta: {
        fontSize: 12,
        color: '#666',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    userType: {
        fontSize: 11,
        fontWeight: '500',
        color: '#555',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
});