import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfileApi } from '../../utils/ProfileApi';

import { useRouter } from 'expo-router';

const defaultProfile = require('../../assets/defaultProfile1.png');

export function ProfileHeader() { // onLogout prop 제거
    const router = useRouter(); // useRouter 훅 사용
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    const data = await fetchUserProfileApi(userId);
                    setUserData(data);
                }
            } catch (error) {
            }
        };

        fetchUserData();
    }, []);

    if (!userData) {
        return null;
    }

    const { profileImage, nickname, age, gender, tags } = userData;
    
    return (
        <View style={styles.headerContainer}>
            <View style={styles.profileImageContainer}>
                <Image 
                    source={profileImage ? { uri: profileImage } : defaultProfile}
                    style={styles.profileImage}
                />
            </View>
            
            <View style={styles.profileInfoContainer}>
                <View style={styles.profileHeader}>
                    <Text style={styles.profileTitle}>내 프로필</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.editButton}>
                            <Ionicons name="pencil" size={22} color="#666" />
                        </TouchableOpacity>
                        {/* 설정 아이콘 버튼 추가 */}
                        <TouchableOpacity 
                            onPress={() => router.push('/profile/settings')} 
                            style={styles.settingsButton}
                        >
                            <Ionicons name="reorder-three" size={28} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.userBasicInfo}>
                    <View style={styles.userAllInfo}>
                        <Text style={styles.userNickname}>{nickname}</Text>
                        <Text style={styles.userMeta}>· {gender} · {age}세</Text>
                    </View>
                </View>
                
                <Text style={styles.userType}>{tags?.join(' ')}</Text>
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