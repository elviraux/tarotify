/**
 * Pre-bundled Tarot Card Assets
 *
 * All 78 cards are pre-bundled for instant loading and consistent artwork.
 *
 * PRIORITY ORDER:
 * ---------------
 * 1. Bundled assets (this file) - instant load
 * 2. Filesystem (user-generated at runtime)
 * 3. AI generation (on-demand fallback)
 */

export type CardAssetMap = {
  [cardId: number]: ReturnType<typeof require> | null;
};

// Card back image (bundled)
export const cardBackAsset: ReturnType<typeof require> = require('./back.png');

/**
 * Complete 78-Card Tarot Deck Assets
 *
 * Card ID Reference:
 * - 0-21: Major Arcana (The Fool through The World)
 * - 22-35: Wands (Ace through King)
 * - 36-49: Cups (Ace through King)
 * - 50-63: Swords (Ace through King)
 * - 64-77: Pentacles (Ace through King)
 */
export const cardAssets: CardAssetMap = {
  // === MAJOR ARCANA (0-21) ===
  0: require('./0_fool.png'), // The Fool
  1: require('./1_magician.png'), // The Magician
  2: require('./2_high_priestess.png'), // The High Priestess
  3: require('./3_empress.png'), // The Empress
  4: require('./4_emperor.png'), // The Emperor
  5: require('./5_hierophant.png'), // The Hierophant
  6: require('./6_lovers.png'), // The Lovers
  7: require('./7_chariot.png'), // The Chariot
  8: require('./8_strength.png'), // Strength
  9: require('./9_hermit.png'), // The Hermit
  10: require('./10_wheel_of_fortune.png'), // Wheel of Fortune
  11: require('./11_justice.png'), // Justice
  12: require('./12_hanged_man.png'), // The Hanged Man
  13: require('./13_death.png'), // Death
  14: require('./14_temperance.png'), // Temperance
  15: require('./15_devil.png'), // The Devil
  16: require('./16_tower.png'), // The Tower
  17: require('./17_star.png'), // The Star
  18: require('./18_moon.png'), // The Moon
  19: require('./19_sun.png'), // The Sun
  20: require('./20_judgement.png'), // Judgement
  21: require('./21_world.png'), // The World

  // === MINOR ARCANA - WANDS (22-35) ===
  22: require('./22_ace_of_wands.png'), // Ace of Wands
  23: require('./23_two_of_wands.png'), // Two of Wands
  24: require('./24_three_of_wands.png'), // Three of Wands
  25: require('./25_four_of_wands.png'), // Four of Wands
  26: require('./26_five_of_wands.png'), // Five of Wands
  27: require('./27_six_of_wands.png'), // Six of Wands
  28: require('./28_seven_of_wands.png'), // Seven of Wands
  29: require('./29_eight_of_wands.png'), // Eight of Wands
  30: require('./30_nine_of_wands.png'), // Nine of Wands
  31: require('./31_ten_of_wands.png'), // Ten of Wands
  32: require('./32_page_of_wands.png'), // Page of Wands
  33: require('./33_knight_of_wands.png'), // Knight of Wands
  34: require('./34_queen_of_wands.png'), // Queen of Wands
  35: require('./35_king_of_wands.png'), // King of Wands

  // === MINOR ARCANA - CUPS (36-49) ===
  36: require('./36_ace_of_cups.png'), // Ace of Cups
  37: require('./37_two_of_cups.png'), // Two of Cups
  38: require('./38_three_of_cups.png'), // Three of Cups
  39: require('./39_four_of_cups.png'), // Four of Cups
  40: require('./40_five_of_cups.png'), // Five of Cups
  41: require('./41_six_of_cups.png'), // Six of Cups
  42: require('./42_seven_of_cups.png'), // Seven of Cups
  43: require('./43_eight_of_cups.png'), // Eight of Cups
  44: require('./44_nine_of_cups.png'), // Nine of Cups
  45: require('./45_ten_of_cups.png'), // Ten of Cups
  46: require('./46_page_of_cups.png'), // Page of Cups
  47: require('./47_knight_of_cups.png'), // Knight of Cups
  48: require('./48_queen_of_cups.png'), // Queen of Cups
  49: require('./49_king_of_cups.png'), // King of Cups

  // === MINOR ARCANA - SWORDS (50-63) ===
  50: require('./50_ace_of_swords.png'), // Ace of Swords
  51: require('./51_two_of_swords.png'), // Two of Swords
  52: require('./52_three_of_swords.png'), // Three of Swords
  53: require('./53_four_of_swords.png'), // Four of Swords
  54: require('./54_five_of_swords.png'), // Five of Swords
  55: require('./55_six_of_swords.png'), // Six of Swords
  56: require('./56_seven_of_swords.png'), // Seven of Swords
  57: require('./57_eight_of_swords.png'), // Eight of Swords
  58: require('./58_nine_of_swords.png'), // Nine of Swords
  59: require('./59_ten_of_swords.png'), // Ten of Swords
  60: require('./60_page_of_swords.png'), // Page of Swords
  61: require('./61_knight_of_swords.png'), // Knight of Swords
  62: require('./62_queen_of_swords.png'), // Queen of Swords
  63: require('./63_king_of_swords.png'), // King of Swords

  // === MINOR ARCANA - PENTACLES (64-77) ===
  64: require('./64_ace_of_pentacles.png'), // Ace of Pentacles
  65: require('./65_two_of_pentacles.png'), // Two of Pentacles
  66: require('./66_three_of_pentacles.png'), // Three of Pentacles
  67: require('./67_four_of_pentacles.png'), // Four of Pentacles
  68: require('./68_five_of_pentacles.png'), // Five of Pentacles
  69: require('./69_six_of_pentacles.png'), // Six of Pentacles
  70: require('./70_seven_of_pentacles.png'), // Seven of Pentacles
  71: require('./71_eight_of_pentacles.png'), // Eight of Pentacles
  72: require('./72_nine_of_pentacles.png'), // Nine of Pentacles
  73: require('./73_ten_of_pentacles.png'), // Ten of Pentacles
  74: require('./74_page_of_pentacles.png'), // Page of Pentacles
  75: require('./75_knight_of_pentacles.png'), // Knight of Pentacles
  76: require('./76_queen_of_pentacles.png'), // Queen of Pentacles
  77: require('./77_king_of_pentacles.png'), // King of Pentacles
};

/**
 * Check if a card has a bundled asset available
 */
export const hasBundledAsset = (cardId: number): boolean => {
  return cardId in cardAssets && cardAssets[cardId] !== null;
};

/**
 * Get the bundled asset for a card
 * Returns null if the card isn't bundled
 */
export const getBundledAsset = (cardId: number): ReturnType<typeof require> | null => {
  return cardAssets[cardId] ?? null;
};

/**
 * Get count of cards that have bundled assets
 */
export const getBundledCardCount = (): number => {
  return Object.values(cardAssets).filter(asset => asset !== null).length;
};

/**
 * Check if the card back is bundled (always true with bundled assets)
 */
export const hasCardBackAsset = (): boolean => {
  return true;
};

// Total cards in a standard tarot deck
export const TOTAL_CARDS = 78;
