import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
                    setUser({ authenticated: true });
                    setCurrentUserId(userId); 
                } else {
                    setUser(null);
                    setCurrentUserId(null);
                }
            } catch (e) {
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
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem('jwtToken');
            await AsyncStorage.removeItem('userId');
            setUser(null);
            setCurrentUserId(null);
        } catch (e) {
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