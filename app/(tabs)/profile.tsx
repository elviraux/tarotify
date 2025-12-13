// Profile Screen
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '@/components/GradientBackground';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { getUserProfile } from '@/utils/storage';
import { getGenerationStats } from '@/utils/imageStorage';
import { formatDateLong, getZodiacSign } from '@/utils/formatDate';
import { UserProfile } from '@/types';

const zodiacEmojis: Record<string, string> = {
  Aries: '\u2648',
  Taurus: '\u2649',
  Gemini: '\u264A',
  Cancer: '\u264B',
  Leo: '\u264C',
  Virgo: '\u264D',
  Libra: '\u264E',
  Scorpio: '\u264F',
  Sagittarius: '\u2650',
  Capricorn: '\u2651',
  Aquarius: '\u2652',
  Pisces: '\u2653',
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deckStats, setDeckStats] = useState({ totalGenerated: 0, totalCards: 78 });

  useEffect(() => {
    loadProfile();
    loadDeckStats();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeckStats = async () => {
    try {
      const stats = await getGenerationStats();
      setDeckStats(stats);
    } catch (error) {
      console.error('Error loading deck stats:', error);
    }
  };

  const navigateToDeckGallery = () => {
    router.push('/deck-gallery');
  };

  const zodiacSign = profile?.dateOfBirth
    ? getZodiacSign(profile.dateOfBirth)
    : null;

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.celestialGold} />
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
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <Text style={styles.title}>Your Profile</Text>
          </Animated.View>

          {/* Avatar Section */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.avatarSection}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[Colors.celestialGold, '#C06DC0', Colors.celestialGold]}
                style={styles.avatarGradient}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>
                    {profile?.fullName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              </LinearGradient>
            </View>
            <Text style={styles.userName}>{profile?.fullName || 'Seeker'}</Text>
            {zodiacSign && (
              <Text style={styles.zodiacSign}>
                {zodiacEmojis[zodiacSign]} {zodiacSign}
              </Text>
            )}
          </Animated.View>

          {/* Info Cards */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.infoSection}
          >
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar" size={24} color={Colors.celestialGold} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {profile?.dateOfBirth
                    ? formatDateLong(profile.dateOfBirth)
                    : 'Not set'}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="time" size={24} color={Colors.celestialGold} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time of Birth</Text>
                <Text style={styles.infoValue}>
                  {profile?.timeOfBirth || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="location" size={24} color={Colors.celestialGold} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Place of Birth</Text>
                <Text style={styles.infoValue}>
                  {profile?.placeOfBirth || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="star" size={24} color={Colors.celestialGold} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {profile?.createdAt
                    ? formatDateLong(new Date(profile.createdAt))
                    : 'Unknown'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Deck of Destiny Section */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.deckSection}
          >
            <TouchableOpacity
              style={styles.deckCard}
              onPress={navigateToDeckGallery}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(221, 133, 216, 0.15)', 'rgba(221, 133, 216, 0.05)']}
                style={styles.deckGradient}
              >
                <View style={styles.deckIconContainer}>
                  <Ionicons name="albums" size={32} color={Colors.celestialGold} />
                </View>
                <View style={styles.deckInfo}>
                  <Text style={styles.deckTitle}>Deck of Destiny</Text>
                  <Text style={styles.deckSubtitle}>
                    {deckStats.totalGenerated} of {deckStats.totalCards} cards revealed
                  </Text>
                  <View style={styles.deckProgressBar}>
                    <View
                      style={[
                        styles.deckProgressFill,
                        { width: `${(deckStats.totalGenerated / deckStats.totalCards) * 100}%` }
                      ]}
                    />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.celestialGold} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Mystical Quote */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            style={styles.quoteSection}
          >
            <LinearGradient
              colors={['rgba(221, 133, 216, 0.1)', 'rgba(221, 133, 216, 0.05)']}
              style={styles.quoteContainer}
            >
              <Text style={styles.quoteText}>
                &ldquo;The stars speak to those who listen with an open heart.&rdquo;
              </Text>
            </LinearGradient>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    ...Shadows.glow,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: Colors.deepMidnightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  zodiacSign: {
    fontSize: 16,
    color: Colors.celestialGold,
    fontFamily: 'System',
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.15)',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.moonlightGray,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },
  deckSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  deckCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  deckGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  deckIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(221, 133, 216, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
    marginBottom: 2,
  },
  deckSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  deckProgressBar: {
    height: 4,
    backgroundColor: 'rgba(221, 133, 216, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  deckProgressFill: {
    height: '100%',
    backgroundColor: Colors.celestialGold,
    borderRadius: 2,
  },
  quoteSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  quoteContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'serif',
    lineHeight: 24,
  },
});
