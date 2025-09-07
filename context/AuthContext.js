import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('jwtToken');
                const userId = await AsyncStorage.getItem('userId');
                
                if (token && userId) {
                    // 토큰 유효성 검증
                    try {
                        const response = await fetch(`${getBaseURL()}/api/user/profile`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        
                        if (response.status === 403 || response.status === 401) {
                            throw new Error('토큰 만료');
                        }
                        
                        setUser({ authenticated: true });
                        setCurrentUserId(userId);
                    } catch (tokenError) {
                        console.log('토큰 유효성 검증 실패, 로그아웃');
                        await AsyncStorage.removeItem('jwtToken');
                        await AsyncStorage.removeItem('userId');
                        setUser(null);
                        setCurrentUserId(null);
                    }
                } else {
                    setUser(null);
                    setCurrentUserId(null);
                }
            } catch (e) {
                console.error("인증 상태 확인 실패:", e);
                setUser(null);
                setCurrentUserId(null);
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
    }, []);

    const signIn = async (token, userId) => {
        try {
            await AsyncStorage.setItem('jwtToken', token);
            await AsyncStorage.setItem('userId', String(userId));
            setUser({ authenticated: true });
            setCurrentUserId(String(userId));
        } catch (e) {
            console.error("Failed to sign in:", e);
        }
    };

    // 확인 팝업이 있는 기존 signOut (사용하지 않을 예정)
    const signOut = async () => {
        if (Platform.OS === 'web') {
            const confirmLogout = confirm('현재 계정에서 로그아웃하시겠습니까?');
            if (confirmLogout) {
                await performLogout();
            }
        } else {
            Alert.alert(
                '로그아웃',
                '현재 계정에서 로그아웃하시겠습니까?',
                [
                    {
                        text: '네',
                        onPress: async () => await performLogout(),
                    },
                    {
                        text: '아니오',
                        style: 'cancel',
                    },
                ],
                { cancelable: false }
            );
        }
    };

    // 확인 없이 바로 로그아웃하는 함수 (새로 추가)
    const performLogout = async () => {
        try {
            await AsyncStorage.removeItem('jwtToken');
            await AsyncStorage.removeItem('userId');
            setUser(null);
            setCurrentUserId(null);
            console.log('로그아웃 성공');
        } catch (e) {
            console.error("Failed to sign out:", e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                performLogout, // 새로 추가된 함수
                user,
                currentUserId,
                loading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}