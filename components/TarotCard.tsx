// Tarot Card Component with 3D Flip Animation
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { TarotCard as TarotCardType } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 80) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.6;

interface Props {
  card: TarotCardType;
  position: 'past' | 'present' | 'future';
  isRevealed: boolean;
  onPress: () => void;
  shortDescription?: string;
  imageUri?: string | null;
}

export default function TarotCard({
  card,
  position,
  isRevealed,
  onPress,
  shortDescription,
  imageUri,
}: Props) {
  const flipProgress = useSharedValue(isRevealed ? 1 : 0);

  React.useEffect(() => {
    flipProgress.value = withTiming(isRevealed ? 1 : 0, {
      duration: 600,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
  }, [isRevealed, flipProgress]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity: interpolate(flipProgress.value, [0, 0.5, 0.5, 1], [1, 1, 0, 0]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity: interpolate(flipProgress.value, [0, 0.5, 0.5, 1], [0, 0, 1, 1]),
    };
  });

  const positionLabel = {
    past: 'Past',
    present: 'Present',
    future: 'Future',
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        disabled={isRevealed}
        style={styles.cardContainer}
      >
        {/* Card Back (Face Down) */}
        <Animated.View style={[styles.card, styles.cardBack, frontAnimatedStyle]}>
          <LinearGradient
            colors={['#1A1F2E', '#0B0F19', '#1A1F2E']}
            style={styles.cardBackGradient}
          >
            <View style={styles.cardBackBorder}>
              <View style={styles.cardBackInner}>
                {/* Moon symbol */}
                <View style={styles.moonContainer}>
                  <View style={styles.moon}>
                    <View style={styles.moonCrescent} />
                  </View>
                  <View style={styles.starsSmall}>
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.smallStar,
                          {
                            left: Math.random() * 60 - 30,
                            top: Math.random() * 60 - 30,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                {/* Decorative pattern */}
                <View style={styles.decorativePattern}>
                  <View style={styles.patternLine} />
                  <View style={styles.patternDiamond} />
                  <View style={styles.patternLine} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Card Front (Face Up) */}
        <Animated.View style={[styles.card, styles.cardFront, backAnimatedStyle]}>
          <LinearGradient
            colors={['#2D2418', '#1A1408', '#2D2418']}
            style={styles.cardFrontGradient}
          >
            <View style={styles.cardFrontBorder}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={styles.cardSymbol}>
                    {card.arcana === 'major' ? '\u2605' : '\u2726'}
                  </Text>
                </View>
              )}
              <View style={styles.cardNameContainer}>
                <Text style={styles.cardName} numberOfLines={2}>
                  {card.name}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Position Label */}
      <Text style={styles.positionLabel}>{positionLabel[position]}</Text>

      {/* Description (shown when revealed) */}
      {isRevealed && shortDescription && (
        <Text style={styles.description} numberOfLines={3}>
          {shortDescription}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    backfaceVisibility: 'hidden',
    ...Shadows.card,
  },
  cardBack: {
    zIndex: 2,
  },
  cardFront: {
    zIndex: 1,
  },
  cardBackGradient: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: 3,
  },
  cardBackBorder: {
    flex: 1,
    borderRadius: BorderRadius.lg - 2,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    padding: 4,
  },
  cardBackInner: {
    flex: 1,
    borderRadius: BorderRadius.lg - 4,
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  moon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.celestialGold,
    opacity: 0.9,
    position: 'relative',
  },
  moonCrescent: {
    position: 'absolute',
    width: 28,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#0B0F19',
    right: -6,
    top: 0,
  },
  starsSmall: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  smallStar: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.celestialGold,
    opacity: 0.6,
  },
  decorativePattern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  patternLine: {
    width: 15,
    height: 1,
    backgroundColor: Colors.celestialGold,
    opacity: 0.5,
  },
  patternDiamond: {
    width: 8,
    height: 8,
    backgroundColor: Colors.celestialGold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 6,
    opacity: 0.7,
  },
  cardFrontGradient: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: 2,
  },
  cardFrontBorder: {
    flex: 1,
    borderRadius: BorderRadius.lg - 2,
    borderWidth: 1,
    borderColor: Colors.celestialGold,
    overflow: 'hidden',
  },
  cardImage: {
    flex: 1,
    borderRadius: BorderRadius.lg - 4,
  },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSymbol: {
    fontSize: 40,
    color: Colors.celestialGold,
    opacity: 0.6,
  },
  cardNameContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.lg - 4,
    borderBottomRightRadius: BorderRadius.lg - 4,
  },
  cardName: {
    color: Colors.celestialGold,
    fontSize: 10,
    fontFamily: 'serif',
    textAlign: 'center',
    fontWeight: '600',
  },
  positionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'serif',
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'System',
    marginTop: Spacing.xs,
    textAlign: 'center',
    paddingHorizontal: Spacing.xs,
    lineHeight: 14,
    maxWidth: CARD_WIDTH + 20,
  },
});
