import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import "../global.css";

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  useEffect(() => {
    // Set up global error boundary for navigation context errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('navigation context')) {
        console.warn('Navigation context warning suppressed:', ...args);
        return;
      }
      originalConsoleError(...args);
    };

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: any) => {
      if (event.reason?.message?.includes('navigation context')) {
        console.warn('Navigation context error in promise rejection:', event.reason.message);
        event.preventDefault();
      }
    };

    // Add global error handlers (React Native compatible)
    if (typeof window !== 'undefined') {
      window.addEventListener?.('unhandledrejection', handleUnhandledRejection);
    }

    return () => {
      console.error = originalConsoleError;
      if (typeof window !== 'undefined') {
        window.removeEventListener?.('unhandledrejection', handleUnhandledRejection);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(provider)" />
        </Stack>
        <StatusBar style="auto" />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
