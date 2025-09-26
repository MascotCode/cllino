import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AppEntry() {
  const routerInstance = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Small delay to ensure router is ready
        await new Promise(resolve => setTimeout(resolve, 200));

        // Check if onboarding is completed
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        const userType = await AsyncStorage.getItem('userType');

        if (!onboardingCompleted) {
          // First time user - show welcome screen
          routerInstance.replace('/(onboarding)/welcome');
        } else if (userType === 'provider') {
          // Provider user - check if profile is set up
          routerInstance.replace('/(provider)/home');
        } else {
          // Customer user or default
          routerInstance.replace('/(public)');
        }
      } catch (error) {
        console.error('Navigation error in AppEntry:', error);
        // Fallback - try again with longer delay
        setTimeout(() => {
          try {
            routerInstance.replace('/(onboarding)/welcome');
          } catch (fallbackError) {
            console.error('Fallback navigation failed:', fallbackError);
          }
        }, 500);
      }
    };

    initializeApp();
  }, [routerInstance]);

  // Show loading screen while checking onboarding status
  return (
    <View
      className="items-center justify-center flex-1 bg-white"
      testID="loading-screen"
    >
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
