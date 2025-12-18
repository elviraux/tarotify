// Hook for managing card images with lazy generation
import { useState, useEffect, useCallback, useRef } from 'react';
import { TarotCard } from '@/types';
import {
  getCardImageUri,
  getGeneratedCardIds,
} from '@/utils/imageStorage';
import {
  generateCardImage,
  cardGenerationQueue,
} from '@/services/cardImageService';

interface CardImageState {
  uri: string | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseCardImageReturn {
  imageUri: string | null;
  isLoading: boolean;
  error: Error | null;
  generate: () => Promise<void>;
}

// Hook to get/generate a single card image
export const useCardImage = (card: TarotCard | null): UseCardImageReturn => {
  const [state, setState] = useState<CardImageState>({
    uri: null,
    isLoading: false,
    error: null,
  });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load existing image on mount
  useEffect(() => {
    if (!card) return;

    const loadExisting = async () => {
      try {
        const uri = await getCardImageUri(card.id);
        if (uri && isMounted.current) {
          setState({ uri, isLoading: false, error: null });
        }
      } catch (error) {
        console.error('Error loading card image:', error);
      }
    };

    loadExisting();
  }, [card?.id]);

  const generate = useCallback(async () => {
    if (!card || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const uri = await cardGenerationQueue.add(card, {
        onStart: () => {
          if (isMounted.current) {
            setState(prev => ({ ...prev, isLoading: true }));
          }
        },
        onComplete: (localUri) => {
          if (isMounted.current) {
            setState({ uri: localUri, isLoading: false, error: null });
          }
        },
        onError: (error) => {
          if (isMounted.current) {
            setState(prev => ({ ...prev, isLoading: false, error }));
          }
        },
      });

      if (uri && isMounted.current) {
        setState({ uri, isLoading: false, error: null });
      }
    } catch (error) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    }
  }, [card, state.isLoading]);

  return {
    imageUri: state.uri,
    isLoading: state.isLoading,
    error: state.error,
    generate,
  };
};

interface DeckImagesState {
  generatedIds: Set<number>;
  totalGenerated: number;
  isLoading: boolean;
}

// Hook to get deck generation status
export const useDeckImages = (): DeckImagesState & {
  refresh: () => Promise<void>;
  getImageUri: (cardId: number) => Promise<string | null>;
} => {
  const [state, setState] = useState<DeckImagesState>({
    generatedIds: new Set(),
    totalGenerated: 0,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const ids = await getGeneratedCardIds();
      setState({
        generatedIds: new Set(ids),
        totalGenerated: ids.length,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error refreshing deck images:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getImageUri = useCallback(async (cardId: number): Promise<string | null> => {
    return getCardImageUri(cardId);
  }, []);

  return { ...state, refresh, getImageUri };
};
