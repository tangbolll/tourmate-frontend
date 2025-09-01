import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import setupAxiosInterceptor from '../utils/axiosInterceptor';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <AuthProvider>
                    <RootLayoutNav />
                </AuthProvider>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

function RootLayoutNav() {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        setupAxiosInterceptor();
        console.log('Auth status changed:', { user, loading, segments });
        if (!loading) {
            const inAuthGroup = segments[0] === 'auth';
            console.log('Navigation check:', { user, inAuthGroup });

            if (user && inAuthGroup) {
                // Allow specific auth screens to be viewed by authenticated users
                const allowedAuthScreens = [
                    'auth/registration-success',
                    'auth/register-details' // Allow register-details to proceed after login
                ];

                if (allowedAuthScreens.includes(segments.join('/'))) {
                    console.log('Allowing authenticated user to view specific auth screen:', segments.join('/'));
                    return; // Do not redirect
                }
                
                console.log('Redirecting to tabs');
                router.replace('/(tabs)');
            } else if (!user && !inAuthGroup) {
                console.log('Redirecting to login');
                router.replace('/auth/login');
            }
        }
    }, [user, segments, loading]);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/terms-agreement" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="auth/register-details" />
            <Stack.Screen name="auth/registration-success" />
        </Stack>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});
