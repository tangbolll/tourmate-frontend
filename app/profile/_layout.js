import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="writePost" options={{ 
            headerShown: false,
            headerTitle: '엽서 작성' 
        }} />
        <Stack.Screen name="selectPostDesign" options={{ 
            headerShown: false,
            headerTitle: '엽서 선택' 
        }} />
        <Stack.Screen name="postDirectory" options={{ 
            headerShown: false,
            headerTitle: '모든 엽서' 
        }} />
        </Stack>
    );
}