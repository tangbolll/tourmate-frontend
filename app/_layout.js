import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

// This hook will protect the route access based on authentication state.
function useProtectedRoute(user) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const inAuthGroup = segments[0] === 'auth';

        if (!user && !inAuthGroup) {
            router.replace('/auth/login');
        } else if (user && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [user, segments, router, router.isReady]);
}

function AuthProvider({ children }) {
    // For now, we'll use a simple state to represent the user.
    // Replace this with your actual authentication logic.
    const [user, setUser] = useState(null);

    useProtectedRoute(user);

    return (
        <AuthContext.Provider
            value={{
                signIn: () => setUser({ name: 'Test User' }), // Mock sign-in
                signOut: () => setUser(null),
                user,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="auth/login" />
                </Stack>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
