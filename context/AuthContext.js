import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
                    setUser({ authenticated: true });
                    setCurrentUserId(userId); 
                } else {
                    setUser(null);
                    setCurrentUserId(null);
                }
            } catch (e) {
                console.error("Failed to check auth status:", e);
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
        try {
            await AsyncStorage.removeItem('jwtToken');
            await AsyncStorage.removeItem('userId');
            setUser(null);
            setCurrentUserId(null);
        } catch (e) {
            console.error("Failed to sign out:", e);
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