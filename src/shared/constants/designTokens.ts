/**
 * Design Tokens - Cubbico
 * Paleta oficial de colores y valores de diseño
 * Basado en ColorPalette.jpg
 */

// ============================================================================
// COLORES
// ============================================================================

export const Colors = {
  // Primary Color - The Robust Black to White
  black: '#000000',
  gray90: '#1A1A1A',
  gray80: '#333333',
  gray70: '#4D4D4D',
  gray60: '#666666',
  gray50: '#7F7F7F',
  gray40: '#999999',
  gray30: '#B3B3B3',
  gray20: '#CCCCCC',
  gray10: '#E6E6E6',
  gray5: '#F3F3F3',
  white: '#FFFFFF',

  // Accent Color - The Orchid Blue
  blue70: '#0F2358',
  blue60: '#1A3C57',
  blue50: '#1F4CC0',
  blue40: '#4272B7',
  blue30: '#65A8BF',
  blue20: '#A4B0F0',
  blue10: '#CAC9FF',
  blue5: '#E4F0FF',

  // Additional Colors - The Short Rainbow
  magentaDs: '#F12E78',
  magentaCc: '#A52C5F',
  peachDs: '#FF5B36',
  peachCc: '#FF5C3F',
  yellowDs: '#FFD600',
  yellowCc: '#F4B527',
  toscaDs: '#0FCDC8',
  toscaCc: '#0FCDC8',

  // Semantic Colors (Implementation)
  background: {
    primary: '#FFFFFF',
    secondary: '#F3F3F3',
    tertiary: '#E6E6E6',
  },
  border: {
    opaque: '#CCCCCC',
    hover: '#000000',
    selected: '#1F4CC0',
  },
  content: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
  },
  campaign: {
    cpuc: '#0FCDC8',
    cps: '#FFD600',
    cc: '#F12E78',
    nonCampaign: '#4D4D4D',
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius = {
  sm: '0.375rem',  // 6px - Para elementos pequeños
  md: '0.5rem',    // 8px - rounded-lg (estándar)
  lg: '0.5rem',    // 8px - rounded-lg (principal)
  full: '9999px',  // Círculos completos
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
} as const;

export const FontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const Spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ============================================================================
// TAILWIND CLASS HELPERS
// ============================================================================

/**
 * Clases Tailwind recomendadas para consistencia
 */
export const TailwindClasses = {
  button: {
    base: 'px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
    primary: 'bg-[#1F4CC0] text-white hover:bg-[#1A3C57]',
    secondary: 'bg-[#65A8BF] text-white hover:bg-[#4272B7]',
    accent: 'bg-[#FFD600] text-black hover:bg-[#F4B527]',
    danger: 'bg-[#F12E78] text-white hover:bg-[#A52C5F]',
  },
  input: {
    base: 'px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2',
    default: 'border-[#CCCCCC] focus:ring-[#1F4CC0] focus:border-[#1F4CC0]',
  },
  card: {
    base: 'bg-white rounded-lg shadow-sm border border-[#E6E6E6]',
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type ColorToken = keyof typeof Colors;
export type BorderRadiusToken = keyof typeof BorderRadius;
export type FontSizeToken = keyof typeof FontSize;
export type SpacingToken = keyof typeof Spacing;
