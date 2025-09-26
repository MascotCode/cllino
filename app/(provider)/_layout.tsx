import { Stack } from 'expo-router';

export default function ProviderLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="home" />
            <Stack.Screen name="invite/[id]" />
            <Stack.Screen name="job/[id]" />
            <Stack.Screen name="complete/[id]" />
            <Stack.Screen name="earnings" />
        </Stack>
    );
}


