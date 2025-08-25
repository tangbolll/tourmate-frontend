import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null); // ✅ 추가
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('jwtToken');
                const userId = await AsyncStorage.getItem('userId'); // ✅ 추가
                
                if (token && userId) {
                    setUser({ authenticated: true });
                    setCurrentUserId(userId); // ✅ 추가
                } else {
                    setUser(null);
                    setCurrentUserId(null); // ✅ 추가
                }
            } catch (e) {
                console.error("Failed to check auth status:", e);
                setUser(null);
                setCurrentUserId(null); // ✅ 추가
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
            setCurrentUserId(String(userId)); // ✅ 추가
        } catch (e) {
            console.error("Failed to sign in:", e);
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem('jwtToken');
            await AsyncStorage.removeItem('userId');
            setUser(null);
            setCurrentUserId(null); // ✅ 추가
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
                currentUserId, // ✅ 추가
                loading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}