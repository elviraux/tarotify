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
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTextGeneration } from '@fastshot/ai';
import { router } from 'expo-router';

import GradientBackground from '@/components/GradientBackground';
import GoldButton from '@/components/GoldButton';
import FormattedText from '@/components/FormattedText';
import { Colors, Spacing, BorderRadius, Shadows, Fonts } from '@/constants/theme';
import { getUserProfile, getChartAnalysis, saveChartAnalysis } from '@/utils/storage';
import { UserProfile } from '@/types';
import { formatDateLong, getZodiacSign } from '@/utils/formatDate';
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulUrgeNumber,
} from '@/utils/numerology';
import {
  calculateMoonSign,
  calculateRisingSign,
} from '@/utils/astrology';

const { width } = Dimensions.get('window');

// Helper to clean analysis text - handles stored JSON or raw text
const cleanAnalysisText = (text: string): string => {
  if (!text) return '';

  const trimmed = text.trim();

  // Check if this looks like JSON (starts with { or contains common JSON patterns)
  if (trimmed.startsWith('{') || trimmed.includes('"analysis"') || trimmed.includes('"moonSign"')) {
    try {
      // Try to extract JSON from markdown code blocks first
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      let jsonText = text;
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        // Find the first '{' and last '}' to extract JSON object
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonText = text.substring(firstBrace, lastBrace + 1);
        }
      }

      const parsed = JSON.parse(jsonText);
      if (parsed.analysis && typeof parsed.analysis === 'string') {
        // Clean up the analysis text
        return parsed.analysis
          .replace(/\\n\\n/g, '\n\n')
          .replace(/\\n/g, '\n')
          .trim();
      }
    } catch {
      // If JSON parsing fails, continue to clean as raw text
    }
  }

  // If it still looks like raw JSON after failed parse, return empty to force regeneration
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return '';
  }

  // Clean up any escaped newlines in raw text
  return text
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .trim();
};

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsibleHeaderLeft}>
          <Ionicons name={icon} size={18} color={Colors.celestialGold} />
          <Text style={styles.collapsibleTitle}>{title}</Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.moonlightGray}
        />
      </TouchableOpacity>
      {isOpen && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
}

export default function ChartsScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [astroSigns, setAstroSigns] = useState({
    sun: '',
    moon: '',
    rising: null as string | null,
  });

  const [numerology, setNumerology] = useState({
    lifePath: 0,
    destiny: 0,
    soulUrge: 0,
  });

  const { generateText } = useTextGeneration({
    onSuccess: async (text) => {
      // Use the cleanAnalysisText helper which handles all JSON extraction
      const cleanedAnalysis = cleanAnalysisText(text);

      if (cleanedAnalysis) {
        // Successfully extracted analysis text
        setAnalysis(cleanedAnalysis);
        await saveChartAnalysis(cleanedAnalysis);

        // Try to extract moon/rising signs from JSON if present
        try {
          const firstBrace = text.indexOf('{');
          const lastBrace = text.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonStr = text.substring(firstBrace, lastBrace + 1);
            const parsed = JSON.parse(jsonStr);
            if (parsed.moonSign) {
              setAstroSigns(prev => ({ ...prev, moon: parsed.moonSign }));
            }
            if (parsed.risingSign) {
              setAstroSigns(prev => ({ ...prev, rising: parsed.risingSign }));
            }
          }
        } catch {
          // Ignore sign extraction errors
        }
      } else {
        // If cleaning returned empty (failed to extract), check if text looks like non-JSON prose
        const trimmed = text.trim();
        const looksLikeJSON = trimmed.startsWith('{') || trimmed.startsWith('[');

        if (!looksLikeJSON && trimmed.length > 50) {
          // It's probably prose text without JSON wrapper - use it directly
          setAnalysis(trimmed);
          await saveChartAnalysis(trimmed);
        } else {
          // Failed to extract valid analysis - show error state
          console.error('Failed to extract analysis from response');
          setAnalysis(null);
        }
      }
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
        // Calculate all signs immediately
        const sunSign = getZodiacSign(userProfile.dateOfBirth);
        const moonSign = calculateMoonSign(userProfile.dateOfBirth);
        const risingSign = calculateRisingSign(
          userProfile.dateOfBirth,
          userProfile.timeOfBirth
        );

        setAstroSigns({
          sun: sunSign,
          moon: moonSign,
          rising: risingSign,
        });

        setNumerology({
          lifePath: calculateLifePathNumber(userProfile.dateOfBirth),
          destiny: calculateDestinyNumber(userProfile.fullName),
          soulUrge: calculateSoulUrgeNumber(userProfile.fullName),
        });
      }

      const storedAnalysis = await getChartAnalysis();
      if (storedAnalysis) {
        // Clean the stored analysis in case it's raw JSON from before
        const cleanedAnalysis = cleanAnalysisText(storedAnalysis);
        setAnalysis(cleanedAnalysis);
        // Re-save the cleaned version
        if (cleanedAnalysis !== storedAnalysis) {
          await saveChartAnalysis(cleanedAnalysis);
        }
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

    const prompt = `You are a mystical astrologer. Analyze this birth chart and respond with ONLY a valid JSON object - no other text, no markdown, no explanation before or after.

Birth Information:
- Name: ${profile.fullName}
- Date: ${formatDateLong(profile.dateOfBirth)}
- Time: ${profile.timeOfBirth || 'Unknown'}
- Place: ${profile.placeOfBirth || 'Unknown'}

Current Calculations:
- Sun Sign: ${astroSigns.sun}
- Estimated Moon Sign: ${astroSigns.moon}
- Estimated Rising Sign: ${astroSigns.rising || 'Unknown (no birth time)'}
- Life Path Number: ${numerology.lifePath}
- Destiny Number: ${numerology.destiny}
- Soul Urge Number: ${numerology.soulUrge}

Respond with EXACTLY this JSON structure (no markdown code blocks):
{"moonSign": "${astroSigns.moon}", "risingSign": ${astroSigns.rising ? `"${astroSigns.rising}"` : 'null'}, "analysis": "Dear ${profile.fullName.split(' ')[0]}, [Your warm, mystical analysis here. Include insights about their Sun sign personality, Moon sign emotions, numerology life path, and spiritual guidance. Use proper paragraphs separated by actual newlines. 200-300 words total.]"}

CRITICAL: Output ONLY the JSON object. No text before or after. The analysis field should contain flowing prose with proper paragraphs.`;

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
                <Text style={styles.astroValue}>{astroSigns.sun}</Text>
              </LinearGradient>

              {/* Moon Sign */}
              <LinearGradient
                colors={['rgba(221, 133, 216, 0.2)', 'rgba(221, 133, 216, 0.05)']}
                style={styles.astroCard}
              >
                <Text style={styles.astroLabel}>Moon</Text>
                <Ionicons name="moon" size={24} color={Colors.celestialGold} />
                <Text style={styles.astroValue}>{astroSigns.moon}</Text>
              </LinearGradient>

              {/* Rising Sign */}
              <LinearGradient
                colors={astroSigns.rising
                  ? ['rgba(221, 133, 216, 0.2)', 'rgba(221, 133, 216, 0.05)']
                  : ['rgba(30, 58, 95, 0.3)', 'rgba(30, 58, 95, 0.1)']}
                style={styles.astroCard}
              >
                <Text style={styles.astroLabel}>Rising</Text>
                <Ionicons
                  name="arrow-up-circle"
                  size={24}
                  color={astroSigns.rising ? Colors.celestialGold : Colors.moonlightGray}
                />
                <Text style={[
                  styles.astroValue,
                  !astroSigns.rising && styles.astroValueUnknown
                ]}>
                  {astroSigns.rising || 'Unknown'}
                </Text>
              </LinearGradient>
            </View>
            {!astroSigns.rising && (
              <Text style={styles.astroHint}>
                Add your birth time in Profile for Rising sign
              </Text>
            )}
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
              <View style={styles.analysisWrapper}>
                {/* Main Analysis Card */}
                <LinearGradient
                  colors={['rgba(221, 133, 216, 0.12)', 'rgba(221, 133, 216, 0.04)']}
                  style={styles.analysisContainer}
                >
                  {/* Cosmic Identity Section */}
                  <CollapsibleSection
                    title="Your Cosmic Reading"
                    icon="sparkles"
                  >
                    <FormattedText
                      text={analysis}
                      baseStyle={styles.analysisText}
                    />
                  </CollapsibleSection>

                  {/* Key Insights Section */}
                  <CollapsibleSection
                    title="Key Cosmic Influences"
                    icon="planet"
                  >
                    <View style={styles.insightRow}>
                      <View style={styles.insightItem}>
                        <Ionicons name="sunny" size={16} color={Colors.celestialGold} />
                        <Text style={styles.insightLabel}>Sun in {astroSigns.sun}</Text>
                      </View>
                      <Text style={styles.insightText}>
                        Your core identity and life force
                      </Text>
                    </View>
                    <View style={styles.insightRow}>
                      <View style={styles.insightItem}>
                        <Ionicons name="moon" size={16} color={Colors.celestialGold} />
                        <Text style={styles.insightLabel}>Moon in {astroSigns.moon}</Text>
                      </View>
                      <Text style={styles.insightText}>
                        Your emotional nature and inner world
                      </Text>
                    </View>
                    <View style={styles.insightRow}>
                      <View style={styles.insightItem}>
                        <Ionicons name="star" size={16} color={Colors.celestialGold} />
                        <Text style={styles.insightLabel}>Life Path {numerology.lifePath}</Text>
                      </View>
                      <Text style={styles.insightText}>
                        Your spiritual journey and purpose
                      </Text>
                    </View>
                  </CollapsibleSection>
                </LinearGradient>

                {/* Action Buttons */}
                <View style={styles.analysisActions}>
                  {/* Discuss with Oracle Button */}
                  <TouchableOpacity
                    style={styles.oracleButton}
                    onPress={() => router.push('/chat')}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['rgba(221, 133, 216, 0.2)', 'rgba(221, 133, 216, 0.1)']}
                      style={styles.oracleButtonGradient}
                    >
                      <Ionicons name="chatbubbles" size={18} color={Colors.celestialGold} />
                      <Text style={styles.oracleButtonText}>Discuss with Oracle</Text>
                      <Ionicons name="arrow-forward" size={16} color={Colors.moonlightGray} />
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Regenerate Button */}
                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={handleAnalyze}
                    disabled={isGenerating}
                    activeOpacity={0.7}
                  >
                    {isGenerating ? (
                      <ActivityIndicator size="small" color={Colors.moonlightGray} />
                    ) : (
                      <>
                        <Ionicons name="refresh" size={16} color={Colors.moonlightGray} />
                        <Text style={styles.regenerateButtonText}>Regenerate Analysis</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
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
    fontSize: 48,
    fontWeight: '600',
    fontFamily: Fonts.heading,
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
    fontSize: 20,
    fontWeight: '600',
    color: Colors.celestialGold,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
    fontFamily: Fonts.body
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
    fontFamily: Fonts.body,
  },
  astroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  astroValueUnknown: {
    color: Colors.moonlightGray,
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  astroHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    fontFamily: Fonts.body
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
    fontSize: 36,
    fontWeight: '700',
    color: Colors.celestialGold,
    fontFamily: Fonts.heading,
  },
  numLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontFamily: Fonts.body
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
    fontFamily: Fonts.body,
    fontStyle: 'italic',
  },
  analysisWrapper: {
    gap: Spacing.md,
  },
  analysisContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
    overflow: 'hidden',
  },
  analysisText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  // Collapsible Section Styles
  collapsibleSection: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(221, 133, 216, 0.1)',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  collapsibleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.celestialGold,
    fontFamily: Fonts.heading,
  },
  collapsibleContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  // Insight Styles
  insightRow: {
    marginBottom: Spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  insightText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: Spacing.lg + 4,
    fontStyle: 'italic',
  },
  // Action Buttons Styles
  analysisActions: {
    gap: Spacing.sm,
  },
  oracleButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  oracleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  oracleButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.celestialGold,
    fontFamily: Fonts.heading,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  regenerateButtonText: {
    fontSize: 13,
    color: Colors.moonlightGray,
  },
});
