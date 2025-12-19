// Tarot Card Component with 3D Flip Animation
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image, ImageSource } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows, Spacing, Fonts } from '@/constants/theme';
import { TarotCard as TarotCardType } from '@/types';
import { hapticLight } from '@/utils/haptics';
import { getBundledAsset, cardBackAsset } from '@/assets/cards';

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
  isGenerating?: boolean;
}

export default function TarotCard({
  card,
  position,
  isRevealed,
  onPress,
  shortDescription,
  imageUri,
  isGenerating = false,
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

  // Resolve image source - handles both bundled assets and URI strings
  const resolveImageSource = (uri: string | null | undefined, cardId?: number): ImageSource | null => {
    if (!uri) return null;

    // Handle bundled assets (format: "bundled:{cardId}")
    if (uri.startsWith('bundled:')) {
      const id = cardId ?? parseInt(uri.split(':')[1], 10);
      const bundledAsset = getBundledAsset(id);
      // Cast to ImageSource since require() returns a valid image source
      return bundledAsset as ImageSource | null;
    }

    // Handle regular URIs
    return { uri };
  };

  // Render card back content - always use the bundled asset
  const renderCardBackContent = () => {
    return (
      <Image
        source={cardBackAsset as ImageSource}
        style={styles.cardBackImage}
        contentFit="cover"
      />
    );
  };

  // Render card front content
  const renderCardFrontContent = () => {
    if (isGenerating) {
      return (
        <View style={styles.cardImagePlaceholder}>
          <ActivityIndicator size="small" color={Colors.celestialGold} />
          <Text style={styles.generatingText}>Creating...</Text>
        </View>
      );
    }

    // Resolve image source (handles bundled assets and URIs)
    const source = resolveImageSource(imageUri, card.id);

    if (source) {
      return (
        <Image
          source={source}
          style={styles.cardImage}
          contentFit="cover"
          transition={300}
        />
      );
    }

    // Placeholder for non-generated cards
    return (
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardSymbol}>
          {card.arcana === 'major' ? '\u2605' : '\u2726'}
        </Text>
      </View>
    );
  };

  const handlePress = () => {
    hapticLight();
    onPress();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={isRevealed}
        style={styles.cardContainer}
      >
        {/* Card Back (Face Down) */}
        <Animated.View style={[styles.card, styles.cardBack, frontAnimatedStyle]}>
          {renderCardBackContent()}
        </Animated.View>

        {/* Card Front (Face Up) */}
        <Animated.View style={[styles.card, styles.cardFront, backAnimatedStyle]}>
          <LinearGradient
            colors={['#2D2418', '#1A1408', '#2D2418']}
            style={styles.cardFrontGradient}
          >
            <View style={styles.cardFrontBorder}>
              {renderCardFrontContent()}
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
        <Text style={styles.description} numberOfLines={6}>
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
  cardBackImage: {
    flex: 1,
    borderRadius: BorderRadius.lg,
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
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSymbol: {
    fontSize: 40,
    color: Colors.celestialGold,
    opacity: 0.6,
  },
  generatingText: {
    color: Colors.celestialGold,
    fontSize: 8,
    marginTop: 4,
    opacity: 0.8,
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
    fontFamily: Fonts.body,
    textAlign: 'center',
    fontWeight: '600',
  },
  positionLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: Fonts.heading,
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
    paddingHorizontal: 2,
    lineHeight: 14,
    maxWidth: CARD_WIDTH + 30,
  },
});
