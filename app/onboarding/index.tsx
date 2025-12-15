// Onboarding Flow - Entry Point
import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInRight,
  FadeOutLeft,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/GradientBackground';
import OnboardingProgress from '@/components/OnboardingProgress';
import MysticalInput from '@/components/MysticalInput';
import DateWheelPicker from '@/components/DateWheelPicker';
import TimeWheelPicker from '@/components/TimeWheelPicker';
import GoldButton from '@/components/GoldButton';
import TarotCard from '@/components/TarotCard';
import { Colors, Spacing } from '@/constants/theme';
import { saveUserProfile, setOnboardingComplete } from '@/utils/storage';
import { registerForNotifications, scheduleDailyReminder } from '@/utils/notifications';
import { UserProfile, OnboardingState } from '@/types';
import { getCardById } from '@/data/tarotDeck';

const { height } = Dimensions.get('window');

const TOTAL_STEPS = 9;

const INTENT_OPTIONS = [
  { id: 'love', label: 'Love & relationships', icon: '❤️' },
  { id: 'clarity', label: 'Clarity about someone', icon: '🔮' },
  { id: 'guidance', label: 'Personal guidance', icon: '✨' },
  { id: 'charts', label: 'Astrology & charts', icon: '📊' },
];

const FEELING_OPTIONS = [
  { id: 'clarity', label: 'I want clarity' },
  { id: 'confused', label: 'I feel confused' },
  { id: 'stuck', label: 'I feel stuck' },
  { id: 'hopeful', label: 'I feel hopeful' },
];

export default function OnboardingScreen() {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    fullName: '',
    dateOfBirth: new Date(1995, 9, 26), // Default date
    timeOfBirth: '',
    placeOfBirth: '',
    intent: '',
    feelings: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get The High Priestess card (id: 2)
  const highPriestessCard = useMemo(() => getCardById(2), []);

  const handleNext = useCallback(async () => {
    if (state.currentStep < TOTAL_STEPS) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      // Final step - save and navigate
      setIsSubmitting(true);
      try {
        const profile: UserProfile = {
          fullName: state.fullName,
          dateOfBirth: state.dateOfBirth!,
          timeOfBirth: state.timeOfBirth,
          placeOfBirth: state.placeOfBirth,
          createdAt: new Date(),
        };
        await saveUserProfile(profile);
        await setOnboardingComplete(true);

        // Request notification permissions at the end of onboarding
        const permissionGranted = await registerForNotifications();
        if (permissionGranted) {
          await scheduleDailyReminder();
        }

        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error saving profile:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [state]);

  const handleBack = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);

  const handleDateChange = useCallback((date: Date) => {
    setState(prev => ({ ...prev, dateOfBirth: date }));
  }, []);

  const handleTimeChange = useCallback((time: string) => {
    setState(prev => ({ ...prev, timeOfBirth: time }));
  }, []);

  const handleIntentSelect = useCallback((intentId: string) => {
    setState(prev => ({ ...prev, intent: intentId }));
  }, []);

  const handleFeelingToggle = useCallback((feelingId: string) => {
    setState(prev => {
      const isSelected = prev.feelings.includes(feelingId);
      if (isSelected) {
        return { ...prev, feelings: prev.feelings.filter(f => f !== feelingId) };
      } else {
        return { ...prev, feelings: [...prev.feelings, feelingId] };
      }
    });
  }, []);

  const handleSkip = useCallback(async () => {
    // Clear the current field and move to next step (or complete if on last step)
    if (state.currentStep === TOTAL_STEPS) {
      // On last step, skip means complete with empty place
      setIsSubmitting(true);
      try {
        const profile: UserProfile = {
          fullName: state.fullName,
          dateOfBirth: state.dateOfBirth!,
          timeOfBirth: state.timeOfBirth,
          placeOfBirth: '',
          createdAt: new Date(),
        };
        await saveUserProfile(profile);
        await setOnboardingComplete(true);

        const permissionGranted = await registerForNotifications();
        if (permissionGranted) {
          await scheduleDailyReminder();
        }

        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error saving profile:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setState(prev => {
        const updates: Partial<OnboardingState> = { currentStep: prev.currentStep + 1 };

        switch (prev.currentStep) {
          case 6:
            updates.fullName = '';
            break;
          case 7:
            updates.dateOfBirth = null;
            break;
          case 8:
            updates.timeOfBirth = '';
            break;
        }

        return { ...prev, ...updates };
      });
    }
  }, [state]);

  const showSkipButton = () => {
    return [6, 7, 8, 9].includes(state.currentStep);
  };

  const isStepValid = () => {
    switch (state.currentStep) {
      case 1:
        return true; // Hook screen - always valid
      case 2:
        return state.intent.length > 0; // Intent must be selected
      case 3:
        return state.feelings.length > 0; // At least one feeling selected
      case 4:
        return true; // Authority screen - always valid
      case 5:
        return true; // First Signal screen - always valid
      case 6:
        return state.fullName.trim().length >= 2;
      case 7:
        return state.dateOfBirth !== null;
      case 8:
        return true; // Time is optional
      case 9:
        return true; // Place is optional
      default:
        return false;
    }
  };

  const getButtonTitle = () => {
    switch (state.currentStep) {
      case 4:
        return 'Show me';
      case TOTAL_STEPS:
        return 'Begin Reading';
      default:
        return 'Continue';
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Animated.View
            key="step1"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Text style={styles.hookHeadline}>Something is on{'\n'}your mind.</Text>
            <Animated.Text
              entering={FadeInUp.delay(600).duration(500)}
              style={styles.hookSub}
            >
              Seer reveals what&apos;s unspoken.
            </Animated.Text>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            key="step2"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>What are you{'\n'}seeking?</Text>
            <Text style={styles.subheading}>Choose what resonates with you</Text>
            <View style={styles.intentGrid}>
              {INTENT_OPTIONS.map((option, index) => (
                <Animated.View
                  key={option.id}
                  entering={FadeInUp.delay(400 + index * 100).duration(400)}
                >
                  <TouchableOpacity
                    style={[
                      styles.intentCard,
                      state.intent === option.id && styles.selectedIntentCard,
                    ]}
                    onPress={() => handleIntentSelect(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.intentIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.intentLabel,
                      state.intent === option.id && styles.selectedIntentLabel,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            key="step3"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>When it comes to{'\n'}this connection...</Text>
            <Text style={styles.subheading}>Select all that apply</Text>
            <View style={styles.feelingsList}>
              {FEELING_OPTIONS.map((option, index) => (
                <Animated.View
                  key={option.id}
                  entering={FadeInUp.delay(400 + index * 80).duration(400)}
                  style={styles.feelingButtonWrapper}
                >
                  <TouchableOpacity
                    style={[
                      styles.feelingButton,
                      state.feelings.includes(option.id) && styles.selectedFeelingButton,
                    ]}
                    onPress={() => handleFeelingToggle(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.feelingLabel,
                      state.feelings.includes(option.id) && styles.selectedFeelingLabel,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View
            key="step4"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Animated.Text
              entering={FadeInUp.delay(400).duration(500)}
              style={styles.authorityText}
            >
              Seer reads emotional patterns through tarot, astrology, and intuitive insight.
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(600).duration(500)}
              style={styles.authorityTextSecondary}
            >
              No judgment. No assumptions.{'\n'}Only what&apos;s relevant right now.
            </Animated.Text>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View
            key="step5"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>The energy around{'\n'}this feels...</Text>
            {highPriestessCard && (
              <Animated.View
                entering={FadeInUp.delay(500).duration(600)}
                style={styles.singleCardContainer}
              >
                <TarotCard
                  card={highPriestessCard}
                  position="present"
                  isRevealed={true}
                  onPress={() => {}}
                />
              </Animated.View>
            )}
            <Animated.Text
              entering={FadeInUp.delay(800).duration(500)}
              style={styles.insightText}
            >
              There&apos;s distance, but not detachment.{'\n'}Something is still unfolding.
            </Animated.Text>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View
            key="step6"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>Begin Your{'\n'}Journey</Text>
            <Text style={styles.subheading}>What should Seer call you?</Text>
            <View style={styles.inputContainer}>
              <MysticalInput
                value={state.fullName}
                onChangeText={(text) =>
                  setState(prev => ({ ...prev, fullName: text }))
                }
                placeholder="Enter your name"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </Animated.View>
        );

      case 7:
        return (
          <Animated.View
            key="step7"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>Your Celestial{'\n'}Alignment</Text>
            <Text style={styles.subheading}>When were you born?</Text>
            <DateWheelPicker
              value={state.dateOfBirth || new Date()}
              onChange={handleDateChange}
            />
          </Animated.View>
        );

      case 8:
        return (
          <Animated.View
            key="step8"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>Hour of{'\n'}Arrival</Text>
            <Text style={styles.subheading}>What time were you born?</Text>
            <TimeWheelPicker
              value={state.timeOfBirth}
              onChange={handleTimeChange}
            />
          </Animated.View>
        );

      case 9:
        return (
          <Animated.View
            key="step9"
            entering={FadeInRight.delay(300).duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>Place of{'\n'}Origin</Text>
            <Text style={styles.subheading}>Where were you born?</Text>
            <View style={styles.inputContainer}>
              <MysticalInput
                value={state.placeOfBirth}
                onChangeText={(text) =>
                  setState(prev => ({ ...prev, placeOfBirth: text }))
                }
                placeholder="e.g., Los Angeles, CA"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.keyboardDismissView}>
              <OnboardingProgress
                currentStep={state.currentStep}
                totalSteps={TOTAL_STEPS}
                onBack={handleBack}
                showBack={state.currentStep > 1}
              />

              <View style={styles.contentContainer}>
                {renderStepContent()}
              </View>

              <Animated.View
                entering={FadeIn.duration(500)}
                exiting={FadeOut.duration(300)}
                style={styles.buttonContainer}
              >
                <GoldButton
                  title={getButtonTitle()}
                  onPress={handleNext}
                  disabled={!isStepValid()}
                  loading={isSubmitting}
                />
                {showSkipButton() && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  keyboardDismissView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    minHeight: height * 0.5,
  },
  stepContent: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 36,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 44,
  },
  subheading: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontFamily: 'System',
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  // Hook screen styles
  hookHeadline: {
    fontSize: 42,
    fontWeight: '300',
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 52,
    letterSpacing: 0.5,
  },
  hookSub: {
    fontSize: 18,
    color: Colors.celestialGold,
    textAlign: 'center',
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 26,
    opacity: 0.9,
  },
  // Intent grid styles
  intentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    width: '100%',
    maxWidth: 340,
  },
  intentCard: {
    width: 150,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIntentCard: {
    borderColor: Colors.celestialGold,
    backgroundColor: 'rgba(221, 133, 216, 0.12)',
  },
  intentIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  intentLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  selectedIntentLabel: {
    color: Colors.celestialGold,
  },
  // Feeling buttons styles
  feelingsList: {
    width: '100%',
    maxWidth: 300,
    gap: Spacing.md,
  },
  feelingButtonWrapper: {
    width: '100%',
  },
  feelingButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  selectedFeelingButton: {
    borderColor: Colors.celestialGold,
    backgroundColor: 'rgba(221, 133, 216, 0.12)',
  },
  feelingLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedFeelingLabel: {
    color: Colors.celestialGold,
  },
  // Authority screen styles
  authorityText: {
    fontSize: 20,
    fontFamily: 'serif',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
    letterSpacing: 0.3,
  },
  authorityTextSecondary: {
    fontSize: 18,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.9,
  },
  // First Signal (Card) screen styles
  singleCardContainer: {
    marginVertical: Spacing.lg,
    alignItems: 'center',
    transform: [{ scale: 1.3 }],
  },
  insightText: {
    fontSize: 16,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: Colors.celestialGold,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: Spacing.xl,
    opacity: 0.9,
  },
  // Skip button styles
  skipButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
