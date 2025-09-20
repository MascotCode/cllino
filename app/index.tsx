import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AppEntry() {
 
  useEffect(() => {
    // Small delay to ensure router is ready
    const timer = setTimeout(() => {
      router.replace('/(public)');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while checking onboarding status
  return (
    <View 
      className="flex-1 bg-white items-center justify-center"
      testID="loading-screen"
    >
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
