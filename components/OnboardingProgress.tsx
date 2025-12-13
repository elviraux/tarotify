// Onboarding Progress Bar Component
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

interface Props {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
}

export default function OnboardingProgress({
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
}: Props) {
  const progress = currentStep / totalSteps;

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, { duration: 300 }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showBack && currentStep > 1 ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.celestialGold} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </View>

        <Text style={styles.stepText}>
          {currentStep} of {totalSteps}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Spacing.xs,
    width: 40,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(221, 133, 216, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.celestialGold,
    borderRadius: 3,
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: 14,
    width: 50,
    textAlign: 'right',
  },
});
