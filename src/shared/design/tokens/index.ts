/**
 * Design Tokens - Neumorphic Theme System
 * Comprehensive token system for consistent neumorphic styling across components
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Primary Accent (CareSignal brand green)
  accent: {
    primary: '#4FA72E',     // CareSignal leaf green
    light: '#6FBE52',       // Lighter green
    dark: '#3A8F22',        // Darker green
    lighter: '#DCEFD0',     // Very light green tint (badges, highlights)
  },

  // Neutral Grays
  neutral: {
    50: '#FAFAFA',          // Almost white
    100: '#F5F5F5',         // Very light gray
    200: '#EEEEEE',         // Light gray
    300: '#E0E0E0',         // Light-medium gray
    400: '#BDBDBD',         // Medium gray
    500: '#9E9E9E',         // Gray
    600: '#757575',         // Medium-dark gray
    700: '#616161',         // Dark gray
    800: '#424242',         // Darker gray
    900: '#212121',         // Almost black
  },

  // Semantic Colors
  semantic: {
    success: '#27AE60',     // Slightly deeper success green (status pills)
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },

  // Background & Surface — neumorphic depth comes from the contrast between these
  background: {
    light: '#EEF1F5',       // Soft blue-gray app background
    dark: '#1A1A1A',
  },

  surface: {
    light: '#FFFFFF',       // Cards / raised surfaces (white on top of bg)
    dark: '#2A2A2A',
  },

  text: {
    primary: '#1A2138',     // Dark navy (titles, body)
    secondary: '#64748B',   // Slate-gray (subtitles, captions)
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },

  // Input/border tones
  border: {
    light: '#CBD5E1',       // Outlined inputs, dividers
  },
};

// ============================================================================
// SHADOW & ELEVATION TOKENS (Core Neumorphic)
// ============================================================================

export const shadows = {
  // Neumorphic elevation levels
  elevation: {
    // Subtle shadows (flat, minimal depth)
    xs: {
      light: {
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
      },
      dark: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
      },
    },

    // Small shadows (slight depth)
    sm: {
      light: {
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      },
      dark: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 2,
      },
    },

    // Medium shadows (moderate depth) - Most common
    md: {
      light: {
        shadowColor: '#000000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
      },
      dark: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 3,
      },
    },

    // Large shadows (pronounced depth)
    lg: {
      light: {
        shadowColor: '#000000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
      },
      dark: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: -8, height: -8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 4,
      },
    },

    // Extra large shadows (deep depth)
    xl: {
      light: {
        shadowColor: '#000000',
        shadowOffset: { width: 12, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 5,
      },
      dark: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: -12, height: -12 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
      },
    },
  },

  // Web box-shadow equivalents (CSS)
  web: {
    xs: '2px 2px 4px rgba(0, 0, 0, 0.08), -2px -2px 4px rgba(255, 255, 255, 0.5)',
    sm: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.5)',
    md: '6px 6px 12px rgba(0, 0, 0, 0.12), -6px -6px 12px rgba(255, 255, 255, 0.5)',
    lg: '8px 8px 16px rgba(0, 0, 0, 0.15), -8px -8px 16px rgba(255, 255, 255, 0.5)',
    xl: '12px 12px 20px rgba(0, 0, 0, 0.18), -12px -12px 20px rgba(255, 255, 255, 0.5)',
  },

  // Inset shadows (for pressed/active states)
  inset: {
    sm: 'inset 2px 2px 4px rgba(0, 0, 0, 0.08), inset -2px -2px 4px rgba(255, 255, 255, 0.5)',
    md: 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.5)',
    lg: 'inset 6px 6px 12px rgba(0, 0, 0, 0.12), inset -6px -6px 12px rgba(255, 255, 255, 0.5)',
  },
};

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  36: 36,
  40: 40,
  44: 44,
  48: 48,
  52: 52,
  56: 56,
  60: 60,
  64: 64,
};

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  // Subtle rounding
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  fontFamily: {
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Courier New", Courier, monospace',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  // Button tokens
  button: {
    primary: {
      padding: {
        sm: `${spacing[8]}px ${spacing[16]}px`,
        md: `${spacing[12]}px ${spacing[20]}px`,
        lg: `${spacing[16]}px ${spacing[24]}px`,
      },
      borderRadius: borderRadius.lg,
      minHeight: {
        sm: 32,
        md: 40,
        lg: 48,
      },
    },

    // Neumorphic raised buttons — same color as the app background, lifted by shadow.
    // Text color is dark navy; primary accent (green) is reserved for icons/badges/links.
    states: {
      default: {
        backgroundColor: colors.background.light,
        shadow: shadows.web.md,
      },
      pressed: {
        backgroundColor: colors.neutral[100],
        shadow: shadows.web.sm,
      },
      disabled: {
        backgroundColor: colors.neutral[200],
        shadow: 'none',
      },
    },
  },

  // Card/Container tokens
  card: {
    padding: spacing[20],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.light,
    shadow: shadows.web.md,
  },

  // Input field tokens
  input: {
    padding: `${spacing[12]}px ${spacing[16]}px`,
    borderRadius: borderRadius.md,
    minHeight: 44,
    backgroundColor: colors.neutral[50],
    shadow: shadows.web.xs,
    borderColor: colors.neutral[300],
  },

  // Dial/Knob tokens
  dial: {
    size: 120,
    borderRadius: borderRadius.full,
    shadow: shadows.web.lg,
    accentColor: colors.accent.primary,
  },

  // Slider tokens
  slider: {
    height: 8,
    thumbSize: 20,
    borderRadius: borderRadius.md,
    shadow: shadows.web.md,
  },

  // Icon button tokens
  iconButton: {
    size: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    borderRadius: borderRadius.full,
    shadow: shadows.web.sm,
  },
};

// ============================================================================
// OPACITY TOKENS
// ============================================================================

export const opacity = {
  disabled: 0.5,
  hover: 0.8,
  focus: 0.9,
  active: 1,
};

// ============================================================================
// DURATION/ANIMATION TOKENS
// ============================================================================

export const duration = {
  fast: 150,
  base: 300,
  slow: 500,
  slowest: 700,
};

export const easing = {
  ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
};
