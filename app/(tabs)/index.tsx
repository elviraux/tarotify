// Home Screen - Daily Reading with Lazy Image Generation
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Share,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '@/components/GradientBackground';
import TarotCard from '@/components/TarotCard';
import GoldButton from '@/components/GoldButton';
import FormattedText from '@/components/FormattedText';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getRandomCards } from '@/data/tarotDeck';
import {
  getUserProfile,
  getDailyReading,
  saveDailyReading,
  getTodayDateString,
  saveToHistory,
} from '@/utils/storage';
import { formatDateLong } from '@/utils/formatDate';
import { UserProfile, DailyReading, CardReading, TarotCard as TarotCardData } from '@/types';
import { useTextGeneration } from '@fastshot/ai';
import { useCardBack } from '@/hooks/useCardImages';
import { getCardImageUri } from '@/utils/imageStorage';
import { generateCardImage, generateCardBackImage } from '@/services/cardImageService';

// Stable constellation positions
const CONSTELLATION_POSITIONS: { left: `${number}%`, top: `${number}%`, opacity: number }[] = [
  { left: '15%', top: '50%', opacity: 0.5 },
  { left: '25%', top: '35%', opacity: 0.4 },
  { left: '35%', top: '65%', opacity: 0.6 },
  { left: '45%', top: '40%', opacity: 0.5 },
  { left: '55%', top: '60%', opacity: 0.4 },
  { left: '65%', top: '45%', opacity: 0.7 },
  { left: '75%', top: '55%', opacity: 0.5 },
  { left: '85%', top: '50%', opacity: 0.4 },
];

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Card images state
  const [cardImages, setCardImages] = useState<Record<number, string | null>>({});
  const [generatingCardIds, setGeneratingCardIds] = useState<Set<number>>(new Set());

  // Ref to store pending cards during AI generation
  const pendingCardsRef = useRef<TarotCardData[] | null>(null);
  // Ref to store userProfile for use in callbacks (avoids stale closure)
  const userProfileRef = useRef<UserProfile | null>(null);

  // Keep userProfileRef in sync
  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  // Card back hook
  const cardBack = useCardBack();

  // Helper to finalize and save reading - uses refs to avoid stale closures
  const finalizeReading = useCallback(async (
    selectedCards: TarotCardData[],
    aiResponse: string | null
  ) => {
    const profile = userProfileRef.current;
    if (!profile) {
      console.log('No user profile available');
      setIsGenerating(false);
      return;
    }

    console.log('Finalizing reading with AI response:', aiResponse ? 'received' : 'null');

    // Parse AI response or use default
    let interpretations = {
      past: selectedCards[0].uprightMeaning,
      present: selectedCards[1].uprightMeaning,
      future: selectedCards[2].uprightMeaning,
      dailyMessage: `Today's energies suggest a significant shift. The combination of ${selectedCards[0].name}, ${selectedCards[1].name}, and ${selectedCards[2].name} speaks to your journey of transformation. Trust in the cosmic flow and embrace the wisdom these cards offer.`,
    };

    if (aiResponse) {
      try {
        // Try to extract JSON from the response (handle markdown code blocks)
        let jsonStr = aiResponse;
        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }
        const parsed = JSON.parse(jsonStr);
        console.log('Parsed AI interpretations:', parsed);
        interpretations = { ...interpretations, ...parsed };
      } catch (parseError) {
        console.log('Failed to parse AI response, using defaults:', parseError);
      }
    }

    // Create card readings with interpretations
    const cardReadings: CardReading[] = selectedCards.map((card, index) => ({
      card,
      position: (['past', 'present', 'future'] as const)[index],
      isRevealed: false,
      shortDescription: index === 0 ? interpretations.past :
                        index === 1 ? interpretations.present :
                        interpretations.future,
    }));

    // Create and save the reading
    const reading: DailyReading = {
      id: `reading_${Date.now()}`,
      date: getTodayDateString(),
      cards: cardReadings,
      mainExplanation: interpretations.dailyMessage,
      userProfile: profile,
      createdAt: new Date(),
    };

    await saveDailyReading(reading);
    await saveToHistory(reading);
    setDailyReading(reading);

    // Load any existing images for the new cards
    const images: Record<number, string | null> = {};
    for (const card of selectedCards) {
      const uri = await getCardImageUri(card.id);
      if (uri) {
        images[card.id] = uri;
      }
    }
    setCardImages(images);
    setIsGenerating(false);
    pendingCardsRef.current = null;
  }, []);

  // Store finalizeReading in a ref so callbacks always get the latest version
  const finalizeReadingRef = useRef(finalizeReading);
  useEffect(() => {
    finalizeReadingRef.current = finalizeReading;
  }, [finalizeReading]);

  const { generateText } = useTextGeneration({
    onSuccess: (response) => {
      console.log('AI interpretation generated, response length:', response?.length || 0);
      const cards = pendingCardsRef.current;
      if (cards) {
        finalizeReadingRef.current(cards, response);
      }
    },
    onError: (error) => {
      console.error('AI error:', error);
      // Still finalize with defaults on error
      const cards = pendingCardsRef.current;
      if (cards) {
        finalizeReadingRef.current(cards, null);
      }
    },
  });

  // Load user profile and daily reading
  useEffect(() => {
    loadData();
  }, []);

  // Generate card back if needed
  useEffect(() => {
    if (!cardBack.isReady && !cardBack.isLoading) {
      generateCardBackImage();
    }
  }, [cardBack.isReady, cardBack.isLoading]);

  // Load existing card images when reading changes
  const loadExistingCardImages = useCallback(async (cards: CardReading[]) => {
    const images: Record<number, string | null> = {};
    for (const cardReading of cards) {
      const uri = await getCardImageUri(cardReading.card.id);
      if (uri) {
        images[cardReading.card.id] = uri;
      }
    }
    setCardImages(images);
  }, []);

  useEffect(() => {
    if (dailyReading?.cards) {
      loadExistingCardImages(dailyReading.cards);
    }
  }, [dailyReading?.id, dailyReading?.cards, loadExistingCardImages]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile();
      setUserProfile(profile);

      // Check if we have a reading for today
      const existingReading = await getDailyReading();
      if (existingReading && existingReading.date === getTodayDateString()) {
        setDailyReading(existingReading);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const generateDailyReading = async () => {
    if (!userProfile) return;

    setIsGenerating(true);
    try {
      // Select 3 random cards
      const selectedCards = getRandomCards(3);

      // Store cards in ref for use in onSuccess callback
      pendingCardsRef.current = selectedCards;

      // Generate AI interpretations with shorter descriptions for card layout
      const prompt = `You are a mystical tarot reader. The seeker is ${userProfile.fullName}, born on ${formatDateLong(userProfile.dateOfBirth)}.

For their daily reading, they drew these three cards:
1. PAST: ${selectedCards[0].name} - ${selectedCards[0].uprightMeaning}
2. PRESENT: ${selectedCards[1].name} - ${selectedCards[1].uprightMeaning}
3. FUTURE: ${selectedCards[2].name} - ${selectedCards[2].uprightMeaning}

Provide a mystical interpretation in this exact JSON format (no other text, no markdown):
{
  "past": "Brief insight for past card (max 15 words)",
  "present": "Brief insight for present card (max 15 words)",
  "future": "Brief insight for future card (max 15 words)",
  "dailyMessage": "A paragraph (60-80 words) weaving all three cards together as personalized guidance for today based on their birth date and the specific cards drawn"
}`;

      // Trigger AI generation - result will be handled in onSuccess callback
      await generateText(prompt);
    } catch (error) {
      console.error('Error generating reading:', error);
      // Finalize with defaults on error
      const cards = pendingCardsRef.current;
      if (cards) {
        await finalizeReadingRef.current(cards, null);
      } else {
        setIsGenerating(false);
      }
    }
  };

  // Trigger image generation when a card is revealed
  const triggerCardImageGeneration = async (cardReading: CardReading) => {
    const cardId = cardReading.card.id;

    // Skip if already have image or already generating
    if (cardImages[cardId] || generatingCardIds.has(cardId)) {
      return;
    }

    // Mark as generating
    setGeneratingCardIds(prev => new Set(prev).add(cardId));

    try {
      const uri = await generateCardImage(cardReading.card);
      if (uri) {
        setCardImages(prev => ({ ...prev, [cardId]: uri }));
      }
    } catch (error) {
      console.error(`Error generating image for card ${cardId}:`, error);
    } finally {
      setGeneratingCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }
  };

  const revealCard = (index: number) => {
    if (!dailyReading) return;

    const updatedCards = [...dailyReading.cards];
    updatedCards[index] = { ...updatedCards[index], isRevealed: true };

    const updatedReading = { ...dailyReading, cards: updatedCards };
    setDailyReading(updatedReading);
    saveDailyReading(updatedReading);

    // Trigger image generation for the revealed card
    triggerCardImageGeneration(updatedCards[index]);
  };

  const allCardsRevealed = dailyReading?.cards.every(c => c.isRevealed) ?? false;

  // Share reading functionality
  const handleShareReading = useCallback(async () => {
    if (!dailyReading) return;

    const pastCard = dailyReading.cards.find(c => c.position === 'past');
    const presentCard = dailyReading.cards.find(c => c.position === 'present');
    const futureCard = dailyReading.cards.find(c => c.position === 'future');

    // Get the Present card image for sharing (the central, most prominent card)
    const presentCardImageUri = presentCard ? cardImages[presentCard.card.id] : null;

    const shareMessage = `✨ My Daily Tarot Reading ✨

🃏 Past: ${pastCard?.card.name || ''}
🃏 Present: ${presentCard?.card.name || ''}
🃏 Future: ${futureCard?.card.name || ''}

🌙 Tarotify`;

    try {
      await Share.share({
        message: shareMessage,
        ...(presentCardImageUri && { url: presentCardImageUri }),
      });
    } catch (error) {
      console.error('Error sharing reading:', error);
    }
  }, [dailyReading, cardImages]);

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.celestialGold} />
          <Text style={styles.loadingText}>Aligning the stars...</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.celestialGold}
            />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
            {/* Settings Button */}
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="settings-outline" size={26} color={Colors.celestialGold} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Your Daily Reading,{'\n'}
                <Text style={styles.titleName}>{userProfile?.fullName || 'Seeker'}</Text>
              </Text>
              <Text style={styles.date}>{formatDateLong(new Date())}</Text>
            </View>
          </Animated.View>

          {/* Constellation decoration */}
          <View style={styles.constellationContainer}>
            {CONSTELLATION_POSITIONS.map((pos, i) => (
              <View
                key={i}
                style={[
                  styles.constellationStar,
                  {
                    left: pos.left,
                    top: pos.top,
                    opacity: pos.opacity,
                  },
                ]}
              />
            ))}
            <View style={styles.constellationLine} />
          </View>

          {!dailyReading ? (
            // No reading yet - show generate button
            <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.generateContainer}>
              <Text style={styles.generateText}>
                The cosmos await your inquiry.{'\n'}Draw your cards for today&apos;s guidance.
              </Text>
              <GoldButton
                title="Draw Your Cards"
                onPress={generateDailyReading}
                loading={isGenerating}
              />
            </Animated.View>
          ) : (
            // Show the reading
            <>
              {/* Cards Spread */}
              <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                style={styles.cardsContainer}
              >
                <View style={styles.cardsRow}>
                  {dailyReading.cards.map((cardReading, index) => (
                    <TarotCard
                      key={cardReading.card.id}
                      card={cardReading.card}
                      position={cardReading.position}
                      isRevealed={cardReading.isRevealed}
                      onPress={() => revealCard(index)}
                      shortDescription={cardReading.shortDescription}
                      imageUri={cardImages[cardReading.card.id] || null}
                      cardBackUri={cardBack.uri}
                      isGenerating={generatingCardIds.has(cardReading.card.id)}
                    />
                  ))}
                </View>

                {!allCardsRevealed && (
                  <Text style={styles.tapHint}>
                    Tap a card to reveal its message.
                  </Text>
                )}
              </Animated.View>

              {/* Daily Explanation */}
              {allCardsRevealed && (
                <Animated.View
                  entering={FadeInUp.delay(400).duration(600)}
                  style={styles.explanationContainer}
                >
                  <LinearGradient
                    colors={['rgba(221, 133, 216, 0.12)', 'rgba(221, 133, 216, 0.04)']}
                    style={styles.explanationGradient}
                  >
                    <Text style={styles.explanationTitle}>
                      ✨ Explanation for the Day ✨
                    </Text>
                    <FormattedText
                      text={dailyReading.mainExplanation}
                      baseStyle={styles.explanationText}
                    />
                  </LinearGradient>
                </Animated.View>
              )}

              {/* Share Reading Button */}
              {allCardsRevealed && (
                <Animated.View
                  entering={FadeInUp.delay(600).duration(600)}
                  style={styles.shareContainer}
                >
                  <GoldButton
                    title="Share Reading"
                    onPress={handleShareReading}
                    icon="share-social-outline"
                  />
                </Animated.View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'serif',
    marginTop: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
    marginRight: Spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 44 + Spacing.sm, // Balance for settings button
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  titleName: {
    color: Colors.celestialGold,
  },
  date: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontFamily: 'System',
  },
  constellationContainer: {
    height: 60,
    marginVertical: Spacing.lg,
    position: 'relative',
  },
  constellationStar: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.celestialGold,
  },
  constellationLine: {
    position: 'absolute',
    top: '50%',
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: 'rgba(221, 133, 216, 0.2)',
  },
  generateContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  generateText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'serif',
    lineHeight: 28,
    marginBottom: Spacing.xl,
  },
  cardsContainer: {
    paddingHorizontal: Spacing.md,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tapHint: {
    textAlign: 'center',
    color: Colors.moonlightGray,
    fontSize: 14,
    fontFamily: 'System',
    marginTop: Spacing.xl,
    fontStyle: 'italic',
  },
  explanationContainer: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  explanationGradient: {
    borderRadius: BorderRadius.lg + 4,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.25)',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg + 4,
  },
  explanationTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: 'System',
    lineHeight: 26,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
  shareContainer: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
});
