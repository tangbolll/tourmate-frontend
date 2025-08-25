import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('jwtToken');
                if (token) {
                    setUser({ authenticated: true });
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("Failed to check auth status:", e);
                setUser(null);
            } finally {
                setLoading(false); // Set loading to false after check
            }
        };
        checkAuth();
    }, []);

    const signIn = async (token, userId) => {
        try {
            await AsyncStorage.setItem('jwtToken', token);
            await AsyncStorage.setItem('userId', String(userId));
            setUser({ authenticated: true });
        } catch (e) {
            console.error("Failed to sign in:", e);
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem('jwtToken');
            await AsyncStorage.removeItem('userId');
            setUser(null);
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
                loading, // Export loading state
            }}>
            {children}
        </AuthContext.Provider>
    );
}
