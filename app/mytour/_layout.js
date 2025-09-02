import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function MytourLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="tourDesign" options={{ 
            headerShown: false,
            headerTitle: '투어 디자인' 
        }} />
        <Stack.Screen name="createItinerary" options={{ 
            headerShown: false,
            headerTitle: '여행 일정 생성' 
        }} />
        </Stack>
    );
}