// Mystical Input Component with Gold Border
import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Fonts } from '@/constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export default function MysticalInput({ label, error, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0.5);

  const handleFocus = () => {
    setIsFocused(true);
    borderOpacity.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0.5, { duration: 200 });
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(221, 133, 216, ${borderOpacity.value})`,
    shadowOpacity: borderOpacity.value * 0.3,
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <AnimatedView
        style={[
          styles.inputWrapper,
          animatedBorderStyle,
          isFocused && styles.focused,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.moonlightGray}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </AnimatedView>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.xs,
    fontFamily: Fonts.heading,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.inputBackground,
    shadowColor: Colors.celestialGold,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 3,
  },
  focused: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 18,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontFamily: 'System',
  },
  error: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
