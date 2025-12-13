// Notification Utilities for Daily Tarot Reminders
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_STORAGE_KEY = '@tarotify_notifications_enabled';

/**
 * Register for push notifications
 * Returns true if permissions are granted, false otherwise
 */
export const registerForNotifications = async (): Promise<boolean> => {
  // Check if we're on a physical device (required for notifications)
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return false;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  // If not already granted, request permission
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DD85D8',
      sound: 'default',
    });
  }

  return true;
};

/**
 * Schedule the daily tarot reminder notification
 * Sends at 8:00 AM every day
 */
export const scheduleDailyReminder = async (): Promise<boolean> => {
  try {
    // Cancel any existing scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule the daily notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Daily Tarot Awaits 🌙',
        body: 'The cards are ready to reveal your destiny for today.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'daily-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });

    // Save notification preference
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');

    console.log('Daily reminder scheduled for 8:00 AM');
    return true;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return false;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelDailyReminder = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false');
    console.log('Daily reminder cancelled');
  } catch (error) {
    console.error('Error cancelling daily reminder:', error);
  }
};

/**
 * Check if notifications are enabled and scheduled
 * Returns true if permissions are granted AND a notification is scheduled
 */
export const checkNotificationStatus = async (): Promise<boolean> => {
  try {
    // Check if we have permission
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }

    // Check if notifications are enabled in storage
    const storedPreference = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (storedPreference === 'false') {
      return false;
    }

    // Check if any notifications are scheduled
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.length > 0;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
};

/**
 * Get all scheduled notifications (for debugging)
 */
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};
