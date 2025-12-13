// Celestial Blueprint - Charts & Numerology Screen
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTextGeneration } from '@fastshot/ai';

import GradientBackground from '@/components/GradientBackground';
import GoldButton from '@/components/GoldButton';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { getUserProfile, getChartAnalysis, saveChartAnalysis } from '@/utils/storage';
import { UserProfile } from '@/types';
import { formatDateLong, getZodiacSign } from '@/utils/formatDate';
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulUrgeNumber,
} from '@/utils/numerology';

const { width } = Dimensions.get('window');

export default function ChartsScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [numerology, setNumerology] = useState({
    lifePath: 0,
    destiny: 0,
    soulUrge: 0,
  });

  const { generateText } = useTextGeneration({
    onSuccess: async (text) => {
      setAnalysis(text);
      await saveChartAnalysis(text);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Analysis generation failed:', error);
      setIsGenerating(false);
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);

      if (userProfile) {
        setNumerology({
          lifePath: calculateLifePathNumber(userProfile.dateOfBirth),
          destiny: calculateDestinyNumber(userProfile.fullName),
          soulUrge: calculateSoulUrgeNumber(userProfile.fullName),
        });
      }

      const storedAnalysis = await getChartAnalysis();
      if (storedAnalysis) {
        setAnalysis(storedAnalysis);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (!profile) return;
    setIsGenerating(true);

    const sunSign = getZodiacSign(profile.dateOfBirth);
    const lifePath = numerology.lifePath;

    const prompt = `Analyze the astrological and numerological profile for ${profile.fullName}, born ${formatDateLong(profile.dateOfBirth)} at ${profile.timeOfBirth || 'unknown time'} in ${profile.placeOfBirth || 'unknown place'}.

Key Details:
- Sun Sign: ${sunSign}
- Life Path Number: ${lifePath}
- Destiny Number: ${numerology.destiny}
- Soul Urge Number: ${numerology.soulUrge}

Please provide a mystical and insightful reading of their character, strengths, and spiritual path. Include estimated Moon and Rising signs if possible based on the provided time and place (approximate if precise calculation isn't possible). Format the response clearly.`;

    generateText(prompt);
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.celestialGold} />
        </View>
      </GradientBackground>
    );
  }

  const sunSign = profile ? getZodiacSign(profile.dateOfBirth) : '';

  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xxl }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - extends to top of screen */}
          <LinearGradient
            colors={['rgba(221, 133, 216, 0.15)', 'transparent']}
            style={[styles.headerGradient, { paddingTop: insets.top + Spacing.lg }]}
          >
            <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="planet" size={32} color={Colors.celestialGold} />
              </View>
              <Text style={styles.headerTitle}>Celestial Blueprint</Text>
              <Text style={styles.headerSubtitle}>Your Cosmic DNA</Text>
            </Animated.View>
          </LinearGradient>

          {/* Astrology Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>The Big Three</Text>
            <View style={styles.astroCards}>
              {/* Sun Sign */}
              <LinearGradient
                colors={['rgba(221, 133, 216, 0.2)', 'rgba(221, 133, 216, 0.05)']}
                style={styles.astroCard}
              >
                <Text style={styles.astroLabel}>Sun</Text>
                <Ionicons name="sunny" size={24} color={Colors.celestialGold} />
                <Text style={styles.astroValue}>{sunSign}</Text>
              </LinearGradient>

              {/* Moon Sign */}
              <LinearGradient
                colors={['rgba(30, 58, 95, 0.3)', 'rgba(30, 58, 95, 0.1)']}
                style={styles.astroCard}
              >
                <Text style={styles.astroLabel}>Moon</Text>
                <Ionicons name="moon" size={24} color={Colors.moonlightGray} />
                <Text style={styles.astroValue}>
                  {analysis ? 'Revealed' : '?'}
                </Text>
              </LinearGradient>

              {/* Rising Sign */}
              <LinearGradient
                colors={['rgba(30, 58, 95, 0.3)', 'rgba(30, 58, 95, 0.1)']}
                style={styles.astroCard}
              >
                <Text style={styles.astroLabel}>Rising</Text>
                <Ionicons name="arrow-up-circle" size={24} color={Colors.moonlightGray} />
                <Text style={styles.astroValue}>
                  {analysis ? 'Revealed' : '?'}
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Numerology Section */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>Numerology Profile</Text>
            <View style={styles.numerologyRow}>
              <View style={styles.numItem}>
                <View style={styles.numBadge}>
                  <Text style={styles.numValue}>{numerology.lifePath}</Text>
                </View>
                <Text style={styles.numLabel}>Life Path</Text>
              </View>
              <View style={styles.numItem}>
                <View style={styles.numBadge}>
                  <Text style={styles.numValue}>{numerology.destiny}</Text>
                </View>
                <Text style={styles.numLabel}>Destiny</Text>
              </View>
              <View style={styles.numItem}>
                <View style={styles.numBadge}>
                  <Text style={styles.numValue}>{numerology.soulUrge}</Text>
                </View>
                <Text style={styles.numLabel}>Soul Urge</Text>
              </View>
            </View>
          </Animated.View>

          {/* Analysis Section */}
          <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>Deep Analysis</Text>
            {analysis ? (
              <LinearGradient
                colors={['rgba(221, 133, 216, 0.15)', 'rgba(221, 133, 216, 0.05)']}
                style={styles.analysisContainer}
              >
                <Text style={styles.analysisText}>{analysis}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.generateContainer}>
                <Text style={styles.generateText}>
                  Unlock the secrets of your celestial blueprint.
                </Text>
                <GoldButton
                  title="Analyze My Chart"
                  onPress={handleAnalyze}
                  loading={isGenerating}
                />
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: 50,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.celestialGold,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.celestialGold,
    marginBottom: Spacing.md,
    fontFamily: 'serif',
    letterSpacing: 0.5,
  },
  astroCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  astroCard: {
    width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
    aspectRatio: 0.8,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
    padding: Spacing.sm,
  },
  astroLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  astroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  numerologyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.1)',
  },
  numItem: {
    alignItems: 'center',
  },
  numBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.celestialGold,
    marginBottom: Spacing.sm,
    ...Shadows.glow,
  },
  numValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.celestialGold,
    fontFamily: 'serif',
  },
  numLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  generateContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  generateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  analysisContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  analysisText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
    fontFamily: 'System',
  },
});
