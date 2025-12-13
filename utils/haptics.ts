// Haptic Feedback Utility
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@tarotify_haptics_enabled';

// Cache the preference for performance (avoid async lookup on every haptic)
// Default to true so haptics work from the very first millisecond
let cachedHapticsEnabled: boolean = true;

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Initialize the haptics system by loading the cached preference
 * Only disables haptics if user explicitly turned them off
 */
export const initHaptics = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    // Only override if explicitly set to 'false', otherwise keep enabled
    if (stored === 'false') {
      cachedHapticsEnabled = false;
    }
    // If stored is null (not set) or 'true', keep cachedHapticsEnabled as true
  } catch (error) {
    console.error('Error loading haptic preference:', error);
    // Keep default true on error
  }
};

/**
 * Get the current haptic preference
 */
export const getHapticPreference = async (): Promise<boolean> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const enabled = stored === null ? true : stored === 'true';
    cachedHapticsEnabled = enabled;
    return enabled;
  } catch (error) {
    console.error('Error getting haptic preference:', error);
    return true;
  }
};

/**
 * Save the haptic preference
 */
export const saveHapticPreference = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    cachedHapticsEnabled = enabled;
  } catch (error) {
    console.error('Error saving haptic preference:', error);
  }
};

/**
 * Trigger haptic feedback if enabled
 * @param type - The type of haptic feedback to trigger
 */
export const triggerHaptic = async (type: HapticType = 'light'): Promise<void> => {
  // Use cached value directly (defaults to true)
  if (!cachedHapticsEnabled) {
    if (__DEV__) {
      console.log('[Haptics] Skipped - haptics disabled by user');
    }
    return;
  }

  try {
    if (__DEV__) {
      console.log(`[Haptics] Triggering: ${type}`);
    }

    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail - haptics may not be available on all devices
    if (__DEV__) {
      console.warn('[Haptics] Feedback unavailable:', error);
    }
  }
};

/**
 * Convenience functions for common haptic patterns
 */
export const hapticLight = () => triggerHaptic('light');
export const hapticMedium = () => triggerHaptic('medium');
export const hapticHeavy = () => triggerHaptic('heavy');
export const hapticSuccess = () => triggerHaptic('success');
export const hapticWarning = () => triggerHaptic('warning');
export const hapticError = () => triggerHaptic('error');
export const hapticSelection = () => triggerHaptic('selection');
