/**
 * Editorial Dark — design tokens.
 *
 * Inspired by long-form magazine layouts (NYT, Magdalena, Are.na):
 * - Deep blacks (not pure black) for OLED warmth
 * - Sharp serif for hero numbers (Instrument Serif)
 * - Geometric sans for body (Inter)
 * - Single hero accent (chartreuse) — used surgically, never in gradients
 * - High contrast, lots of negative space, no glassmorphism
 */

export const colors = {
  // Surfaces — warm-tinted blacks, not RGB(0,0,0)
  canvas: '#0A0A0B',
  surface: '#141416',
  elevated: '#1C1C1F',
  border: '#26262A',
  divider: '#1E1E22',

  // Ink (text)
  inkHi: '#FAFAF7', // warm white — primary text
  inkMid: '#A3A3A0',
  inkLow: '#5C5C5A',
  inkDim: '#3A3A38',

  // Hero accent — single color, used sparingly
  accent: '#D6F26D', // chartreuse, slightly desaturated (not the toxic lime)
  accentInk: '#0A0A0B',

  // State colors — muted, not screaming
  warn: '#F2A65A',
  danger: '#E26D5C',
  success: '#9DBF6E', // sage, not green-screen

  // Macro categories — earth-toned
  protein: '#B8C97A', // moss
  carbs: '#E8B86A', // amber
  fat: '#D77A61', // terracotta

  // Special — for hero serif numbers
  numberHi: '#FAFAF7',
  numberLow: '#5C5C5A'
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999
} as const;

export const spacing = {
  px: 1,
  '0.5': 2,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80
} as const;

export const type = {
  // Display — serif for hero numbers (Instrument Serif)
  displayXl: { family: 'InstrumentSerif', size: 96, lineHeight: 96, letter: -3 },
  display: { family: 'InstrumentSerif', size: 72, lineHeight: 72, letter: -2.5 },
  displayMd: { family: 'InstrumentSerif', size: 56, lineHeight: 56, letter: -2 },

  // Headings — sans (Inter)
  h1: { family: 'Inter-700', size: 32, lineHeight: 38, letter: -0.6 },
  h2: { family: 'Inter-600', size: 22, lineHeight: 28, letter: -0.3 },
  h3: { family: 'Inter-600', size: 17, lineHeight: 22, letter: -0.2 },

  // Body
  body: { family: 'Inter-400', size: 15, lineHeight: 22, letter: -0.1 },
  bodyMd: { family: 'Inter-500', size: 15, lineHeight: 22, letter: -0.1 },
  bodySm: { family: 'Inter-400', size: 13, lineHeight: 18, letter: -0.05 },

  // Labels & meta
  label: { family: 'Inter-600', size: 11, lineHeight: 14, letter: 0.8 }, // uppercase
  meta: { family: 'Inter-500', size: 12, lineHeight: 16, letter: 0 },

  // Tabular numbers — for macros, kcal in lists
  num: { family: 'Inter-500', size: 15, lineHeight: 20, letter: -0.05 },
  numLg: { family: 'Inter-600', size: 22, lineHeight: 26, letter: -0.4 }
} as const;

export const motion = {
  // Easing curves
  easeOut: [0.16, 1, 0.3, 1] as const, // Robert Penner cubic-out
  easeInOut: [0.65, 0, 0.35, 1] as const,
  spring: { damping: 18, stiffness: 220, mass: 1 },
  springTight: { damping: 22, stiffness: 320, mass: 0.9 },

  // Durations (ms)
  fast: 180,
  base: 320,
  slow: 600,
  hero: 1200
} as const;

export const elevation = {
  // Shadow tokens for Skia/View
  none: { color: 'transparent', blur: 0, offsetY: 0, opacity: 0 },
  card: { color: '#000000', blur: 24, offsetY: 8, opacity: 0.4 },
  glow: { color: '#D6F26D', blur: 40, offsetY: 0, opacity: 0.15 },
  glowOver: { color: '#E26D5C', blur: 48, offsetY: 0, opacity: 0.2 }
} as const;
