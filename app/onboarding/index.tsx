// Onboarding Flow - Entry Point
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/GradientBackground';
import OnboardingProgress from '@/components/OnboardingProgress';
import MysticalInput from '@/components/MysticalInput';
import DateWheelPicker from '@/components/DateWheelPicker';
import GoldButton from '@/components/GoldButton';
import { Colors, Spacing } from '@/constants/theme';
import { saveUserProfile, setOnboardingComplete } from '@/utils/storage';
import { UserProfile, OnboardingState } from '@/types';

const { height } = Dimensions.get('window');

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    fullName: '',
    dateOfBirth: new Date(1995, 9, 26), // Default date
    timeOfBirth: '',
    placeOfBirth: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const isStepValid = () => {
    switch (state.currentStep) {
      case 1:
        return state.fullName.trim().length >= 2;
      case 2:
        return state.dateOfBirth !== null;
      case 3:
        return true; // Time is optional
      case 4:
        return true; // Place is optional
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Animated.View
            key="step1"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>Begin Your{'\n'}Journey</Text>
            <Text style={styles.subheading}>What is your full name?</Text>
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

      case 2:
        return (
          <Animated.View
            key="step2"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
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

      case 3:
        return (
          <Animated.View
            key="step3"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>Hour of{'\n'}Arrival</Text>
            <Text style={styles.subheading}>
              What time were you born?{'\n'}
              <Text style={styles.optional}>(Optional - enhances accuracy)</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MysticalInput
                value={state.timeOfBirth}
                onChangeText={(text) =>
                  setState(prev => ({ ...prev, timeOfBirth: text }))
                }
                placeholder="e.g., 3:45 PM"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View
            key="step4"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            style={styles.stepContent}
          >
            <Text style={styles.heading}>Place of{'\n'}Origin</Text>
            <Text style={styles.subheading}>
              Where were you born?{'\n'}
              <Text style={styles.optional}>(Optional - enhances accuracy)</Text>
            </Text>
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
                  title={state.currentStep === TOTAL_STEPS ? 'Begin Reading' : 'Continue'}
                  onPress={handleNext}
                  disabled={!isStepValid()}
                  loading={isSubmitting}
                />
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
  optional: {
    fontSize: 14,
    color: Colors.moonlightGray,
    fontStyle: 'italic',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});
