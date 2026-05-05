export const colors = {
  primary: '#0D1425', // Main Navy
  secondary: '#008471', // Senior Teal (enhanced with soft colors below)
  accent: '#E6F4F1', // Soft Family Accent
  danger: '#FF4D4D',
  warning: '#FFC107',
  success: '#00C853',
  background: '#F5F3F0', // Syntactic soft background
  surface: '#F5F3F0',    // Neumorphic surface must match background
  card: '#FFFFFF',
  text: '#1A2138',
  textSecondary: '#64748B',
  border: '#D1D9E6',
  transparent: 'transparent',
  // Neumorphic specific
  lightShadow: '#FFFFFF',
  darkShadow: '#B8C6D9',
  // Mockup specific
  seniorCard: '#0A1121',
  familyCard: '#FFFFFF',
  // Syntactic soft colors
  softMint: '#D4E8E6',
  softBlue: '#C8DDF5',
  softBeige: '#E8D4D4',
  softPink: '#F0E8F8',
  teal: '#A8D5E0', // Action color
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 64,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  full: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  title: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  heading: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  subheading: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 1 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  small: { fontSize: 12, fontWeight: '500' as const, lineHeight: 18 },
};

export const shadows = {
  neumorphic: {
    light: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -5, height: -5 },
      shadowOpacity: 1,
      shadowRadius: 10,
    },
    dark: {
      shadowColor: '#B8C6D9',
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 5,
    },
    inset: {
      // Inset is harder in RN, usually simulated with borders or internal shadows
    }
  }
};

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
};

export type Theme = typeof theme;
