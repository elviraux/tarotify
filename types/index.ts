// Tarotify Type Definitions

export interface UserProfile {
  fullName: string;
  dateOfBirth: Date;
  timeOfBirth: string;
  placeOfBirth: string;
  createdAt: Date;
}

export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number?: number;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  element?: string;
  zodiac?: string;
}

export interface CardReading {
  card: TarotCard;
  position: 'past' | 'present' | 'future';
  isRevealed: boolean;
  shortDescription: string;
  imageUrl?: string;
}

export interface DailyReading {
  id: string;
  date: string; // YYYY-MM-DD format
  cards: CardReading[];
  mainExplanation: string;
  userProfile: UserProfile;
  createdAt: Date;
}

export interface OnboardingState {
  currentStep: number;
  fullName: string;
  dateOfBirth: Date | null;
  timeOfBirth: string;
  placeOfBirth: string;
}

export interface StoredCardImage {
  cardId: number;
  localUri: string;
  generatedAt: Date;
}

export interface AppState {
  isOnboarded: boolean;
  userProfile: UserProfile | null;
  currentReading: DailyReading | null;
  storedImages: StoredCardImage[];
}
