// ─── Color Palette ────────────────────────────────────────────────────────────

export const Colors = {
  primary: '#2A6354',
  primaryLight: '#3D8A73',
  primaryDark: '#1A4237',

  success: '#27AE60',
  successLight: '#52C97A',
  successDark: '#1E8449',

  warning: '#E8A020',
  warningLight: '#F0B84A',
  warningDark: '#B87810',

  urgent: '#C83030',
  urgentLight: '#E05050',
  urgentDark: '#9A2020',

  background: '#EBF6F1',
  backgroundMint: '#C0E0D4',
  card: '#FFFFFF',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderFocus: '#2A6354',

  late: '#E8A020',
  missed: '#6B7280',
  pending: '#9CA3AF',

  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const Typography = {
  fontSizeXs: 11,
  fontSizeSm: 13,
  fontSizeMd: 15,
  fontSizeLg: 17,
  fontSizeXl: 20,
  fontSize2xl: 24,
  fontSize3xl: 30,
  fontSize4xl: 36,

  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightBold: '700' as const,
  fontWeightExtraBold: '800' as const,

  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
