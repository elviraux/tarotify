#!/usr/bin/env npx ts-node
/**
 * Mystical Icon Generation Script
 *
 * This script generates themed icons for the onboarding intent selection screen.
 * Run this script during development/build time to generate assets.
 *
 * Usage:
 *   npx ts-node scripts/generate-icons.ts
 *
 * Output:
 *   assets/icons/intent-love.png
 *   assets/icons/intent-clarity.png
 *   assets/icons/intent-guidance.png
 *   assets/icons/intent-charts.png
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Paths
const ICONS_DIR = path.join(__dirname, '../assets/icons');

// Icon definitions with mystical prompts
const ICON_DEFINITIONS = [
  {
    name: 'intent-love',
    prompt: 'Mystical golden heart with rays, gold line art on dark background, minimalist icon, elegant sacred symbol, centered composition, no text, simple clean design',
  },
  {
    name: 'intent-clarity',
    prompt: 'Third eye or crystal ball, golden line art on dark background, minimalist icon, mystical all-seeing eye symbol, centered composition, no text, simple clean design',
  },
  {
    name: 'intent-guidance',
    prompt: 'North star or lantern, golden style, gold line art on dark background, minimalist icon, celestial guiding light symbol, centered composition, no text, simple clean design',
  },
  {
    name: 'intent-charts',
    prompt: 'Planet or zodiac wheel, golden style, gold line art on dark background, minimalist icon, astrological symbol, centered composition, no text, simple clean design',
  },
];

// Download image from URL, handling redirects
function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const makeRequest = (requestUrl: string, redirectCount: number = 0): void => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      const protocol = requestUrl.startsWith('https') ? https : require('http');

      protocol.get(requestUrl, (response: any) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            makeRequest(redirectUrl, redirectCount + 1);
          } else {
            reject(new Error('Redirect without location'));
          }
        } else if (response.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
          file.on('error', (err: Error) => {
            fs.unlink(filePath, () => {});
            reject(err);
          });
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      }).on('error', reject);
    };

    makeRequest(url);
  });
}

// Generate a single icon using Newell AI / Replicate
async function generateIcon(
  name: string,
  prompt: string,
  dryRun: boolean = false
): Promise<boolean> {
  const filePath = path.join(ICONS_DIR, `${name}.png`);

  console.log(`\n  Generating: ${name}`);
  console.log(`  Prompt: ${prompt.substring(0, 60)}...`);

  if (dryRun) {
    console.log(`  [DRY RUN] Would save to: ${filePath}`);
    return true;
  }

  try {
    // Use the fastshot/ai generateImage function
    const { generateImage } = await import('@fastshot/ai');

    const result = await generateImage({
      prompt,
      width: 256,
      height: 256,
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

// Main function
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║     Mystical Icon Generation Script          ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
    console.log(`  Created directory: ${ICONS_DIR}\n`);
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be generated\n');
  }

  console.log(`📊 Will generate ${ICON_DEFINITIONS.length} icons\n`);

  let successCount = 0;
  let failCount = 0;

  for (const icon of ICON_DEFINITIONS) {
    const success = await generateIcon(icon.name, icon.prompt, dryRun);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Delay between generations to avoid rate limiting
    if (!dryRun && ICON_DEFINITIONS.indexOf(icon) < ICON_DEFINITIONS.length - 1) {
      console.log('  ⏳ Waiting 2s before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n📈 Generation Complete:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log('\n✨ Done!\n');
}

main().catch(console.error);
