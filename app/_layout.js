import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
    // For now, we'll use a simple state to represent the user.
    // Replace this with your actual authentication logic.
    const [user, setUser] = useState(null);

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
                <RootLayoutNav />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}

function RootLayoutNav() {
    const { user } = useContext(AuthContext); // Get user from AuthContext

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {user ? (
                // Authenticated user: show main app tabs
                <Stack.Screen name="(tabs)" />
            ) : (
                // Unauthenticated user: show login screen
                <Stack.Screen name="auth/login" />
            )}
        </Stack>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
