/**
 * Farm Supervisor Theme - Professional Gamified Design
 * Inspired by modern dashboard aesthetics with a game-like feel
 */

import { Platform } from 'react-native';

// --- PROFESSIONAL GAME PALETTE ---
// Using rich, saturated colors that feel professional yet engaging

// Primary Colors
const primaryGreen = '#2E7D32';      // Main brand color - Forest Green
const primaryTeal = '#00897B';       // Secondary action color
const accentGold = '#FFB300';        // Highlights, achievements
const accentBlue = '#1976D2';        // Info, links

// Feedback Colors
const successGreen = '#43A047';      // Success states
const warningOrange = '#FB8C00';     // Warnings
const errorRed = '#E53935';          // Errors
const infoBlue = '#039BE5';          // Information

// Backgrounds (Light Mode)
const lightBg = '#F8FAFE';           // Soft blue-white
const lightCard = '#FFFFFF';
const lightSecondary = '#EEF2F6';

// Backgrounds (Dark Mode)
const darkBg = '#0D1B2A';            // Deep navy
const darkCard = '#1B2838';          // Slate card
const darkSecondary = '#243447';

// Borders
const hardBorder = '#1A237E';        // Deep indigo for outlines

export const Colors = {
  light: {
    text: '#1A237E',                 // Deep indigo text
    textSecondary: '#546E7A',        // Blue-gray for subtitles
    textMuted: '#90A4AE',
    background: lightBg,
    backgroundSecondary: lightSecondary,
    card: lightCard,
    
    // Brand Colors
    tint: primaryGreen,
    primary: primaryGreen,
    primaryLight: '#C8E6C9',
    
    // Feedback Colors
    success: successGreen,
    successLight: '#E8F5E9',
    warning: warningOrange,
    warningLight: '#FFF3E0',
    error: errorRed,
    errorLight: '#FFEBEE',
    info: infoBlue,
    infoLight: '#E1F5FE',
    
    // UI Elements
    border: hardBorder,
    borderLight: '#E0E0E0',
    icon: '#1A237E',
    tabIconDefault: '#90A4AE',
    tabIconSelected: primaryGreen,
    
    // Shadows
    shadow: '#000000',
    overlay: 'rgba(26, 35, 126, 0.6)',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#80CBC4',        // Teal accent in dark mode
    textMuted: '#78909C',
    background: darkBg,
    backgroundSecondary: darkSecondary,
    card: darkCard,
    
    // Brand Colors
    tint: '#4CAF50',                 // Lighter green for dark mode
    primary: '#4CAF50',
    primaryLight: '#1B5E20',
    
    // Feedback Colors
    success: '#66BB6A',
    successLight: '#1B5E20',
    warning: '#FFA726',
    warningLight: '#E65100',
    error: '#EF5350',
    errorLight: '#B71C1C',
    info: '#29B6F6',
    infoLight: '#01579B',
    
    // UI Elements
    border: '#37474F',
    borderLight: '#455A64',
    icon: '#FFFFFF',
    tabIconDefault: '#607D8B',
    tabIconSelected: '#4CAF50',
    
    // Shadows
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-condensed',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    serif: "'Merriweather', Georgia, serif",
    rounded: "'Nunito', 'SF Pro Rounded', sans-serif",
    mono: "'Fira Code', 'SF Mono', monospace",
  },
});

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
};

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Shadow presets for consistent elevation
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  game: {
    // Neo-brutalist hard shadow
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
};
