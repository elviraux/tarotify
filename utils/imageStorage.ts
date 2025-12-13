// Image Storage Utility - Manages local storage of generated card images
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  deleteAsync,
} from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CARD_IMAGES_DIR = `${documentDirectory}tarot-cards/`;
const CARD_BACK_PATH = `${CARD_IMAGES_DIR}card-back.png`;
const IMAGE_REGISTRY_KEY = '@tarotify_image_registry';

interface ImageRegistry {
  [cardId: string]: {
    localUri: string;
    generatedAt: string;
  };
}

// Ensure the cards directory exists
export const ensureDirectoryExists = async (): Promise<void> => {
  const dirInfo = await getInfoAsync(CARD_IMAGES_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(CARD_IMAGES_DIR, { intermediates: true });
  }
};

// Get the image registry from AsyncStorage
const getImageRegistry = async (): Promise<ImageRegistry> => {
  try {
    const registry = await AsyncStorage.getItem(IMAGE_REGISTRY_KEY);
    return registry ? JSON.parse(registry) : {};
  } catch (error) {
    console.error('Error reading image registry:', error);
    return {};
  }
};

// Save the image registry to AsyncStorage
const saveImageRegistry = async (registry: ImageRegistry): Promise<void> => {
  try {
    await AsyncStorage.setItem(IMAGE_REGISTRY_KEY, JSON.stringify(registry));
  } catch (error) {
    console.error('Error saving image registry:', error);
  }
};

// Download and save an image from URL to local storage
export const downloadAndSaveImage = async (
  imageUrl: string,
  cardId: number | string
): Promise<string | null> => {
  try {
    await ensureDirectoryExists();

    const filename = `card-${cardId}.png`;
    const localUri = `${CARD_IMAGES_DIR}${filename}`;

    // Download the image
    const downloadResult = await downloadAsync(imageUrl, localUri);

    if (downloadResult.status === 200) {
      // Update the registry
      const registry = await getImageRegistry();
      registry[cardId.toString()] = {
        localUri,
        generatedAt: new Date().toISOString(),
      };
      await saveImageRegistry(registry);

      return localUri;
    }

    return null;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
};

// Check if a card image exists locally
export const getCardImageUri = async (cardId: number): Promise<string | null> => {
  try {
    const registry = await getImageRegistry();
    const entry = registry[cardId.toString()];

    if (entry?.localUri) {
      // Verify the file still exists
      const fileInfo = await getInfoAsync(entry.localUri);
      if (fileInfo.exists) {
        return entry.localUri;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting card image URI:', error);
    return null;
  }
};

// Check if the card back image exists
export const getCardBackUri = async (): Promise<string | null> => {
  try {
    const fileInfo = await getInfoAsync(CARD_BACK_PATH);
    if (fileInfo.exists) {
      return CARD_BACK_PATH;
    }
    return null;
  } catch (error) {
    console.error('Error checking card back:', error);
    return null;
  }
};

// Save the card back image
export const saveCardBackImage = async (imageUrl: string): Promise<string | null> => {
  try {
    await ensureDirectoryExists();

    const downloadResult = await downloadAsync(imageUrl, CARD_BACK_PATH);

    if (downloadResult.status === 200) {
      return CARD_BACK_PATH;
    }

    return null;
  } catch (error) {
    console.error('Error saving card back image:', error);
    return null;
  }
};

// Get all generated card IDs
export const getGeneratedCardIds = async (): Promise<number[]> => {
  try {
    const registry = await getImageRegistry();
    return Object.keys(registry).map(id => parseInt(id, 10));
  } catch (error) {
    console.error('Error getting generated card IDs:', error);
    return [];
  }
};

// Get generation stats
export const getGenerationStats = async (): Promise<{
  totalGenerated: number;
  totalCards: number;
  hasCardBack: boolean;
}> => {
  try {
    const registry = await getImageRegistry();
    const hasCardBack = (await getCardBackUri()) !== null;

    return {
      totalGenerated: Object.keys(registry).length,
      totalCards: 78,
      hasCardBack,
    };
  } catch (error) {
    console.error('Error getting generation stats:', error);
    return { totalGenerated: 0, totalCards: 78, hasCardBack: false };
  }
};

// Clear all generated images
export const clearAllImages = async (): Promise<void> => {
  try {
    const dirInfo = await getInfoAsync(CARD_IMAGES_DIR);
    if (dirInfo.exists) {
      await deleteAsync(CARD_IMAGES_DIR, { idempotent: true });
    }
    await AsyncStorage.removeItem(IMAGE_REGISTRY_KEY);
  } catch (error) {
    console.error('Error clearing images:', error);
  }
};

// Delete a specific card image
export const deleteCardImage = async (cardId: number): Promise<void> => {
  try {
    const registry = await getImageRegistry();
    const entry = registry[cardId.toString()];

    if (entry?.localUri) {
      await deleteAsync(entry.localUri, { idempotent: true });
      delete registry[cardId.toString()];
      await saveImageRegistry(registry);
    }
  } catch (error) {
    console.error('Error deleting card image:', error);
  }
};
