// Settings Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '@/components/GradientBackground';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { clearAllData, setOnboardingComplete } from '@/utils/storage';
import {
  registerForNotifications,
  scheduleDailyReminder,
  cancelDailyReminder,
  checkNotificationStatus,
} from '@/utils/notifications';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightElement,
  disabled = false,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.settingItemDisabled]}
      onPress={onPress}
      disabled={!onPress || disabled}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={Colors.celestialGold} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
      {showArrow && onPress && !disabled && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.moonlightGray}
        />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);

  // Check notification status on mount
  useEffect(() => {
    checkInitialNotificationStatus();
  }, []);

  const checkInitialNotificationStatus = async () => {
    setIsLoadingNotifications(true);
    try {
      const isEnabled = await checkNotificationStatus();
      setNotifications(isEnabled);
    } catch (error) {
      console.error('Error checking notification status:', error);
      setNotifications(false);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationToggle = useCallback(async (value: boolean) => {
    setIsTogglingNotifications(true);

    try {
      if (value) {
        // User is enabling notifications
        const hasPermission = await registerForNotifications();

        if (!hasPermission) {
          Alert.alert(
            'Notifications Disabled',
            'To receive daily tarot reminders, please enable notifications for Tarotify in your device settings.',
            [
              { text: 'OK', style: 'default' },
            ]
          );
          setNotifications(false);
          return;
        }

        // Schedule the daily reminder
        const scheduled = await scheduleDailyReminder();
        if (scheduled) {
          setNotifications(true);
          Alert.alert(
            'Daily Reminders Enabled ✨',
            'You\'ll receive a mystical reminder every morning at 8:00 AM to draw your daily cards.',
            [{ text: 'Wonderful', style: 'default' }]
          );
        } else {
          setNotifications(false);
          Alert.alert(
            'Unable to Schedule',
            'There was an issue scheduling your daily reminder. Please try again.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        // User is disabling notifications
        await cancelDailyReminder();
        setNotifications(false);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert(
        'Error',
        'There was a problem updating your notification settings.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsTogglingNotifications(false);
    }
  }, []);

  const handleResetOnboarding = () => {
    Alert.alert(
      'Restart Onboarding',
      'This will take you through the onboarding process again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            await setOnboardingComplete(false);
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your readings, profile, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Also cancel notifications when clearing data
              await cancelDailyReminder();
              await clearAllData();
              router.replace('/onboarding');
            } catch {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Tarotify',
      'Version 1.0.0\n\nA mystical daily tarot reading app designed to guide you through life\'s journey with celestial wisdom.\n\nCreated with cosmic energy.',
      [{ text: 'OK' }]
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </Animated.View>

          {/* Preferences Section */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="notifications"
                title="Daily Reminders"
                subtitle="Get reminded at 8:00 AM daily"
                showArrow={false}
                disabled={isTogglingNotifications}
                rightElement={
                  isLoadingNotifications || isTogglingNotifications ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.celestialGold}
                      style={styles.activityIndicator}
                    />
                  ) : (
                    <Switch
                      value={notifications}
                      onValueChange={handleNotificationToggle}
                      trackColor={{
                        false: Colors.moonlightGray,
                        true: Colors.celestialGold,
                      }}
                      thumbColor={Colors.textPrimary}
                    />
                  )
                }
              />
              <SettingItem
                icon="phone-portrait"
                title="Haptic Feedback"
                subtitle="Vibrate on card interactions"
                showArrow={false}
                rightElement={
                  <Switch
                    value={haptics}
                    onValueChange={setHaptics}
                    trackColor={{
                      false: Colors.moonlightGray,
                      true: Colors.celestialGold,
                    }}
                    thumbColor={Colors.textPrimary}
                  />
                }
              />
            </View>
          </Animated.View>

          {/* Account Section */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="refresh"
                title="Restart Onboarding"
                subtitle="Update your birth details"
                onPress={handleResetOnboarding}
              />
              <SettingItem
                icon="trash"
                title="Clear All Data"
                subtitle="Delete all readings and settings"
                onPress={handleClearData}
              />
            </View>
          </Animated.View>

          {/* About Section */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="information-circle"
                title="About Tarotify"
                subtitle="Version 1.0.0"
                onPress={handleAbout}
              />
              <SettingItem
                icon="document-text"
                title="Privacy Policy"
                onPress={() => {}}
              />
              <SettingItem
                icon="shield-checkmark"
                title="Terms of Service"
                onPress={() => {}}
              />
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Made with cosmic energy
            </Text>
            <Text style={styles.footerSubtext}>Tarotify v1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.celestialGold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.15)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(221, 133, 216, 0.1)',
  },
  settingItemDisabled: {
    opacity: 0.7,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.moonlightGray,
    marginTop: 2,
  },
  activityIndicator: {
    marginRight: Spacing.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: Colors.moonlightGray,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.moonlightGray,
    marginTop: Spacing.xs,
    opacity: 0.6,
  },
});
