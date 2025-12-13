// Storage utilities for Tarotify
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyReading, StoredCardImage } from '@/types';

const STORAGE_KEYS = {
  USER_PROFILE: '@tarotify_user_profile',
  IS_ONBOARDED: '@tarotify_is_onboarded',
  DAILY_READING: '@tarotify_daily_reading',
  STORED_IMAGES: '@tarotify_stored_images',
  CARD_BACK_IMAGE: '@tarotify_card_back_image',
  CHART_ANALYSIS: '@tarotify_chart_analysis',
};

// User Profile Storage
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, jsonValue);
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (jsonValue != null) {
      const profile = JSON.parse(jsonValue);
      // Convert date strings back to Date objects
      profile.dateOfBirth = new Date(profile.dateOfBirth);
      profile.createdAt = new Date(profile.createdAt);
      return profile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Onboarding Status
export const setOnboardingComplete = async (complete: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, JSON.stringify(complete));
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    throw error;
  }
};

export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARDED);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Daily Reading Storage
export const saveDailyReading = async (reading: DailyReading): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(reading);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_READING, jsonValue);
  } catch (error) {
    console.error('Error saving daily reading:', error);
    throw error;
  }
};

export const getDailyReading = async (): Promise<DailyReading | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_READING);
    if (jsonValue != null) {
      const reading = JSON.parse(jsonValue);
      reading.createdAt = new Date(reading.createdAt);
      return reading;
    }
    return null;
  } catch (error) {
    console.error('Error getting daily reading:', error);
    return null;
  }
};

export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

export const hasReadingForToday = async (): Promise<boolean> => {
  try {
    const reading = await getDailyReading();
    if (reading) {
      return reading.date === getTodayDateString();
    }
    return false;
  } catch (error) {
    console.error('Error checking today\'s reading:', error);
    return false;
  }
};

// Card Images Storage
export const saveStoredImages = async (images: StoredCardImage[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(images);
    await AsyncStorage.setItem(STORAGE_KEYS.STORED_IMAGES, jsonValue);
  } catch (error) {
    console.error('Error saving stored images:', error);
    throw error;
  }
};

export const getStoredImages = async (): Promise<StoredCardImage[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.STORED_IMAGES);
    if (jsonValue != null) {
      const images = JSON.parse(jsonValue);
      return images.map((img: StoredCardImage) => ({
        ...img,
        generatedAt: new Date(img.generatedAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting stored images:', error);
    return [];
  }
};

export const getCardImageUri = async (cardId: number): Promise<string | null> => {
  try {
    const images = await getStoredImages();
    const image = images.find(img => img.cardId === cardId);
    return image ? image.localUri : null;
  } catch (error) {
    console.error('Error getting card image URI:', error);
    return null;
  }
};

export const addStoredImage = async (image: StoredCardImage): Promise<void> => {
  try {
    const images = await getStoredImages();
    const existingIndex = images.findIndex(img => img.cardId === image.cardId);
    if (existingIndex >= 0) {
      images[existingIndex] = image;
    } else {
      images.push(image);
    }
    await saveStoredImages(images);
  } catch (error) {
    console.error('Error adding stored image:', error);
    throw error;
  }
};

// Card Back Image
export const saveCardBackImage = async (uri: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CARD_BACK_IMAGE, uri);
  } catch (error) {
    console.error('Error saving card back image:', error);
    throw error;
  }
};

export const getCardBackImage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CARD_BACK_IMAGE);
  } catch (error) {
    console.error('Error getting card back image:', error);
    return null;
  }
};

// Chart Analysis Storage
export const saveChartAnalysis = async (analysis: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CHART_ANALYSIS, analysis);
  } catch (error) {
    console.error('Error saving chart analysis:', error);
    throw error;
  }
};

export const getChartAnalysis = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CHART_ANALYSIS);
  } catch (error) {
    console.error('Error getting chart analysis:', error);
    return null;
  }
};

// Clear all data (for testing/reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};
