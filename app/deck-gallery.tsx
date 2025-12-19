// Deck Gallery Screen - View all 78 tarot cards and their generated art
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown } from 'react-native-reanimated';
import GradientBackground from '@/components/GradientBackground';
import GoldButton from '@/components/GoldButton';
import { Colors, Spacing, BorderRadius, Shadows, Fonts } from '@/constants/theme';
import { tarotDeck, getMajorArcana, getMinorArcana } from '@/data/tarotDeck';
import { TarotCard } from '@/types';
import { getCardImageUri, getGeneratedCardIds, resolveCardImageSource } from '@/utils/imageStorage';
import { generateCardImage, manifestFullDeck, getMissingCardsCount } from '@/services/cardImageService';
import { hapticSuccess, hapticLight } from '@/utils/haptics';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = 3;
const CARD_WIDTH = (width - Spacing.lg * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

type FilterType = 'all' | 'major' | 'minor' | 'generated';

interface CardItemProps {
  card: TarotCard;
  imageUri: string | null;
  isGenerating: boolean;
  onPress: () => void;
  onGenerate: () => void;
  disableGenerate?: boolean;
}

const CardItem = ({ card, imageUri, isGenerating, onPress, onGenerate, disableGenerate }: CardItemProps) => {
  const hasImage = !!imageUri;
  // Resolve the image source (handles both bundled and filesystem URIs)
  const imageSource = resolveCardImageSource(card.id, imageUri);

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.cardItem}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={hasImage ? ['#2D2418', '#1A1408'] : ['#1A1F2E', '#0B0F19']}
          style={styles.cardGradient}
        >
          {hasImage && imageSource ? (
            <Image
              source={imageSource}
              style={styles.cardImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              {isGenerating ? (
                <ActivityIndicator size="small" color={Colors.celestialGold} />
              ) : (
                <>
                  <Text style={styles.placeholderSymbol}>
                    {card.arcana === 'major' ? '\u2605' : '\u2726'}
                  </Text>
                  {!disableGenerate && (
                    <TouchableOpacity
                      style={styles.generateButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        onGenerate();
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="sparkles" size={14} color={Colors.celestialGold} />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
          <View style={styles.cardNameOverlay}>
            <Text style={styles.cardName} numberOfLines={2}>
              {card.name}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Manifestation state interface
interface ManifestationState {
  isActive: boolean;
  current: number;
  total: number;
  currentCardName: string;
  successCount: number;
  failedCount: number;
}

export default function DeckGalleryScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [cardImages, setCardImages] = useState<Record<number, string | null>>({});
  const [generatingCardIds, setGeneratingCardIds] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 78, generated: 0 });

  // Manifestation state
  const [manifestation, setManifestation] = useState<ManifestationState>({
    isActive: false,
    current: 0,
    total: 0,
    currentCardName: '',
    successCount: 0,
    failedCount: 0,
  });
  const [missingCount, setMissingCount] = useState(0);
  const cancelManifestRef = useRef(false);

  // Load existing card images
  useEffect(() => {
    loadCardImages();
  }, []);

  // Update missing count when card images change
  useEffect(() => {
    const updateMissingCount = async () => {
      const count = await getMissingCardsCount(tarotDeck);
      setMissingCount(count);
    };
    updateMissingCount();
  }, [cardImages]);

  const loadCardImages = async () => {
    setIsLoading(true);
    try {
      const generatedIds = await getGeneratedCardIds();
      const images: Record<number, string | null> = {};

      for (const id of generatedIds) {
        const uri = await getCardImageUri(id);
        if (uri) {
          images[id] = uri;
        }
      }

      setCardImages(images);
      setStats({ total: 78, generated: Object.keys(images).length });
    } catch (error) {
      console.error('Error loading card images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredCards = useCallback(() => {
    switch (filter) {
      case 'major':
        return getMajorArcana();
      case 'minor':
        return getMinorArcana();
      case 'generated':
        return tarotDeck.filter(card => !!cardImages[card.id]);
      default:
        return tarotDeck;
    }
  }, [filter, cardImages]);

  const handleGenerateCard = async (card: TarotCard) => {
    // Don't allow individual generation during manifestation
    if (manifestation.isActive) return;
    if (generatingCardIds.has(card.id) || cardImages[card.id]) return;

    setGeneratingCardIds(prev => new Set(prev).add(card.id));

    try {
      const uri = await generateCardImage(card);
      if (uri) {
        setCardImages(prev => ({ ...prev, [card.id]: uri }));
        setStats(prev => ({ ...prev, generated: prev.generated + 1 }));
        // Trigger success haptic when card is revealed
        hapticSuccess();
      }
    } catch (error) {
      console.error(`Error generating image for ${card.name}:`, error);
    } finally {
      setGeneratingCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(card.id);
        return newSet;
      });
    }
  };

  // Start the full deck manifestation
  const handleStartManifestation = async () => {
    if (manifestation.isActive) return;

    if (missingCount === 0) {
      Alert.alert(
        'Deck Complete',
        'All 78 cards have already been revealed! Your Deck of Destiny is complete.',
        [{ text: 'Wonderful', style: 'default' }]
      );
      return;
    }

    // Confirm before starting
    Alert.alert(
      'Manifest Full Deck',
      `This will reveal ${missingCount} remaining cards. This may take a while and uses AI generation for each card.\n\nContinue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Begin Manifestation',
          style: 'default',
          onPress: startManifestation,
        },
      ]
    );
  };

  const startManifestation = async () => {
    cancelManifestRef.current = false;

    setManifestation({
      isActive: true,
      current: 0,
      total: missingCount,
      currentCardName: 'Preparing...',
      successCount: 0,
      failedCount: 0,
    });

    try {
      await manifestFullDeck(tarotDeck, {
        onStart: (totalMissing) => {
          setManifestation(prev => ({
            ...prev,
            total: totalMissing,
          }));
        },
        onProgress: (current, total, cardName) => {
          setManifestation(prev => ({
            ...prev,
            current,
            total,
            currentCardName: cardName,
          }));
        },
        onCardComplete: (cardId, uri, success) => {
          if (success && uri) {
            setCardImages(prev => ({ ...prev, [cardId]: uri }));
            setStats(prev => ({ ...prev, generated: prev.generated + 1 }));
            setManifestation(prev => ({
              ...prev,
              successCount: prev.successCount + 1,
            }));
            // Light haptic for each card revealed during manifestation
            hapticLight();
          } else {
            setManifestation(prev => ({
              ...prev,
              failedCount: prev.failedCount + 1,
            }));
          }
        },
        onComplete: (successCount, failedCount) => {
          setManifestation(prev => ({
            ...prev,
            isActive: false,
            currentCardName: 'Complete',
          }));

          // Trigger success haptic when manifestation completes
          hapticSuccess();

          const message = failedCount > 0
            ? `Successfully revealed ${successCount} cards. ${failedCount} cards could not be generated and can be tried again later.`
            : `Successfully revealed all ${successCount} cards! Your Deck of Destiny grows stronger.`;

          Alert.alert(
            'Manifestation Complete',
            message,
            [{ text: 'Wonderful', style: 'default' }]
          );
        },
        onError: (error, cardName) => {
          console.error(`Error manifesting ${cardName}:`, error);
        },
        shouldCancel: () => cancelManifestRef.current,
      });
    } catch (error) {
      console.error('Manifestation error:', error);
      setManifestation(prev => ({ ...prev, isActive: false }));
      Alert.alert(
        'Manifestation Interrupted',
        'The manifestation was interrupted. You can try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelManifestation = () => {
    Alert.alert(
      'Cancel Manifestation',
      'Are you sure you want to stop the manifestation? Progress so far will be saved.',
      [
        { text: 'Continue Manifesting', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            cancelManifestRef.current = true;
          },
        },
      ]
    );
  };

  const handleCardPress = (card: TarotCard) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  const filteredCards = getFilteredCards();

  const renderFilterButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === type && styles.filterButtonActive]}
      onPress={() => setFilter(type)}
    >
      <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCard = ({ item }: { item: TarotCard }) => (
    <CardItem
      card={item}
      imageUri={cardImages[item.id] || null}
      isGenerating={generatingCardIds.has(item.id)}
      onPress={() => handleCardPress(item)}
      onGenerate={() => handleGenerateCard(item)}
      disableGenerate={manifestation.isActive}
    />
  );

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.celestialGold} />
          <Text style={styles.loadingText}>Loading your deck...</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={manifestation.isActive}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={manifestation.isActive ? Colors.moonlightGray : Colors.celestialGold}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Deck of Destiny</Text>
            <Text style={styles.subtitle}>
              {stats.generated} of {stats.total} cards revealed
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.manifestButton,
              manifestation.isActive && styles.manifestButtonActive,
            ]}
            onPress={handleStartManifestation}
            disabled={manifestation.isActive || missingCount === 0}
          >
            <Ionicons
              name="sparkles"
              size={22}
              color={missingCount === 0 ? Colors.moonlightGray : Colors.celestialGold}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Bar / Manifestation Progress */}
        {manifestation.isActive ? (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.manifestationContainer}
          >
            <LinearGradient
              colors={['rgba(221, 133, 216, 0.15)', 'rgba(221, 133, 216, 0.05)']}
              style={styles.manifestationGradient}
            >
              <View style={styles.manifestationHeader}>
                <View style={styles.manifestationIconContainer}>
                  <ActivityIndicator size="small" color={Colors.celestialGold} />
                </View>
                <View style={styles.manifestationInfo}>
                  <Text style={styles.manifestationTitle}>Manifestation in Progress</Text>
                  <Text style={styles.manifestationSubtitle}>
                    Divining card {manifestation.current} of {manifestation.total}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.manifestationCancelButton}
                  onPress={handleCancelManifestation}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.moonlightGray} />
                </TouchableOpacity>
              </View>
              <Text style={styles.manifestationCardName} numberOfLines={1}>
                {manifestation.currentCardName}...
              </Text>
              <View style={styles.manifestationProgressBar}>
                <Animated.View
                  style={[
                    styles.manifestationProgressFill,
                    { width: `${manifestation.total > 0 ? (manifestation.current / manifestation.total) * 100 : 0}%` }
                  ]}
                />
              </View>
              <View style={styles.manifestationStats}>
                <Text style={styles.manifestationStatText}>
                  <Text style={styles.manifestationStatSuccess}>{manifestation.successCount}</Text> revealed
                </Text>
                {manifestation.failedCount > 0 && (
                  <Text style={styles.manifestationStatText}>
                    <Text style={styles.manifestationStatFailed}>{manifestation.failedCount}</Text> failed
                  </Text>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        ) : (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${(stats.generated / stats.total) * 100}%` }
                ]}
              />
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('major', 'Major')}
          {renderFilterButton('minor', 'Minor')}
          {renderFilterButton('generated', 'Revealed')}
        </View>

        {/* Cards Grid */}
        <FlatList
          data={filteredCards}
          renderItem={renderCard}
          keyExtractor={(item) => `card-${item.id}`}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {filter === 'generated'
                  ? 'No cards have been revealed yet.\nDraw your daily reading to reveal cards!'
                  : 'No cards found.'}
              </Text>
            </View>
          }
        />

        {/* Card Detail Modal */}
        <Modal
          visible={!!selectedCard}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.modalContent}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <LinearGradient
                  colors={['#1A1F2E', '#0B0F19', '#1A1F2E']}
                  style={styles.modalCard}
                >
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={closeModal}
                  >
                    <Ionicons name="close" size={24} color={Colors.celestialGold} />
                  </TouchableOpacity>

                  {selectedCard && cardImages[selectedCard.id] ? (
                    <Image
                      source={resolveCardImageSource(selectedCard.id, cardImages[selectedCard.id]) || undefined}
                      style={styles.modalImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.modalPlaceholder}>
                      <Text style={styles.modalPlaceholderSymbol}>
                        {selectedCard?.arcana === 'major' ? '\u2605' : '\u2726'}
                      </Text>
                      <Text style={styles.modalPlaceholderText}>
                        This card has not been revealed yet
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalInfo}>
                    <Text style={styles.modalCardName}>{selectedCard?.name}</Text>
                    <Text style={styles.modalCardType}>
                      {selectedCard?.arcana === 'major'
                        ? 'Major Arcana'
                        : `Minor Arcana - ${selectedCard?.suit}`}
                    </Text>
                    <Text style={styles.modalKeywords}>
                      {selectedCard?.keywords.join(' \u2022 ')}
                    </Text>
                  </View>

                  {selectedCard && !cardImages[selectedCard.id] && !manifestation.isActive && (
                    <View style={styles.modalActions}>
                      <GoldButton
                        title={generatingCardIds.has(selectedCard.id) ? 'Generating...' : 'Reveal This Card'}
                        onPress={() => handleGenerateCard(selectedCard)}
                        loading={generatingCardIds.has(selectedCard.id)}
                        disabled={generatingCardIds.has(selectedCard.id)}
                      />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
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
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: Fonts.heading,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  manifestButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  manifestButtonActive: {
    opacity: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Fonts.heading,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(221, 133, 216, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.celestialGold,
    borderRadius: 2,
  },
  // Manifestation styles
  manifestationContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  manifestationGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  manifestationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manifestationIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  manifestationInfo: {
    flex: 1,
  },
  manifestationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.celestialGold,
    fontFamily: Fonts.heading,
  },
  manifestationSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  manifestationCancelButton: {
    padding: Spacing.xs,
  },
  manifestationCardName: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingLeft: 40,
  },
  manifestationProgressBar: {
    height: 6,
    backgroundColor: 'rgba(221, 133, 216, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  manifestationProgressFill: {
    height: '100%',
    backgroundColor: Colors.celestialGold,
    borderRadius: 3,
  },
  manifestationStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  manifestationStatText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  manifestationStatSuccess: {
    color: '#4ADE80',
    fontWeight: '600',
  },
  manifestationStatFailed: {
    color: '#F87171',
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(221, 133, 216, 0.2)',
    borderColor: Colors.celestialGold,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.celestialGold,
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  cardItem: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
  },
  cardTouchable: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  cardGradient: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.3)',
  },
  cardImage: {
    flex: 1,
    borderRadius: BorderRadius.md - 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderSymbol: {
    fontSize: 32,
    color: Colors.celestialGold,
    opacity: 0.4,
  },
  generateButton: {
    position: 'absolute',
    bottom: 28,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(221, 133, 216, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.4)',
  },
  cardNameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomLeftRadius: BorderRadius.md - 1,
    borderBottomRightRadius: BorderRadius.md - 1,
  },
  cardName: {
    fontSize: 9,
    color: Colors.celestialGold,
    textAlign: 'center',
    fontFamily: Fonts.heading,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.heading,
    lineHeight: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: '85%',
  },
  modalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.celestialGold,
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    aspectRatio: 2/3,
    borderTopLeftRadius: BorderRadius.lg - 2,
    borderTopRightRadius: BorderRadius.lg - 2,
  },
  modalPlaceholder: {
    width: '100%',
    aspectRatio: 2/3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(221, 133, 216, 0.05)',
  },
  modalPlaceholderSymbol: {
    fontSize: 60,
    color: Colors.celestialGold,
    opacity: 0.4,
    marginBottom: Spacing.md,
  },
  modalPlaceholderText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalInfo: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  modalCardName: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Fonts.heading,
    color: Colors.celestialGold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalCardType: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  modalKeywords: {
    fontSize: 12,
    color: Colors.moonlightGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalActions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
