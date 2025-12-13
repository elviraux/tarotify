// Root Layout - Handles navigation and initial routing
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureNewell } from '@fastshot/ai';
import * as Notifications from 'expo-notifications';
import { Colors } from '@/constants/theme';
import { initHaptics } from '@/utils/haptics';

// Configure notification handler (must be outside component)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Configure Newell AI
configureNewell({
  // Configuration is handled by the SDK
});

export default function RootLayout() {
  // Initialize haptics preference cache on app start
  useEffect(() => {
    initHaptics();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.voidBlack },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="profile"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="deck-gallery"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
