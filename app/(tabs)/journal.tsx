// Journal Screen - View Past Daily Readings
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';
import GradientBackground from '@/components/GradientBackground';
import FormattedText from '@/components/FormattedText';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { getReadingHistory } from '@/utils/storage';
import { getCardImageUri, resolveCardImageSource } from '@/utils/imageStorage';
import { formatDateLong } from '@/utils/formatDate';
import { DailyReading, CardReading } from '@/types';

const { width } = Dimensions.get('window');
const MINI_CARD_SIZE = 50;
const DETAIL_CARD_WIDTH = (width - 100) / 3;
const DETAIL_CARD_HEIGHT = DETAIL_CARD_WIDTH * 1.6;

export default function JournalScreen() {
  const [history, setHistory] = useState<DailyReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReading, setSelectedReading] = useState<DailyReading | null>(null);
  const [cardImages, setCardImages] = useState<Record<number, string | null>>({});

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const readings = await getReadingHistory();
      setHistory(readings);

      // Load card images for all readings
      const imageMap: Record<number, string | null> = {};
      for (const reading of readings) {
        for (const cardReading of reading.cards) {
          if (!imageMap[cardReading.card.id]) {
            const uri = await getCardImageUri(cardReading.card.id);
            imageMap[cardReading.card.id] = uri;
          }
        }
      }
      setCardImages(imageMap);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, []);

  const formatReadingDate = (dateStr: string): string => {
    // Convert YYYY-MM-DD to a Date object
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return formatDateLong(date);
  };

  const getExplanationPreview = (text: string): string => {
    // Get first 2 lines or ~100 characters
    const lines = text.split('\n').filter(line => line.trim());
    const preview = lines.slice(0, 2).join(' ');
    if (preview.length > 100) {
      return preview.substring(0, 97) + '...';
    }
    return preview + (lines.length > 2 ? '...' : '');
  };

  // Render mini card thumbnail
  const renderMiniCard = (cardReading: CardReading) => {
    const imageUri = cardImages[cardReading.card.id];
    const imageSource = resolveCardImageSource(cardReading.card.id, imageUri);

    return (
      <View key={cardReading.card.id} style={styles.miniCard}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.miniCardImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.miniCardPlaceholder}>
            <Text style={styles.miniCardSymbol}>
              {cardReading.card.arcana === 'major' ? '\u2605' : '\u2726'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render detail card for modal
  const renderDetailCard = (cardReading: CardReading) => {
    const imageUri = cardImages[cardReading.card.id];
    const imageSource = resolveCardImageSource(cardReading.card.id, imageUri);

    const positionLabel = {
      past: 'Past',
      present: 'Present',
      future: 'Future',
    };

    return (
      <View key={cardReading.card.id} style={styles.detailCardContainer}>
        <View style={styles.detailCard}>
          <LinearGradient
            colors={['#2D2418', '#1A1408', '#2D2418']}
            style={styles.detailCardGradient}
          >
            <View style={styles.detailCardBorder}>
              {imageSource ? (
                <Image
                  source={imageSource}
                  style={styles.detailCardImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.detailCardPlaceholder}>
                  <Text style={styles.detailCardSymbol}>
                    {cardReading.card.arcana === 'major' ? '\u2605' : '\u2726'}
                  </Text>
                </View>
              )}
              <View style={styles.detailCardNameContainer}>
                <Text style={styles.detailCardName} numberOfLines={2}>
                  {cardReading.card.name}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        <Text style={styles.detailPositionLabel}>{positionLabel[cardReading.position]}</Text>
        {cardReading.shortDescription && (
          <Text style={styles.detailDescription} numberOfLines={4}>
            {cardReading.shortDescription}
          </Text>
        )}
      </View>
    );
  };

  // Render history list item
  const renderHistoryItem = ({ item, index }: { item: DailyReading; index: number }) => {
    return (
      <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
        <TouchableOpacity
          style={styles.historyItem}
          onPress={() => setSelectedReading(item)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(221, 133, 216, 0.08)', 'rgba(221, 133, 216, 0.02)']}
            style={styles.historyItemGradient}
          >
            {/* Date */}
            <Text style={styles.historyDate}>{formatReadingDate(item.date)}</Text>

            {/* Mini Cards Row */}
            <View style={styles.miniCardsRow}>
              {item.cards.map(cardReading => renderMiniCard(cardReading))}
            </View>

            {/* Summary Preview */}
            <Text style={styles.historySummary} numberOfLines={2}>
              {getExplanationPreview(item.mainExplanation)}
            </Text>

            {/* Arrow indicator */}
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color={Colors.moonlightGray} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color={Colors.moonlightGray} />
      <Text style={styles.emptyTitle}>Your Journey Awaits</Text>
      <Text style={styles.emptyText}>
        Draw your first daily reading to begin your mystical journey.{'\n'}
        Each reading will be preserved here as a chronicle of your spiritual path.
      </Text>
    </Animated.View>
  );

  // Detail Modal
  const renderDetailModal = () => {
    if (!selectedReading) return null;

    return (
      <Modal
        visible={!!selectedReading}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedReading(null)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.modalContent}
          >
            <GradientBackground>
              <SafeAreaView style={styles.modalSafeArea}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedReading(null)}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={28} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {formatReadingDate(selectedReading.date)}
                  </Text>
                  <View style={{ width: 28 }} />
                </View>

                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Cards Row */}
                  <View style={styles.detailCardsRow}>
                    {selectedReading.cards.map(cardReading => renderDetailCard(cardReading))}
                  </View>

                  {/* Full Explanation */}
                  <View style={styles.explanationContainer}>
                    <LinearGradient
                      colors={['rgba(221, 133, 216, 0.12)', 'rgba(221, 133, 216, 0.04)']}
                      style={styles.explanationGradient}
                    >
                      <Text style={styles.explanationTitle}>
                        Explanation for the Day
                      </Text>
                      <FormattedText
                        text={selectedReading.mainExplanation}
                        baseStyle={styles.explanationText}
                      />
                    </LinearGradient>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </GradientBackground>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.celestialGold} />
          <Text style={styles.loadingText}>Loading your journey...</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.title}>Your Journey</Text>
          <Text style={styles.subtitle}>
            {history.length > 0
              ? `${history.length} reading${history.length === 1 ? '' : 's'} recorded`
              : 'Begin your mystical chronicle'}
          </Text>
        </Animated.View>

        {/* History List */}
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.celestialGold}
            />
          }
        />

        {/* Detail Modal */}
        {renderDetailModal()}
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
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontFamily: 'System',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  historyItem: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  historyItemGradient: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.2)',
    borderRadius: BorderRadius.lg,
    position: 'relative',
  },
  historyDate: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
    marginBottom: Spacing.sm,
  },
  miniCardsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  miniCard: {
    width: MINI_CARD_SIZE,
    height: MINI_CARD_SIZE * 1.4,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.celestialGold,
  },
  miniCardImage: {
    flex: 1,
  },
  miniCardPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardSymbol: {
    fontSize: 18,
    color: Colors.celestialGold,
    opacity: 0.6,
  },
  historySummary: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'System',
    lineHeight: 20,
    paddingRight: Spacing.xl,
  },
  arrowContainer: {
    position: 'absolute',
    right: Spacing.lg,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 24,
    fontFamily: 'System',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: Spacing.xxl,
  },
  detailCardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  detailCardContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  detailCard: {
    width: DETAIL_CARD_WIDTH,
    height: DETAIL_CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  detailCardGradient: {
    flex: 1,
    padding: 2,
    borderRadius: BorderRadius.lg,
  },
  detailCardBorder: {
    flex: 1,
    borderRadius: BorderRadius.lg - 2,
    borderWidth: 1,
    borderColor: Colors.celestialGold,
    overflow: 'hidden',
  },
  detailCardImage: {
    flex: 1,
    borderRadius: BorderRadius.lg - 4,
  },
  detailCardPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(221, 133, 216, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCardSymbol: {
    fontSize: 32,
    color: Colors.celestialGold,
    opacity: 0.6,
  },
  detailCardNameContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.lg - 4,
    borderBottomRightRadius: BorderRadius.lg - 4,
  },
  detailCardName: {
    color: Colors.celestialGold,
    fontSize: 10,
    fontFamily: 'serif',
    textAlign: 'center',
    fontWeight: '600',
  },
  detailPositionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'serif',
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailDescription: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'System',
    marginTop: Spacing.xs,
    textAlign: 'center',
    paddingHorizontal: 2,
    lineHeight: 14,
    maxWidth: DETAIL_CARD_WIDTH + 30,
  },
  explanationContainer: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.md,
  },
  explanationGradient: {
    borderRadius: BorderRadius.lg + 4,
    borderWidth: 1,
    borderColor: 'rgba(221, 133, 216, 0.25)',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg + 4,
  },
  explanationTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'serif',
    color: Colors.celestialGold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: 'System',
    lineHeight: 26,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
});
