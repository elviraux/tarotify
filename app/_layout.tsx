// Root Layout - Handles navigation and initial routing
import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureNewell } from '@fastshot/ai';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { View } from 'react-native';
import { Colors } from '@/constants/theme';
import { initHaptics } from '@/utils/haptics';

// Prevent splash screen from hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

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
  // Load custom fonts
  const [fontsLoaded] = Font.useFonts({
    'Achafexp': require('../assets/fonts/Achafexp.ttf'),
  });

  // Initialize haptics preference cache on app start
  useEffect(() => {
    initHaptics();
  }, []);

  // Hide splash screen when fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Wait for fonts to load
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
      </View>
    </SafeAreaProvider>
  );
}
