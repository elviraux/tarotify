// Numerology Calculation Utilities

// Pythagorean Numerology Values
const letterValues: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const isVowel = (char: string): boolean => {
  return ['a', 'e', 'i', 'o', 'u', 'y'].includes(char.toLowerCase());
};

// Reduce a number to a single digit or master number (11, 22, 33)
const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) return num;
  if (num < 10) return num;

  let sum = 0;
  const digits = num.toString().split('');
  for (const digit of digits) {
    sum += parseInt(digit, 10);
  }

  return reduceNumber(sum);
};

// Calculate Life Path Number from Date of Birth
export const calculateLifePathNumber = (date: Date): number => {
  // Reduce Year
  const year = date.getFullYear();
  const reducedYear = reduceNumber(year);

  // Reduce Month (0-11 in JS Date, so +1)
  const month = date.getMonth() + 1;
  const reducedMonth = reduceNumber(month);

  // Reduce Day
  const day = date.getDate();
  const reducedDay = reduceNumber(day);

  // Sum and reduce final
  return reduceNumber(reducedYear + reducedMonth + reducedDay);
};

// Calculate Destiny Number (Expression Number) from Full Name
// Sum of ALL letters
export const calculateDestinyNumber = (fullName: string): number => {
  let sum = 0;
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');

  for (const char of cleanName) {
    sum += letterValues[char] || 0;
  }

  return reduceNumber(sum);
};

// Calculate Soul Urge Number (Heart's Desire) from Full Name
// Sum of VOWELS only
export const calculateSoulUrgeNumber = (fullName: string): number => {
  let sum = 0;
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');

  for (const char of cleanName) {
    if (isVowel(char)) {
      sum += letterValues[char] || 0;
    }
  }

  return reduceNumber(sum);
};
