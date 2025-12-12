// Home Screen - Daily Reading
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import GradientBackground from '@/components/GradientBackground';
import TarotCard from '@/components/TarotCard';
import GoldButton from '@/components/GoldButton';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getRandomCards } from '@/data/tarotDeck';
import {
  getUserProfile,
  getDailyReading,
  saveDailyReading,
  getTodayDateString,
} from '@/utils/storage';
import { formatDateLong } from '@/utils/formatDate';
import { UserProfile, DailyReading, CardReading } from '@/types';
import { useTextGeneration } from '@fastshot/ai';

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { generateText, data: aiText } = useTextGeneration({
    onSuccess: () => {
      console.log('AI interpretation generated');
    },
    onError: (error) => {
      console.error('AI error:', error);
    },
  });

  // Load user profile and daily reading
  useEffect(() => {
    loadData();
  }, []);

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

      // Create card readings
      const cardReadings: CardReading[] = selectedCards.map((card, index) => ({
        card,
        position: (['past', 'present', 'future'] as const)[index],
        isRevealed: false,
        shortDescription: '',
      }));

      // Generate AI interpretations
      const prompt = `You are a mystical tarot reader. The seeker is ${userProfile.fullName}, born on ${formatDateLong(userProfile.dateOfBirth)}.

For their daily reading, they drew these three cards:
1. PAST: ${selectedCards[0].name} - ${selectedCards[0].uprightMeaning}
2. PRESENT: ${selectedCards[1].name} - ${selectedCards[1].uprightMeaning}
3. FUTURE: ${selectedCards[2].name} - ${selectedCards[2].uprightMeaning}

Provide a mystical interpretation in this exact JSON format (no other text):
{
  "past": "One sentence for the past card (20-30 words)",
  "present": "One sentence for the present card (20-30 words)",
  "future": "One sentence for the future card (20-30 words)",
  "dailyMessage": "A paragraph (60-80 words) weaving all three cards together as guidance for today"
}`;

      await generateText(prompt);

      // Parse AI response or use default
      let interpretations = {
        past: selectedCards[0].uprightMeaning,
        present: selectedCards[1].uprightMeaning,
        future: selectedCards[2].uprightMeaning,
        dailyMessage: `Today's energies suggest a significant shift. The combination of ${selectedCards[0].name}, ${selectedCards[1].name}, and ${selectedCards[2].name} speaks to your journey of transformation. Trust in the cosmic flow and embrace the wisdom these cards offer.`,
      };

      if (aiText) {
        try {
          const parsed = JSON.parse(aiText);
          interpretations = { ...interpretations, ...parsed };
        } catch {
          // Use default interpretations
        }
      }

      // Update card readings with interpretations
      cardReadings[0].shortDescription = interpretations.past;
      cardReadings[1].shortDescription = interpretations.present;
      cardReadings[2].shortDescription = interpretations.future;

      // Create and save the reading
      const reading: DailyReading = {
        id: `reading_${Date.now()}`,
        date: getTodayDateString(),
        cards: cardReadings,
        mainExplanation: interpretations.dailyMessage,
        userProfile,
        createdAt: new Date(),
      };

      await saveDailyReading(reading);
      setDailyReading(reading);
    } catch (error) {
      console.error('Error generating reading:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const revealCard = (index: number) => {
    if (!dailyReading) return;

    const updatedCards = [...dailyReading.cards];
    updatedCards[index] = { ...updatedCards[index], isRevealed: true };

    const updatedReading = { ...dailyReading, cards: updatedCards };
    setDailyReading(updatedReading);
    saveDailyReading(updatedReading);
  };

  const allCardsRevealed = dailyReading?.cards.every(c => c.isRevealed) ?? false;

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
            <Text style={styles.title}>
              Your Daily Reading,{'\n'}
              <Text style={styles.titleName}>{userProfile?.fullName || 'Seeker'}</Text>
            </Text>
            <Text style={styles.date}>{formatDateLong(new Date())}</Text>
          </Animated.View>

          {/* Constellation decoration */}
          <View style={styles.constellationContainer}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.constellationStar,
                  {
                    left: `${15 + (i * 10)}%`,
                    top: `${Math.sin(i) * 30 + 50}%`,
                    opacity: 0.3 + Math.random() * 0.4,
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
                      imageUri={null}
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
                    colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)']}
                    style={styles.explanationGradient}
                  >
                    <Text style={styles.explanationTitle}>
                      Explanation for the Day
                    </Text>
                    <Text style={styles.explanationText}>
                      {dailyReading.mainExplanation}
                    </Text>
                  </LinearGradient>
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
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
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
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
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
    marginHorizontal: Spacing.lg,
  },
  explanationGradient: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: Spacing.lg,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: 'System',
    lineHeight: 24,
    textAlign: 'justify',
  },
});
