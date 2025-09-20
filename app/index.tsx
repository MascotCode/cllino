import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AppEntry() {
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      
      if (onboardingCompleted === 'true') {
        // User has completed onboarding, go to main app
        router.replace('/(tabs)');
      } else {
        // User hasn't completed onboarding, go to welcome screen
        router.replace('/(onboarding)/welcome');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to onboarding if there's an error
      router.replace('/(onboarding)/welcome');
    }
  };

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
