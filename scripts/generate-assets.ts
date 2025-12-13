#!/usr/bin/env npx ts-node
/**
 * Tarot Card Asset Generation Script
 *
 * This script generates tarot card images for pre-bundling with the app.
 * Run this script during development/build time to generate assets.
 *
 * Usage:
 *   npx ts-node scripts/generate-assets.ts [options]
 *
 * Options:
 *   --all          Generate all 78 cards
 *   --major        Generate only Major Arcana (22 cards)
 *   --minor        Generate only Minor Arcana (56 cards)
 *   --card <id>    Generate a specific card by ID
 *   --card-back    Generate the card back image
 *   --missing      Generate only missing cards
 *   --dry-run      Show what would be generated without generating
 *
 * Examples:
 *   npx ts-node scripts/generate-assets.ts --card 0     # Generate The Fool
 *   npx ts-node scripts/generate-assets.ts --major      # Generate all Major Arcana
 *   npx ts-node scripts/generate-assets.ts --all        # Generate entire deck
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Card data types
interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  keywords: string[];
  element?: string;
}

// Paths
const ASSETS_DIR = path.join(__dirname, '../assets/cards');
const INDEX_FILE = path.join(ASSETS_DIR, 'index.ts');

// Art style constants
const CARD_ART_STYLE = 'Tarot card art, mystical illustration, gold ink line art on dark midnight blue paper, ethereal glow, intricate details, sacred geometry elements, 8k resolution, professional tarot deck quality';
const CARD_BACK_STYLE = 'Intricate celestial pattern, gold foil ornate design on midnight blue texture, symmetric mandala, crescent moon and stars, sacred geometry, tarot card back design, luxurious mystical, seamless pattern, 8k resolution';

// Major Arcana data
const majorArcana: TarotCard[] = [
  { id: 0, name: 'The Fool', arcana: 'major', keywords: ['beginnings', 'innocence', 'spontaneity'], element: 'Air' },
  { id: 1, name: 'The Magician', arcana: 'major', keywords: ['manifestation', 'resourcefulness', 'power'], element: 'Air' },
  { id: 2, name: 'The High Priestess', arcana: 'major', keywords: ['intuition', 'sacred knowledge', 'divine feminine'], element: 'Water' },
  { id: 3, name: 'The Empress', arcana: 'major', keywords: ['femininity', 'beauty', 'abundance'], element: 'Earth' },
  { id: 4, name: 'The Emperor', arcana: 'major', keywords: ['authority', 'structure', 'control'], element: 'Fire' },
  { id: 5, name: 'The Hierophant', arcana: 'major', keywords: ['tradition', 'conformity', 'morality'], element: 'Earth' },
  { id: 6, name: 'The Lovers', arcana: 'major', keywords: ['love', 'harmony', 'relationships'], element: 'Air' },
  { id: 7, name: 'The Chariot', arcana: 'major', keywords: ['control', 'willpower', 'success'], element: 'Water' },
  { id: 8, name: 'Strength', arcana: 'major', keywords: ['inner strength', 'bravery', 'compassion'], element: 'Fire' },
  { id: 9, name: 'The Hermit', arcana: 'major', keywords: ['soul-searching', 'introspection', 'solitude'], element: 'Earth' },
  { id: 10, name: 'Wheel of Fortune', arcana: 'major', keywords: ['change', 'cycles', 'fate'], element: 'Fire' },
  { id: 11, name: 'Justice', arcana: 'major', keywords: ['fairness', 'truth', 'law'], element: 'Air' },
  { id: 12, name: 'The Hanged Man', arcana: 'major', keywords: ['pause', 'surrender', 'new perspective'], element: 'Water' },
  { id: 13, name: 'Death', arcana: 'major', keywords: ['endings', 'change', 'transformation'], element: 'Water' },
  { id: 14, name: 'Temperance', arcana: 'major', keywords: ['balance', 'moderation', 'patience'], element: 'Fire' },
  { id: 15, name: 'The Devil', arcana: 'major', keywords: ['shadow self', 'attachment', 'addiction'], element: 'Earth' },
  { id: 16, name: 'The Tower', arcana: 'major', keywords: ['sudden change', 'upheaval', 'revelation'], element: 'Fire' },
  { id: 17, name: 'The Star', arcana: 'major', keywords: ['hope', 'faith', 'renewal'], element: 'Air' },
  { id: 18, name: 'The Moon', arcana: 'major', keywords: ['illusion', 'fear', 'anxiety'], element: 'Water' },
  { id: 19, name: 'The Sun', arcana: 'major', keywords: ['positivity', 'success', 'vitality'], element: 'Fire' },
  { id: 20, name: 'Judgement', arcana: 'major', keywords: ['reflection', 'reckoning', 'awakening'], element: 'Fire' },
  { id: 21, name: 'The World', arcana: 'major', keywords: ['completion', 'accomplishment', 'travel'], element: 'Earth' },
];

// Minor Arcana suits
const suits: Array<{ name: 'wands' | 'cups' | 'swords' | 'pentacles'; element: string; startId: number }> = [
  { name: 'wands', element: 'Fire', startId: 22 },
  { name: 'cups', element: 'Water', startId: 36 },
  { name: 'swords', element: 'Air', startId: 50 },
  { name: 'pentacles', element: 'Earth', startId: 64 },
];

const cardRanks = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];

// Generate Minor Arcana
function generateMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  for (const suit of suits) {
    for (let i = 0; i < 14; i++) {
      cards.push({
        id: suit.startId + i,
        name: `${cardRanks[i]} of ${suit.name.charAt(0).toUpperCase() + suit.name.slice(1)}`,
        arcana: 'minor',
        suit: suit.name,
        keywords: getSuitKeywords(suit.name, i),
        element: suit.element,
      });
    }
  }
  return cards;
}

function getSuitKeywords(suit: string, rank: number): string[] {
  const suitThemes: Record<string, string[]> = {
    wands: ['creativity', 'passion', 'energy', 'action'],
    cups: ['emotions', 'relationships', 'intuition', 'feelings'],
    swords: ['intellect', 'conflict', 'truth', 'communication'],
    pentacles: ['material', 'wealth', 'work', 'practical'],
  };
  return suitThemes[suit] || ['mystery'];
}

// All cards
const allCards: TarotCard[] = [...majorArcana, ...generateMinorArcana()];

// Generate prompt for a card
function generateCardPrompt(card: TarotCard): string {
  const keywordsStr = card.keywords.slice(0, 3).join(', ');
  const arcanaType = card.arcana === 'major' ? 'Major Arcana' : `Minor Arcana ${card.suit}`;
  return `${CARD_ART_STYLE}, "${card.name}" tarot card, ${arcanaType}, symbolizing ${keywordsStr}, ${card.element ? `element of ${card.element}` : ''}, mystical and powerful imagery`;
}

// Check if card asset exists
function cardAssetExists(cardId: number): boolean {
  const filePath = path.join(ASSETS_DIR, `card-${cardId}.png`);
  return fs.existsSync(filePath);
}

// Download image from URL
function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          }).on('error', reject);
        } else {
          reject(new Error('Redirect without location'));
        }
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Generate a single card image using Newell AI / Replicate
async function generateCardImage(card: TarotCard, dryRun: boolean = false): Promise<boolean> {
  const filePath = path.join(ASSETS_DIR, `card-${card.id}.png`);
  const prompt = generateCardPrompt(card);

  console.log(`\n  Generating: ${card.name} (ID: ${card.id})`);
  console.log(`  Prompt: ${prompt.substring(0, 80)}...`);

  if (dryRun) {
    console.log(`  [DRY RUN] Would save to: ${filePath}`);
    return true;
  }

  try {
    // Use the fastshot/ai generateImage function
    // This requires the app environment, so we'll use direct API call for script
    const { generateImage } = await import('@fastshot/ai');

    const result = await generateImage({
      prompt,
      width: 512,
      height: 768,
      numOutputs: 1,
    });

    if (result?.images?.[0]) {
      await downloadImage(result.images[0], filePath);
      console.log(`  ✓ Saved to: ${filePath}`);
      return true;
    } else {
      console.error(`  ✗ No image returned`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error}`);
    return false;
  }
}

// Generate the card back image
async function generateCardBack(dryRun: boolean = false): Promise<boolean> {
  const filePath = path.join(ASSETS_DIR, 'card-back.png');

  console.log(`\n  Generating: Card Back`);
  console.log(`  Prompt: ${CARD_BACK_STYLE.substring(0, 80)}...`);

  if (dryRun) {
    console.log(`  [DRY RUN] Would save to: ${filePath}`);
    return true;
  }

  try {
    const { generateImage } = await import('@fastshot/ai');

    const result = await generateImage({
      prompt: CARD_BACK_STYLE,
      width: 512,
      height: 768,
      numOutputs: 1,
    });

    if (result?.images?.[0]) {
      await downloadImage(result.images[0], filePath);
      console.log(`  ✓ Saved to: ${filePath}`);
      return true;
    } else {
      console.error(`  ✗ No image returned`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error}`);
    return false;
  }
}

// Update the index.ts file with generated assets
function updateIndexFile(generatedIds: number[], hasCardBack: boolean): void {
  const cardBackLine = hasCardBack
    ? `export const cardBackAsset = require('./card-back.png');`
    : `export const cardBackAsset = null; // Not yet generated`;

  const assetEntries = generatedIds
    .sort((a, b) => a - b)
    .map(id => {
      const card = allCards.find(c => c.id === id);
      return `  ${id}: require('./card-${id}.png'), // ${card?.name || 'Unknown'}`;
    })
    .join('\n');

  const content = `// Pre-bundled Tarot Card Assets
// This file is auto-generated by scripts/generate-assets.ts
// DO NOT EDIT MANUALLY - Run the generation script to update
// Generated: ${new Date().toISOString()}

// Static map of bundled card images
// Cards that exist in this map will be used directly from the bundle
// Cards not in this map will fall back to runtime generation

export type CardAssetMap = {
  [cardId: number]: ReturnType<typeof require> | null;
};

// Card back image (bundled)
${cardBackLine}

// Individual card assets
// Format: cardId -> require('./card-{id}.png')
export const cardAssets: CardAssetMap = {
${assetEntries || '  // No cards generated yet'}
};

// Helper to check if a card has a bundled asset
export const hasBundledAsset = (cardId: number): boolean => {
  return cardId in cardAssets && cardAssets[cardId] !== null;
};

// Get bundled asset for a card (returns null if not bundled)
export const getBundledAsset = (cardId: number): ReturnType<typeof require> | null => {
  return cardAssets[cardId] ?? null;
};

// Get count of bundled cards
export const getBundledCardCount = (): number => {
  return Object.values(cardAssets).filter(asset => asset !== null).length;
};

// Total cards in a tarot deck
export const TOTAL_CARDS = 78;
`;

  fs.writeFileSync(INDEX_FILE, content);
  console.log(`\n  Updated index file: ${INDEX_FILE}`);
}

// Get list of existing generated card IDs
function getExistingCardIds(): number[] {
  const ids: number[] = [];
  for (let i = 0; i < 78; i++) {
    if (cardAssetExists(i)) {
      ids.push(i);
    }
  }
  return ids;
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║     Tarot Card Asset Generation Script       ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // Ensure assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  const dryRun = args.includes('--dry-run');
  let cardsToGenerate: TarotCard[] = [];
  let generateBack = false;

  if (args.includes('--all')) {
    cardsToGenerate = allCards;
    generateBack = true;
  } else if (args.includes('--major')) {
    cardsToGenerate = majorArcana;
  } else if (args.includes('--minor')) {
    cardsToGenerate = allCards.filter(c => c.arcana === 'minor');
  } else if (args.includes('--card')) {
    const cardIdIndex = args.indexOf('--card') + 1;
    const cardId = parseInt(args[cardIdIndex], 10);
    const card = allCards.find(c => c.id === cardId);
    if (card) {
      cardsToGenerate = [card];
    } else {
      console.error(`Card ID ${cardId} not found. Valid IDs: 0-77`);
      process.exit(1);
    }
  } else if (args.includes('--card-back')) {
    generateBack = true;
  } else if (args.includes('--missing')) {
    const existingIds = new Set(getExistingCardIds());
    cardsToGenerate = allCards.filter(c => !existingIds.has(c.id));
    generateBack = !fs.existsSync(path.join(ASSETS_DIR, 'card-back.png'));
  } else {
    console.log('Usage: npx ts-node scripts/generate-assets.ts [options]\n');
    console.log('Options:');
    console.log('  --all          Generate all 78 cards + card back');
    console.log('  --major        Generate only Major Arcana (22 cards)');
    console.log('  --minor        Generate only Minor Arcana (56 cards)');
    console.log('  --card <id>    Generate a specific card by ID (0-77)');
    console.log('  --card-back    Generate the card back image');
    console.log('  --missing      Generate only missing cards');
    console.log('  --dry-run      Show what would be generated\n');
    console.log('Examples:');
    console.log('  npx ts-node scripts/generate-assets.ts --card 0     # Generate The Fool');
    console.log('  npx ts-node scripts/generate-assets.ts --major      # Generate Major Arcana');
    console.log('  npx ts-node scripts/generate-assets.ts --all        # Generate entire deck\n');
    process.exit(0);
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be generated\n');
  }

  // Report what will be generated
  const existingIds = getExistingCardIds();
  console.log(`📊 Current Status:`);
  console.log(`   Existing cards: ${existingIds.length}/78`);
  console.log(`   Card back: ${fs.existsSync(path.join(ASSETS_DIR, 'card-back.png')) ? 'Yes' : 'No'}`);
  console.log(`   To generate: ${cardsToGenerate.length} cards${generateBack ? ' + card back' : ''}\n`);

  if (cardsToGenerate.length === 0 && !generateBack) {
    console.log('Nothing to generate.\n');
    process.exit(0);
  }

  // Generate card back if requested
  if (generateBack) {
    console.log('🎴 Generating Card Back...');
    await generateCardBack(dryRun);
  }

  // Generate cards
  if (cardsToGenerate.length > 0) {
    console.log(`\n🎴 Generating ${cardsToGenerate.length} Cards...`);

    let successCount = 0;
    let failCount = 0;

    for (const card of cardsToGenerate) {
      const success = await generateCardImage(card, dryRun);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Delay between generations to avoid rate limiting
      if (!dryRun && cardsToGenerate.indexOf(card) < cardsToGenerate.length - 1) {
        console.log('  ⏳ Waiting 2s before next generation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n📈 Generation Complete:`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
  }

  // Update index file
  if (!dryRun) {
    const finalExistingIds = getExistingCardIds();
    const hasCardBack = fs.existsSync(path.join(ASSETS_DIR, 'card-back.png'));
    updateIndexFile(finalExistingIds, hasCardBack);
  }

  console.log('\n✨ Done!\n');
}

main().catch(console.error);
