import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Select Service' }} />
      <Stack.Screen name="address" options={{ title: 'Address' }} />
      <Stack.Screen name="price" options={{ title: 'Price' }} />
      <Stack.Screen name="matching" options={{ title: 'Matching' }} />
      <Stack.Screen name="confirm" options={{ title: 'Confirmation' }} />
      <Stack.Screen name="rate" options={{ title: 'Rate Service' }} />
    </Stack>
  );
}
