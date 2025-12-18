// Image Storage Utility - Manages local storage of generated card images
// Priority: 1. Bundled assets 2. Local file system 3. Runtime generation
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  deleteAsync,
} from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cardAssets,
  cardBackAsset,
  hasBundledAsset,
  getBundledAsset,
  getBundledCardCount,
  TOTAL_CARDS,
} from '@/assets/cards';

const CARD_IMAGES_DIR = `${documentDirectory}tarot-cards/`;
const CARD_BACK_PATH = `${CARD_IMAGES_DIR}card-back.png`;
const IMAGE_REGISTRY_KEY = '@tarotify_image_registry';

// Image source types for debugging/analytics
export type ImageSource = 'bundled' | 'filesystem' | 'generated' | null;

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

// Check if a card image exists (bundled or locally)
// Returns the image source or null if not found
export const getCardImageUri = async (cardId: number): Promise<string | null> => {
  try {
    // Priority 1: Check bundled assets first (fastest, no async needed for existence check)
    if (hasBundledAsset(cardId)) {
      // Return special marker for bundled assets
      // Components should use getBundledAsset() directly for rendering
      return `bundled:${cardId}`;
    }

    // Priority 2: Check filesystem (user-generated or runtime-generated)
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

// Get the actual image source for a card (for components to use)
export const getCardImageSource = (cardId: number, uri: string | null): ImageSource => {
  if (!uri) return null;
  if (uri.startsWith('bundled:')) return 'bundled';
  return 'filesystem';
};

// Resolve a card URI to the actual renderable source
// Use this in components to get the correct source for Image component
export const resolveCardImageSource = (cardId: number, uri: string | null): ReturnType<typeof require> | { uri: string } | null => {
  if (!uri) return null;

  // Handle bundled assets
  if (uri.startsWith('bundled:')) {
    return getBundledAsset(cardId);
  }

  // Handle filesystem URIs
  return { uri };
};

// Check if the card back image exists (always true with bundled asset)
export const getCardBackUri = async (): Promise<string | null> => {
  // Card back is always bundled
  return 'bundled:card-back';
};

// Resolve card back URI to actual source (always returns bundled asset)
export const resolveCardBackSource = (): ReturnType<typeof require> => {
  return cardBackAsset;
};

// Get all available card IDs (bundled + filesystem generated)
export const getGeneratedCardIds = async (): Promise<number[]> => {
  try {
    const ids = new Set<number>();

    // Add bundled card IDs
    Object.keys(cardAssets).forEach(id => {
      const numId = parseInt(id, 10);
      if (cardAssets[numId]) {
        ids.add(numId);
      }
    });

    // Add filesystem-generated card IDs
    const registry = await getImageRegistry();
    Object.keys(registry).forEach(id => {
      ids.add(parseInt(id, 10));
    });

    return Array.from(ids).sort((a, b) => a - b);
  } catch (error) {
    console.error('Error getting generated card IDs:', error);
    return [];
  }
};

// Get count of bundled vs filesystem cards (for stats/debugging)
export const getCardStorageStats = async (): Promise<{
  bundled: number;
  filesystem: number;
  total: number;
}> => {
  try {
    const bundledCount = getBundledCardCount();
    const registry = await getImageRegistry();
    const filesystemCount = Object.keys(registry).filter(
      id => !hasBundledAsset(parseInt(id, 10))
    ).length;

    return {
      bundled: bundledCount,
      filesystem: filesystemCount,
      total: bundledCount + filesystemCount,
    };
  } catch (error) {
    console.error('Error getting card storage stats:', error);
    return { bundled: 0, filesystem: 0, total: 0 };
  }
};

// Get generation stats (includes bundled + filesystem)
export const getGenerationStats = async (): Promise<{
  totalGenerated: number;
  totalCards: number;
  hasCardBack: boolean;
  bundledCount: number;
  filesystemCount: number;
}> => {
  try {
    const storageStats = await getCardStorageStats();
    const hasCardBack = (await getCardBackUri()) !== null;

    return {
      totalGenerated: storageStats.total,
      totalCards: TOTAL_CARDS,
      hasCardBack,
      bundledCount: storageStats.bundled,
      filesystemCount: storageStats.filesystem,
    };
  } catch (error) {
    console.error('Error getting generation stats:', error);
    return {
      totalGenerated: 0,
      totalCards: TOTAL_CARDS,
      hasCardBack: false,
      bundledCount: 0,
      filesystemCount: 0,
    };
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
