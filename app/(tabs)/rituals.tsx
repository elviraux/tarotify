// Rituals Screen - Daily spiritual practices
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '@/components/GradientBackground';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface RitualCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  duration: string;
  onPress?: () => void;
}

function RitualCard({ icon, title, description, duration, onPress }: RitualCardProps) {
  return (
    <TouchableOpacity
      style={styles.ritualCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.ritualIconContainer}>
        <Ionicons name={icon} size={28} color={Colors.celestialGold} />
      </View>
      <View style={styles.ritualContent}>
        <Text style={styles.ritualTitle}>{title}</Text>
        <Text style={styles.ritualDescription}>{description}</Text>
      </View>
      <View style={styles.ritualMeta}>
        <Text style={styles.ritualDuration}>{duration}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.moonlightGray} />
      </View>
    </TouchableOpacity>
  );
}

export default function RitualsScreen() {
  const rituals = [
    {
      icon: 'sunny-outline' as const,
      title: 'Morning Affirmation',
      description: 'Start your day with positive cosmic energy',
      duration: '5 min',
    },
    {
      icon: 'moon-outline' as const,
      title: 'Moon Meditation',
      description: 'Connect with lunar cycles and inner wisdom',
      duration: '10 min',
    },
    {
      icon: 'sparkles-outline' as const,
      title: 'Gratitude Ritual',
      description: 'Manifest abundance through thankfulness',
      duration: '3 min',
    },
    {
      icon: 'water-outline' as const,
      title: 'Cleansing Visualization',
      description: 'Release negative energy and restore balance',
      duration: '7 min',
    },
    {
      icon: 'star-outline' as const,
      title: 'Evening Reflection',
      description: 'Review the day and set intentions for tomorrow',
      duration: '5 min',
    },
  ];

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
            <Text style={styles.title}>Daily Rituals</Text>
            <Text style={styles.subtitle}>Align with the cosmos</Text>
          </Animated.View>

          {/* Coming Soon Banner */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.comingSoonBanner}
          >
            <Ionicons name="time-outline" size={24} color={Colors.celestialGold} />
            <Text style={styles.comingSoonText}>
              Interactive rituals coming soon. Preview what awaits...
            </Text>
          </Animated.View>

          {/* Rituals List */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.ritualsSection}
          >
            <Text style={styles.sectionTitle}>Available Rituals</Text>
            {rituals.map((ritual, index) => (
              <Animated.View
                key={ritual.title}
                entering={FadeInUp.delay(500 + index * 100).duration(500)}
              >
                <RitualCard
                  icon={ritual.icon}
                  title={ritual.title}
                  description={ritual.description}
                  duration={ritual.duration}
                  onPress={() => {
                    // TODO: Navigate to ritual detail/execution screen
                  }}
                />
              </Animated.View>
            ))}
          </Animated.View>

          {/* Mystical Quote */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(600)}
            style={styles.quoteSection}
          >
            <Text style={styles.quoteText}>
              &ldquo;Rituals are the formulas by which harmony is restored.&rdquo;
            </Text>
            <Text style={styles.quoteAuthor}>- Terry Tempest Williams</Text>
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
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.celestialGold,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  comingSoonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
    borderStyle: 'dashed',
  },
  comingSoonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontFamily: 'System',
  },
  ritualsSection: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.celestialGold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  ritualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.15)',
  },
  ritualIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  ritualContent: {
    flex: 1,
  },
  ritualTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'System',
    marginBottom: 2,
  },
  ritualDescription: {
    fontSize: 13,
    color: Colors.moonlightGray,
    fontFamily: 'System',
  },
  ritualMeta: {
    alignItems: 'flex-end',
  },
  ritualDuration: {
    fontSize: 12,
    color: Colors.celestialGold,
    fontWeight: '500',
    marginBottom: 4,
  },
  quoteSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    marginTop: Spacing.lg,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'serif',
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
  quoteAuthor: {
    fontSize: 13,
    color: Colors.moonlightGray,
    fontFamily: 'System',
  },
});
