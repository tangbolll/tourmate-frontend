import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="terms-and-policies/terms-of-service" options={{ headerShown: false }} />
      <Stack.Screen name="terms-and-policies/privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="terms-and-policies/location-terms" options={{ headerShown: false }} />
      <Stack.Screen name="terms-and-policies/marketing-policy" options={{ headerShown: false }} />
    </Stack>
  );
}