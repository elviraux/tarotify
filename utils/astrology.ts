// Astrology Calculation Utilities
// Simplified estimations for Moon and Rising signs

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Calculate estimated Moon Sign based on birth date
 * This is a simplified estimation - real calculation requires ephemeris data
 * Moon changes signs approximately every 2.5 days
 */
export const calculateMoonSign = (date: Date): string => {
  // Get the day of the year (1-365)
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Moon cycle is approximately 29.5 days, visiting each sign for ~2.5 days
  // We use the day of year combined with birth year to estimate position
  const yearOffset = date.getFullYear() % 12;
  const moonCyclePosition = (dayOfYear + yearOffset * 30) % 30;

  // Map to zodiac sign (each sign gets ~2.5 days in the lunar cycle)
  const signIndex = Math.floor((moonCyclePosition / 30) * 12) % 12;

  return ZODIAC_SIGNS[signIndex];
};

/**
 * Calculate estimated Rising Sign (Ascendant) based on birth date and time
 * Rising sign changes approximately every 2 hours
 * This requires birth time for accurate calculation
 */
export const calculateRisingSign = (date: Date, timeOfBirth?: string): string | null => {
  if (!timeOfBirth || timeOfBirth.trim() === '') {
    return null; // Cannot calculate without birth time
  }

  // Parse time string (expected format: "HH:MM AM/PM" or "HH:MM")
  let hours = 0;
  const timeMatch = timeOfBirth.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    const isPM = timeMatch[3]?.toUpperCase() === 'PM';

    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }
  } else {
    return null;
  }

  // Get the Sun sign index as starting point
  const sunSignIndex = getSunSignIndex(date);

  // Rising sign changes every 2 hours (12 signs over 24 hours)
  // At sunrise (~6 AM), Rising equals Sun sign
  // Each hour adds approximately 0.5 signs
  const hoursFromSunrise = (hours - 6 + 24) % 24;
  const risingOffset = Math.floor(hoursFromSunrise / 2);

  const risingIndex = (sunSignIndex + risingOffset) % 12;

  return ZODIAC_SIGNS[risingIndex];
};

/**
 * Get the index of the Sun sign (0-11)
 */
const getSunSignIndex = (date: Date): number => {
  const day = date.getDate();
  const month = date.getMonth() + 1;

  // Zodiac date ranges
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 0;  // Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 1;  // Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 2;  // Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 3;  // Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 4;  // Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 5;  // Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 6; // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 7; // Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 8; // Sagittarius
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 9; // Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 10; // Aquarius
  return 11; // Pisces
};

/**
 * Get element for a zodiac sign
 */
export const getZodiacElement = (sign: string): string => {
  const elements: Record<string, string> = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
  };
  return elements[sign] || 'Unknown';
};

/**
 * Get modality for a zodiac sign
 */
export const getZodiacModality = (sign: string): string => {
  const modalities: Record<string, string> = {
    'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
    'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
    'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable',
  };
  return modalities[sign] || 'Unknown';
};
