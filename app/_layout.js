import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import setupAxiosInterceptor from '../utils/axiosInterceptor';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}> 
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}

function RootLayoutNav() {
    RootLayoutNav.displayName = 'RootLayoutNav';
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        setupAxiosInterceptor();
        console.log('Auth status changed:', { user, loading, segments });
        console.log('Current segments:', segments); // Added log
        console.log('User status:', user); // Added log
        console.log('Loading status:', loading); // Added log

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
                // router.replace('/(tabs)'); // Commented out
            } else if (!user && !inAuthGroup) {
                const isPublicRoute = segments[0] === '(public)';
                console.log('Is public route:', isPublicRoute); // Added log
                if (!isPublicRoute) {
                    console.log('Redirecting to login');
                    router.replace('/auth/login');
                }
            }
        }
    }, [user, segments, loading]);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(public)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/terms-agreement" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="auth/register-details" />
            <Stack.Screen name="auth/registration-success" />
            
            {/* 이전에 추가된 중복 라우트들을 제거합니다. */}
            <Stack.Screen name="alarm" options={{ presentation: 'modal', title: '알림', headerShown: true }} />
            <Stack.Screen name="index" />
            <Stack.Screen name="accompany" options={{ headerShown: false }} />
            <Stack.Screen name="mytour" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack>
        </SafeAreaView>
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
