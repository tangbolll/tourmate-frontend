import { Stack } from 'expo-router';

export default function AccompanyLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="AccompanyPost" options={{ 
            headerShown: true,
            headerTitle: '동행 상세' 
        }} />
        </Stack>
    );
}