// Home Dashboard Screen
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import GradientBackground from '@/components/GradientBackground';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { getUserProfile } from '@/utils/storage';
import { UserProfile } from '@/types';
import { useCardBack } from '@/hooks/useCardImages';
import { resolveCardBackSource } from '@/utils/imageStorage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  delay?: number;
}

function QuickActionCard({ icon, title, subtitle, onPress, delay = 0 }: QuickActionCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500)}>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name={icon} size={28} color={Colors.celestialGold} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const cardBack = useCardBack();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const greeting = getGreeting();
  const userName = userProfile?.fullName?.split(' ')[0] || 'Seeker';
  const cardBackSource = cardBack.uri ? resolveCardBackSource(cardBack.uri) : null;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="settings-outline" size={24} color={Colors.celestialGold} />
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </Animated.View>

          {/* Hero Section */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.heroSection}
          >
            <Text style={styles.heroTitle}>
              What would you like{'\n'}to do today?
            </Text>
          </Animated.View>

          {/* Featured Card - Daily Tarot */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.featuredContainer}
          >
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => router.push('/(tabs)/tarot')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['rgba(221, 133, 216, 0.25)', 'rgba(221, 133, 216, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featuredGradient}
              >
                <View style={styles.featuredCardContainer}>
                  {cardBackSource ? (
                    <Image
                      source={cardBackSource as { uri: string } | number}
                      style={styles.featuredCardImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Ionicons name="sparkles" size={32} color={Colors.celestialGold} />
                  )}
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>Daily Tarot Reading</Text>
                  <Text style={styles.featuredSubtitle}>
                    Reveal your guidance for the day
                  </Text>
                </View>
                <View style={styles.featuredArrow}>
                  <Ionicons name="arrow-forward-circle" size={32} color={Colors.celestialGold} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions Grid */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Explore</Text>
          </Animated.View>

          <View style={styles.actionsGrid}>
            <QuickActionCard
              icon="chatbubbles-outline"
              title="Consult Oracle"
              subtitle="Ask your questions"
              onPress={() => router.push('/(tabs)/chat')}
              delay={600}
            />
            <QuickActionCard
              icon="planet-outline"
              title="View Charts"
              subtitle="Cosmic insights"
              onPress={() => router.push('/(tabs)/charts')}
              delay={700}
            />
            <QuickActionCard
              icon="book-outline"
              title="My Journal"
              subtitle="Past readings"
              onPress={() => router.push('/(tabs)/journal')}
              delay={800}
            />
            <QuickActionCard
              icon="person-circle-outline"
              title="My Profile"
              subtitle="Birth details"
              onPress={() => router.push('/profile')}
              delay={900}
            />
          </View>

          {/* Mystical Footer Quote */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(600)}
            style={styles.quoteContainer}
          >
            <Text style={styles.quoteText}>
              &ldquo;The cosmos aligns for those who seek its wisdom.&rdquo;
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  greetingContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'System',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.celestialGold,
    fontFamily: 'serif',
  },
  heroSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
    lineHeight: 42,
  },
  featuredContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  featuredCard: {
    borderRadius: BorderRadius.lg + 4,
    overflow: 'hidden',
    ...Shadows.card,
  },
  featuredGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg + 4,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.35)',
  },
  featuredCardContainer: {
    width: 54,
    height: 84,
    borderRadius: 6,
    backgroundColor: 'rgba(221, 133, 216, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  featuredCardImage: {
    width: '100%',
    height: '100%',
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'System',
  },
  featuredArrow: {
    marginLeft: Spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.celestialGold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.15)',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'System',
    marginBottom: 2,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.moonlightGray,
    fontFamily: 'System',
    textAlign: 'center',
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.moonlightGray,
    textAlign: 'center',
    fontFamily: 'serif',
    lineHeight: 24,
  },
});
