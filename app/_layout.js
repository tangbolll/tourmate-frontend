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
            const isAuthGroup = segments[0] === 'auth';
            const isTermsAndPoliciesGroup = segments[0] === 'profile' && segments[1] === 'terms-and-policies';

            const isPublicRoute = isAuthGroup || isTermsAndPoliciesGroup;

            if (!user && !isPublicRoute) {
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
