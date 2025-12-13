// Tarotify Theme Constants - Mystical Dark Theme

export const Colors = {
  // Primary Colors
  deepMidnightBlue: '#0B0F19',
  voidBlack: '#030508',
  celestialGold: '#DD85D8',

  // Secondary Colors
  mysticPurple: '#2D1B4E',
  stardustSilver: '#C0C0C0',
  moonlightGray: '#8A8A8A',

  // Accent Colors
  etherealBlue: '#1E3A5F',
  cosmicViolet: '#4A1942',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#C0C0C0',
  textMuted: '#6B7280',

  // UI Colors
  cardBackground: 'rgba(30, 58, 95, 0.4)',
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(221, 133, 216, 0.5)',
  inputBorderFocused: '#DD85D8',

  // Gradient Colors
  gradientStart: '#0B0F19',
  gradientMiddle: '#1A1F2E',
  gradientEnd: '#0B0F19',

  // Overlay Colors
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
};

export const Fonts = {
  // Using system fonts initially, can be replaced with custom fonts
  heading: 'serif', // Will use Playfair Display when loaded
  body: 'System',
  accent: 'serif',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#DD85D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#DD85D8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
};
