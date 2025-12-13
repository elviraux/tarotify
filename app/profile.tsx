// Profile Screen with Edit Mode
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '@/components/GradientBackground';
import MysticalInput from '@/components/MysticalInput';
import DateWheelPicker from '@/components/DateWheelPicker';
import TimeWheelPicker from '@/components/TimeWheelPicker';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { getUserProfile, saveUserProfile } from '@/utils/storage';
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deckStats, setDeckStats] = useState({ totalGenerated: 0, totalCards: 78 });

  // Edit mode state
  const [editName, setEditName] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState<Date>(new Date());
  const [editTimeOfBirth, setEditTimeOfBirth] = useState('');
  const [editPlaceOfBirth, setEditPlaceOfBirth] = useState('');

  // Collapsible sections for pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadProfile();
    loadDeckStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      if (userProfile) {
        initializeEditState(userProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeEditState = (userProfile: UserProfile) => {
    setEditName(userProfile.fullName || '');
    setEditDateOfBirth(userProfile.dateOfBirth || new Date());
    setEditTimeOfBirth(userProfile.timeOfBirth || '');
    setEditPlaceOfBirth(userProfile.placeOfBirth || '');
  };

  const loadDeckStats = async () => {
    try {
      const stats = await getGenerationStats();
      setDeckStats(stats);
    } catch (error) {
      console.error('Error loading deck stats:', error);
    }
  };

  const handleStartEdit = useCallback(() => {
    if (profile) {
      initializeEditState(profile);
    }
    setShowDatePicker(false);
    setShowTimePicker(false);
    setIsEditing(true);
  }, [profile]);

  const handleCancelEdit = useCallback(() => {
    if (profile) {
      initializeEditState(profile);
    }
    setShowDatePicker(false);
    setShowTimePicker(false);
    setIsEditing(false);
  }, [profile]);

  const handleSaveEdit = useCallback(async () => {
    // Validate
    if (!editName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile: UserProfile = {
        fullName: editName.trim(),
        dateOfBirth: editDateOfBirth,
        timeOfBirth: editTimeOfBirth,
        placeOfBirth: editPlaceOfBirth,
        createdAt: profile?.createdAt || new Date(),
      };

      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setShowDatePicker(false);
      setShowTimePicker(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Save Failed', 'Unable to save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [editName, editDateOfBirth, editTimeOfBirth, editPlaceOfBirth, profile]);

  const navigateToDeckGallery = () => {
    router.push('/deck-gallery');
  };

  const handleGoBack = () => {
    router.back();
  };

  const zodiacSign = profile?.dateOfBirth
    ? getZodiacSign(profile.dateOfBirth)
    : null;

  const editZodiacSign = editDateOfBirth
    ? getZodiacSign(editDateOfBirth)
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
                {/* Back Button */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleGoBack}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="chevron-back" size={28} color={Colors.celestialGold} />
                </TouchableOpacity>

                <Text style={styles.title}>Your Profile</Text>

                {/* Edit/Save/Cancel Buttons */}
                <View style={styles.headerActions}>
                  {isEditing ? (
                    <>
                      <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleCancelEdit}
                        disabled={isSaving}
                      >
                        <Ionicons name="close" size={24} color={Colors.moonlightGray} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.headerButton, styles.saveButton]}
                        onPress={handleSaveEdit}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color={Colors.celestialGold} />
                        ) : (
                          <Ionicons name="checkmark" size={24} color={Colors.celestialGold} />
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={handleStartEdit}
                    >
                      <Ionicons name="pencil" size={20} color={Colors.celestialGold} />
                    </TouchableOpacity>
                  )}
                </View>
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
                        {(isEditing ? editName : profile?.fullName)?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                {isEditing ? (
                  <View style={styles.nameInputContainer}>
                    <MysticalInput
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter your name"
                      autoCapitalize="words"
                    />
                  </View>
                ) : (
                  <Text style={styles.userName}>{profile?.fullName || 'Seeker'}</Text>
                )}

                {(isEditing ? editZodiacSign : zodiacSign) && (
                  <Text style={styles.zodiacSign}>
                    {zodiacEmojis[isEditing ? editZodiacSign! : zodiacSign!]} {isEditing ? editZodiacSign : zodiacSign}
                  </Text>
                )}
              </Animated.View>

              {/* Info Cards - View Mode */}
              {!isEditing && (
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
              )}

              {/* Edit Mode Fields */}
              {isEditing && (
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  style={styles.editSection}
                >
                  {/* Date of Birth */}
                  <TouchableOpacity
                    style={styles.editCard}
                    onPress={() => {
                      setShowDatePicker(!showDatePicker);
                      setShowTimePicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.editCardHeader}>
                      <View style={styles.infoIcon}>
                        <Ionicons name="calendar" size={24} color={Colors.celestialGold} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                        <Text style={styles.infoValue}>
                          {formatDateLong(editDateOfBirth)}
                        </Text>
                      </View>
                      <Ionicons
                        name={showDatePicker ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={Colors.celestialGold}
                      />
                    </View>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <Animated.View
                      entering={FadeInDown.duration(300)}
                      style={styles.pickerContainer}
                    >
                      <DateWheelPicker
                        value={editDateOfBirth}
                        onChange={setEditDateOfBirth}
                      />
                    </Animated.View>
                  )}

                  {/* Time of Birth */}
                  <TouchableOpacity
                    style={styles.editCard}
                    onPress={() => {
                      setShowTimePicker(!showTimePicker);
                      setShowDatePicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.editCardHeader}>
                      <View style={styles.infoIcon}>
                        <Ionicons name="time" size={24} color={Colors.celestialGold} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Time of Birth</Text>
                        <Text style={styles.infoValue}>
                          {editTimeOfBirth || 'Tap to set'}
                        </Text>
                      </View>
                      <Ionicons
                        name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={Colors.celestialGold}
                      />
                    </View>
                  </TouchableOpacity>

                  {showTimePicker && (
                    <Animated.View
                      entering={FadeInDown.duration(300)}
                      style={styles.pickerContainer}
                    >
                      <TimeWheelPicker
                        value={editTimeOfBirth}
                        onChange={setEditTimeOfBirth}
                      />
                    </Animated.View>
                  )}

                  {/* Place of Birth */}
                  <View style={styles.editCard}>
                    <View style={styles.editCardHeader}>
                      <View style={styles.infoIcon}>
                        <Ionicons name="location" size={24} color={Colors.celestialGold} />
                      </View>
                      <View style={styles.placeInputContainer}>
                        <Text style={styles.infoLabel}>Place of Birth</Text>
                        <MysticalInput
                          value={editPlaceOfBirth}
                          onChangeText={setEditPlaceOfBirth}
                          placeholder="e.g., Los Angeles, CA"
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Deck of Destiny Section - Only show when not editing */}
              {!isEditing && (
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
              )}

              {/* Mystical Quote - Only show when not editing */}
              {!isEditing && (
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
              )}
            </ScrollView>
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
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerActions: {
    position: 'absolute',
    right: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
  },
  saveButton: {
    backgroundColor: 'rgba(221, 133, 216, 0.15)',
    borderColor: Colors.celestialGold,
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
  nameInputContainer: {
    width: '80%',
    maxWidth: 280,
    marginBottom: Spacing.sm,
  },
  zodiacSign: {
    fontSize: 16,
    color: Colors.celestialGold,
    fontFamily: 'System',
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
  },
  editSection: {
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
  editCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  editCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  placeInputContainer: {
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
  pickerContainer: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
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
