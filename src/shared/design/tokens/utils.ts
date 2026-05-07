/**
 * Token Utility Functions - Helper functions for applying design tokens
 */

import { ViewStyle, TextStyle } from 'react-native';
import * as tokens from './index';

// ============================================================================
// SHADOW UTILITIES
// ============================================================================

/**
 * Get shadow style object for React Native
 * @param level - Elevation level (xs, sm, md, lg, xl)
 * @param isDark - Whether to use dark theme shadows
 * @returns Shadow style object
 */
export const getShadowStyle = (
  level: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md',
  isDark: boolean = false
): ViewStyle => {
  const shadowConfig = isDark
    ? tokens.shadows.elevation[level].dark
    : tokens.shadows.elevation[level].light;

  return {
    shadowColor: shadowConfig.shadowColor,
    shadowOffset: shadowConfig.shadowOffset,
    shadowOpacity: shadowConfig.shadowOpacity,
    shadowRadius: shadowConfig.shadowRadius,
    elevation: shadowConfig.elevation,
  };
};

/**
 * Get CSS box-shadow string for web
 * @param level - Elevation level (xs, sm, md, lg, xl)
 * @returns CSS box-shadow string
 */
export const getWebShadow = (level: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'): string => {
  return tokens.shadows.web[level];
};

// ============================================================================
// SPACING UTILITIES
// ============================================================================

/**
 * Get spacing value in pixels
 * @param size - Spacing size key (0, 2, 4, 6, 8, 12, 16, 20, 24, etc.)
 * @returns Pixel value
 */
export const getSpacing = (size: keyof typeof tokens.spacing): number => {
  return tokens.spacing[size];
};

/**
 * Create padding style object
 * @param size - Spacing size key or custom sizes
 * @param horizontal - Optional horizontal override
 * @param vertical - Optional vertical override
 * @returns Padding style
 */
export const createPadding = (
  size: keyof typeof tokens.spacing,
  horizontal?: keyof typeof tokens.spacing,
  vertical?: keyof typeof tokens.spacing
): ViewStyle => {
  const baseSize = tokens.spacing[size];
  return {
    paddingHorizontal: horizontal ? tokens.spacing[horizontal] : baseSize,
    paddingVertical: vertical ? tokens.spacing[vertical] : baseSize,
  };
};

/**
 * Create margin style object
 * @param size - Spacing size key or custom sizes
 * @param horizontal - Optional horizontal override
 * @param vertical - Optional vertical override
 * @returns Margin style
 */
export const createMargin = (
  size: keyof typeof tokens.spacing,
  horizontal?: keyof typeof tokens.spacing,
  vertical?: keyof typeof tokens.spacing
): ViewStyle => {
  const baseSize = tokens.spacing[size];
  return {
    marginHorizontal: horizontal ? tokens.spacing[horizontal] : baseSize,
    marginVertical: vertical ? tokens.spacing[vertical] : baseSize,
  };
};

// ============================================================================
// BORDER RADIUS UTILITIES
// ============================================================================

/**
 * Get border radius value
 * @param size - Border radius size key
 * @returns Pixel value
 */
export const getBorderRadius = (size: keyof typeof tokens.borderRadius): number => {
  return tokens.borderRadius[size];
};

/**
 * Create rounded corner style
 * @param size - Border radius size key
 * @returns Border radius style
 */
export const createBorderRadius = (size: keyof typeof tokens.borderRadius = 'md'): ViewStyle => {
  return {
    borderRadius: tokens.borderRadius[size],
  };
};

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get accent color with opacity
 * @param opacity - Opacity value (0-1)
 * @returns Color with opacity
 */
export const getAccentColorWithOpacity = (opacity: number = 1): string => {
  const color = tokens.colors.accent.primary;
  return applyOpacity(color, opacity);
};

/**
 * Apply opacity to a hex color
 * @param hex - Hex color code
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 */
export const applyOpacity = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// ============================================================================
// BUTTON STYLE UTILITIES
// ============================================================================

/**
 * Create button style
 * @param size - Button size (sm, md, lg)
 * @param isDark - Whether to use dark theme
 * @returns Complete button style
 */
export const createButtonStyle = (
  size: 'sm' | 'md' | 'lg' = 'md',
  isDark: boolean = false
): ViewStyle => {
  const buttonToken = tokens.components.button;
  const sizeKey = size as keyof typeof buttonToken.primary.padding;

  return {
    ...createPadding(12, undefined, size === 'lg' ? 16 : 12),
    minHeight: buttonToken.primary.minHeight[sizeKey],
    borderRadius: buttonToken.primary.borderRadius,
    backgroundColor: tokens.colors.accent.primary,
    ...getShadowStyle('md', isDark),
    justifyContent: 'center',
    alignItems: 'center',
  };
};

// ============================================================================
// CARD STYLE UTILITIES
// ============================================================================

/**
 * Create card container style
 * @param isDark - Whether to use dark theme
 * @returns Complete card style
 */
export const createCardStyle = (isDark: boolean = false): ViewStyle => {
  const cardToken = tokens.components.card;
  return {
    ...createPadding(20),
    borderRadius: cardToken.borderRadius,
    backgroundColor: isDark ? tokens.colors.surface.dark : tokens.colors.surface.light,
    ...getShadowStyle('md', isDark),
  };
};

// ============================================================================
// INPUT STYLE UTILITIES
// ============================================================================

/**
 * Create input field style
 * @param isDark - Whether to use dark theme
 * @returns Complete input style
 */
export const createInputStyle = (isDark: boolean = false): ViewStyle => {
  const inputToken = tokens.components.input;
  return {
    ...createPadding(12, 16),
    minHeight: inputToken.minHeight,
    borderRadius: inputToken.borderRadius,
    backgroundColor: isDark ? tokens.colors.neutral[800] : tokens.colors.neutral[50],
    borderWidth: 1,
    borderColor: tokens.colors.neutral[300],
    ...getShadowStyle('xs', isDark),
  };
};

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Get animation timing config
 * @param speed - Animation speed (fast, base, slow, slowest)
 * @returns Duration in milliseconds
 */
export const getAnimationDuration = (
  speed: 'fast' | 'base' | 'slow' | 'slowest' = 'base'
): number => {
  return tokens.duration[speed];
};

/**
 * Create animation timing style
 * @param speed - Animation speed
 * @returns Object with duration
 */
export const createAnimationTiming = (speed: 'fast' | 'base' | 'slow' | 'slowest' = 'base') => {
  return {
    duration: tokens.duration[speed],
    useNativeDriver: true,
  };
};

// ============================================================================
// COMBINATION UTILITIES
// ============================================================================

/**
 * Create complete neumorphic button style
 * @param state - Button state (default, pressed, disabled)
 * @param size - Button size
 * @param isDark - Theme mode
 * @returns Complete style object
 */
export const createNeuButtonStyle = (
  state: 'default' | 'pressed' | 'disabled' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md',
  isDark: boolean = false
): ViewStyle => {
  const baseStyle = createButtonStyle(size, isDark);
  const stateStyles = tokens.components.button.states[state];

  return {
    ...baseStyle,
    backgroundColor: stateStyles.backgroundColor,
    ...getShadowStyle(state === 'pressed' ? 'xs' : 'md', isDark),
  };
};

/**
 * Create typography style
 * @param size - Font size
 * @param weight - Font weight
 * @returns Typography style
 */
export const createTypography = (
  size: keyof typeof tokens.typography.fontSize = 'base',
  weight: keyof typeof tokens.typography.fontWeight = 'normal'
): TextStyle => {
  return {
    fontSize: tokens.typography.fontSize[size],
    fontWeight: String(tokens.typography.fontWeight[weight]) as TextStyle['fontWeight'],
    fontFamily: tokens.typography.fontFamily.default,
  };
};
