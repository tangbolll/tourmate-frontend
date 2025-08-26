import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

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
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        console.log('Auth status changed:', { user, loading, segments });
        // Only navigate if loading is false (auth status has been determined)
        if (!loading) {
            const inAuthGroup = segments[0] === 'auth';
            console.log('Navigation check:', { user, inAuthGroup });

            if (user && inAuthGroup) {
                console.log('Redirecting to tabs');
                router.replace('/(tabs)');
            } else if (!user && !inAuthGroup) {
                console.log('Redirecting to login');
                router.replace('/auth/login');
            }
        }
    }, [user, segments, loading]);

    // Optionally, render a loading screen while auth status is being determined
    if (loading) {
        return <Text>Loading...</Text>; // Or a more sophisticated splash screen
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/terms-agreement" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="auth/register-details" />
        </Stack>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
