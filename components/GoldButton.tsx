// Gold Styled Button Component
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Fonts } from '@/constants/theme';
import { hapticMedium } from '@/utils/haptics';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function GoldButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'filled',
  style,
  icon,
}: Props) {
  const handlePress = () => {
    hapticMedium();
    onPress();
  };

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[styles.outlineButton, disabled && styles.disabled, style]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.celestialGold} />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <Ionicons name={icon} size={20} color={Colors.celestialGold} style={styles.icon} />}
            <Text style={styles.outlineText}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={['#DD85D8', '#C06DC0', '#DD85D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.filledButton}
      >
        {loading ? (
          <ActivityIndicator color={Colors.deepMidnightBlue} />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <Ionicons name={icon} size={20} color={Colors.deepMidnightBlue} style={styles.icon} />}
            <Text style={styles.filledText}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filledButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  filledText: {
    color: Colors.deepMidnightBlue,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
  outlineButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.celestialGold,
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  outlineText: {
    color: Colors.celestialGold,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
});
