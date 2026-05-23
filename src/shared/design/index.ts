/**
 * Design System - Complete export
 * All design tokens, hooks, utilities, and components in one place
 */

// ============================================================================
// TOKENS
// ============================================================================
export * from './tokens/index';
export { useTokens, useThemeMode, useColors, useShadows, useSpacing, useBorderRadius } from './tokens/useTokens';
export * from './tokens/utils';

// Figma-derived design tokens (colours, font sizes, radii used across the
// new screens). Always prefer these over inline hex / px values.
export { figma, figmaColor, figmaFont, figmaRadius } from './figma';

// Animation tokens (durations, easings, spring presets, helpers). Use
// `slideTo` / `fadeTo` instead of hand-rolling Animated.timing values.
export {
  animDuration,
  easingSwift,
  easingSoft,
  springSnappy,
  springPlayful,
  slideTo,
  fadeTo,
} from './animations';

// ============================================================================
// THEME
// ============================================================================
export { ThemeProvider, ThemeContext } from './theme/ThemeContext';
export type { ThemeContextType, ThemeMode } from './theme/ThemeContext';

// ============================================================================
// COMPONENTS
// ============================================================================
export { NeuButton, NeuCard } from './components';
