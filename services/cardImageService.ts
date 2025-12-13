// Card Image Generation Service - Uses Newell AI for generating tarot card artwork
import { generateImage } from '@fastshot/ai';
import { TarotCard } from '@/types';
import {
  downloadAndSaveImage,
  getCardImageUri,
  getCardBackUri,
  saveCardBackImage,
} from '@/utils/imageStorage';

// Style constants for consistent card artwork
const CARD_ART_STYLE = 'Tarot card art, mystical illustration, gold ink line art on dark midnight blue paper, ethereal glow, intricate details, sacred geometry elements, 8k resolution, professional tarot deck quality';

const CARD_BACK_STYLE = 'Intricate celestial pattern, gold foil ornate design on midnight blue texture, symmetric mandala, crescent moon and stars, sacred geometry, tarot card back design, luxurious mystical, seamless pattern, 8k resolution';

// Generate the prompt for a specific tarot card
const generateCardPrompt = (card: TarotCard): string => {
  const keywordsStr = card.keywords.slice(0, 3).join(', ');
  const arcanaType = card.arcana === 'major' ? 'Major Arcana' : `Minor Arcana ${card.suit}`;

  return `${CARD_ART_STYLE}, "${card.name}" tarot card, ${arcanaType}, symbolizing ${keywordsStr}, ${card.element ? `element of ${card.element}` : ''}, mystical and powerful imagery`;
};

// Callbacks for generation progress
interface GenerationCallbacks {
  onStart?: () => void;
  onComplete?: (localUri: string) => void;
  onError?: (error: Error) => void;
}

// Generate a single card image
export const generateCardImage = async (
  card: TarotCard,
  callbacks?: GenerationCallbacks
): Promise<string | null> => {
  try {
    // Check if already generated
    const existingUri = await getCardImageUri(card.id);
    if (existingUri) {
      callbacks?.onComplete?.(existingUri);
      return existingUri;
    }

    callbacks?.onStart?.();

    const prompt = generateCardPrompt(card);

    // Generate image using Newell AI
    const result = await generateImage({
      prompt,
      width: 512,
      height: 768, // Tarot card aspect ratio
      numOutputs: 1,
    });

    if (result?.images?.[0]) {
      // Download and save locally
      const localUri = await downloadAndSaveImage(result.images[0], card.id);

      if (localUri) {
        callbacks?.onComplete?.(localUri);
        return localUri;
      }
    }

    throw new Error('Failed to generate image');
  } catch (error) {
    console.error(`Error generating card image for ${card.name}:`, error);
    callbacks?.onError?.(error as Error);
    return null;
  }
};

// Generate the card back image
export const generateCardBackImage = async (
  callbacks?: GenerationCallbacks
): Promise<string | null> => {
  try {
    // Check if already generated
    const existingUri = await getCardBackUri();
    if (existingUri) {
      callbacks?.onComplete?.(existingUri);
      return existingUri;
    }

    callbacks?.onStart?.();

    // Generate image using Newell AI
    const result = await generateImage({
      prompt: CARD_BACK_STYLE,
      width: 512,
      height: 768,
      numOutputs: 1,
    });

    if (result?.images?.[0]) {
      // Download and save locally
      const localUri = await saveCardBackImage(result.images[0]);

      if (localUri) {
        callbacks?.onComplete?.(localUri);
        return localUri;
      }
    }

    throw new Error('Failed to generate card back image');
  } catch (error) {
    console.error('Error generating card back image:', error);
    callbacks?.onError?.(error as Error);
    return null;
  }
};

// Queue for managing concurrent generations
interface GenerationTask {
  card: TarotCard;
  callbacks?: GenerationCallbacks;
  resolve: (value: string | null) => void;
}

class CardGenerationQueue {
  private queue: GenerationTask[] = [];
  private isProcessing = false;
  private maxConcurrent = 1; // Process one at a time to avoid rate limits

  async add(
    card: TarotCard,
    callbacks?: GenerationCallbacks
  ): Promise<string | null> {
    return new Promise((resolve) => {
      this.queue.push({ card, callbacks, resolve });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        const result = await generateCardImage(task.card, task.callbacks);
        task.resolve(result);
      }
    }

    this.isProcessing = false;
  }

  clear(): void {
    this.queue = [];
  }

  get pendingCount(): number {
    return this.queue.length;
  }
}

// Export a singleton instance
export const cardGenerationQueue = new CardGenerationQueue();

// Batch generate multiple cards (for background processing)
export const batchGenerateCards = async (
  cards: TarotCard[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<number, string | null>> => {
  const results = new Map<number, string | null>();
  const total = cards.length;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const result = await generateCardImage(card);
    results.set(card.id, result);
    onProgress?.(i + 1, total);
  }

  return results;
};
