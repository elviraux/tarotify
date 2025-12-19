import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const READING_COUNT_KEY = 'app_reading_count';
const HAS_REQUESTED_REVIEW_KEY = 'has_requested_review';
const REVIEW_MILESTONE = 3;

/**
 * Tracks daily reading completions and prompts for app review at milestone.
 * Called after a daily reading is successfully saved.
 */
export async function trackReadingCompletion(): Promise<void> {
  try {
    // Check if we've already requested a review
    const hasRequestedReview = await AsyncStorage.getItem(HAS_REQUESTED_REVIEW_KEY);
    if (hasRequestedReview === 'true') {
      return;
    }

    // Get current reading count
    const currentCountStr = await AsyncStorage.getItem(READING_COUNT_KEY);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

    // Increment the count
    const newCount = currentCount + 1;
    await AsyncStorage.setItem(READING_COUNT_KEY, newCount.toString());

    // Check if milestone is reached
    if (newCount === REVIEW_MILESTONE) {
      // Check if store review is available
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        // Request the review
        await StoreReview.requestReview();
        // Mark that we've requested a review
        await AsyncStorage.setItem(HAS_REQUESTED_REVIEW_KEY, 'true');
      } else {
        console.log('Store review is not available (common in development)');
      }
    }
  } catch (error) {
    // Silently fail - rating prompt is not critical functionality
    console.log('Error tracking reading for review:', error);
  }
}

/**
 * Resets the review tracking (useful for testing)
 */
export async function resetReviewTracking(): Promise<void> {
  try {
    await AsyncStorage.removeItem(READING_COUNT_KEY);
    await AsyncStorage.removeItem(HAS_REQUESTED_REVIEW_KEY);
  } catch (error) {
    console.log('Error resetting review tracking:', error);
  }
}

/**
 * Gets the current reading count (useful for debugging)
 */
export async function getReadingCount(): Promise<number> {
  try {
    const countStr = await AsyncStorage.getItem(READING_COUNT_KEY);
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (error) {
    console.log('Error getting reading count:', error);
    return 0;
  }
}
