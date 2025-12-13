// Deck Gallery Screen - View all 78 tarot cards and their generated art
import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';
import GradientBackground from '@/components/GradientBackground';
import GoldButton from '@/components/GoldButton';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { tarotDeck, getMajorArcana, getMinorArcana } from '@/data/tarotDeck';
import { TarotCard } from '@/types';
import { getCardImageUri, getGeneratedCardIds } from '@/utils/imageStorage';
import { generateCardImage } from '@/services/cardImageService';

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
}

const CardItem = ({ card, imageUri, isGenerating, onPress, onGenerate }: CardItemProps) => {
  const hasImage = !!imageUri;

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
          {hasImage ? (
            <Image
              source={{ uri: imageUri }}
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

export default function DeckGalleryScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [cardImages, setCardImages] = useState<Record<number, string | null>>({});
  const [generatingCardIds, setGeneratingCardIds] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 78, generated: 0 });

  // Load existing card images
  useEffect(() => {
    loadCardImages();
  }, []);

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
    if (generatingCardIds.has(card.id) || cardImages[card.id]) return;

    setGeneratingCardIds(prev => new Set(prev).add(card.id));

    try {
      const uri = await generateCardImage(card);
      if (uri) {
        setCardImages(prev => ({ ...prev, [card.id]: uri }));
        setStats(prev => ({ ...prev, generated: prev.generated + 1 }));
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
          >
            <Ionicons name="chevron-back" size={28} color={Colors.celestialGold} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Deck of Destiny</Text>
            <Text style={styles.subtitle}>
              {stats.generated} of {stats.total} cards revealed
            </Text>
          </View>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Progress Bar */}
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
                      source={{ uri: cardImages[selectedCard.id]! }}
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

                  {selectedCard && !cardImages[selectedCard.id] && (
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
    fontFamily: 'serif',
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
  headerRight: {
    width: 44,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'serif',
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
    fontFamily: 'serif',
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
    fontFamily: 'serif',
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
    fontFamily: 'serif',
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
    fontFamily: 'serif',
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
