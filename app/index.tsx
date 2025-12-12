// Entry Point - Redirects based on onboarding status
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { isOnboardingComplete } from '@/utils/storage';
import { Colors } from '@/constants/theme';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingComplete();
      setIsOnboarded(completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.celestialGold} />
      </View>
    );
  }

  // Use Redirect component to navigate
  if (isOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.voidBlack,
  },
});
