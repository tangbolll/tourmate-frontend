import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native'; // 이 줄 추가

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}
// 프론트엔드에서 실행할 디버깅 코드 -- 이거 나중을 위해 남겨둡니다.. 로그인 문제 해결되면 알아서 지울게여 탱
export const debugUserDataMismatch = async () => {
    console.log('=== 사용자 데이터 불일치 디버깅 ===');
    
    // 1. AsyncStorage에서 저장된 정보 확인
    const storedUserId = await AsyncStorage.getItem('userId');
    const storedUserEmail = await AsyncStorage.getItem('userEmail');
    
    console.log('📱 AsyncStorage userId:', storedUserId);
    console.log('📱 AsyncStorage userEmail:', storedUserEmail);
    
    // 2. JWT 토큰에서 추출한 정보 확인
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🔑 JWT payload:', payload);
            console.log('🔑 JWT userId:', payload.userId);
            console.log('🔑 JWT userEmail:', payload.userEmail);
            console.log('🔑 JWT sub:', payload.sub);
            
            // 3. 데이터 일치성 확인
            console.log('🔍 AsyncStorage vs JWT 비교:');
            console.log('- userId 일치:', storedUserId == payload.userId);
            console.log('- userEmail 일치:', storedUserEmail === payload.userEmail);
            
        } catch (error) {
            console.error('❌ JWT 디코딩 실패:', error);
        }
    }
    
    // 4. 실제 API 테스트로 확인
    console.log('🧪 API 테스트 시작...');
    
    // 성공하는 API (이메일 기반)
    try {
        const emailResponse = await fetch(`http://192.168.35.205:8080/api/postcards/folders?userEmail=${encodeURIComponent(storedUserEmail)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ 이메일 API 응답:', emailResponse.status);
    } catch (error) {
        console.log('❌ 이메일 API 에러:', error.message);
    }
    
    // 실패하는 API (userId 기반) - 더 자세한 에러 정보 확인
    try {
        const userIdResponse = await fetch(`http://192.168.35.205:8080/api/myTour/list?userId=${storedUserId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('🔍 userId API 응답 상태:', userIdResponse.status);
        
        // 응답 본문도 확인
        const responseText = await userIdResponse.text();
        console.log('🔍 userId API 응답 본문:', responseText);
        
    } catch (error) {
        console.log('❌ userId API 에러:', error.message);
    }
    
    console.log('=== 디버깅 완료 ===');
};

// 실행: debugUserDataMismatch();
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
                // 🔥 토큰 유효성 검증
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

    const signOut = async () => {
        if (Platform.OS === 'web') {
            const confirmLogout = confirm('현재 계정에서 로그아웃하시겠습니까?');
            if (confirmLogout) {
                try {
                    await AsyncStorage.removeItem('jwtToken');
                    await AsyncStorage.removeItem('userId');
                    setUser(null);
                    setCurrentUserId(null);
                    console.log('로그아웃 성공 (웹)');
                } catch (e) {
                    console.error("Failed to sign out (web):", e);
                    alert('로그아웃에 실패했습니다.');
                }
            } else {
                console.log('로그아웃 취소 (웹)');
            }
        } else {
            // 모바일 환경 (Alert.alert 사용)
            Alert.alert(
                '로그아웃', // 제목
                '현재 계정에서 로그아웃하시겠습니까?', // 메시지
                [
                    {
                        text: '네', // 두 번째 버튼
                        onPress: async () => {
                            try {
                                await AsyncStorage.removeItem('jwtToken');
                                await AsyncStorage.removeItem('userId');
                                setUser(null);
                                setCurrentUserId(null);
                                console.log('로그아웃 성공 (모바일)');
                            } catch (e) {
                                console.error("Failed to sign out (mobile):", e);
                                Alert.alert('로그아웃 실패', '로그아웃에 실패했습니다.');
                            }
                        },
                    },
                    {
                        text: '아니오', // 첫 번째 버튼
                        onPress: () => console.log('로그아웃 취소'),
                        style: 'cancel',
                    },
                ],
                { cancelable: false }
            );
        }
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                user,
                currentUserId,
                loading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}