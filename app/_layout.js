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
        // Only navigate if loading is false (auth status has been determined)
        if (!loading) {
            const inAuthGroup = segments[0] === 'auth';

            if (user && inAuthGroup) {
                router.replace('/(tabs)');
            } else if (!user && !inAuthGroup) {
                router.replace('/auth/login');
            }
        }
    }, [user, segments, loading]); // Add loading to dependency array

    // Optionally, render a loading screen while auth status is being determined
    if (loading) {
        return <Text>Loading...</Text>; // Or a more sophisticated splash screen
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
        </Stack>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
