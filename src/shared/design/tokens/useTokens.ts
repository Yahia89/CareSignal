/**
 * Tokens Hook - Easy access to design tokens in components
 */

import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from '../theme/ThemeContext';
import * as defaultTokens from './index';

/**
 * Hook to access design tokens throughout the app
 * @returns All design tokens
 */
export const useTokens = () => {
  const theme = useContext(ThemeContext) as ThemeContextType;
  return defaultTokens;
};

/**
 * Hook to get current theme mode (light/dark)
 * @returns Current theme mode and toggle function
 */
export const useThemeMode = () => {
  const theme = useContext(ThemeContext) as ThemeContextType;
  return {
    mode: theme?.mode || 'light',
    isDark: theme?.mode === 'dark',
    toggleTheme: theme?.toggleTheme,
  };
};

/**
 * Hook to get colors for current theme
 * @returns Theme-appropriate color palette
 */
export const useColors = () => {
  const { mode } = useThemeMode();
  const tokens = useTokens();

  return {
    ...tokens.colors,
    background: mode === 'dark' ? tokens.colors.background.dark : tokens.colors.background.light,
    surface: mode === 'dark' ? tokens.colors.surface.dark : tokens.colors.surface.light,
  };
};

/**
 * Hook to get shadows for current theme
 * @returns Theme-appropriate shadows
 */
export const useShadows = () => {
  const { mode } = useThemeMode();
  const tokens = useTokens();

  return {
    elevation: {
      xs: mode === 'dark' ? tokens.shadows.elevation.xs.dark : tokens.shadows.elevation.xs.light,
      sm: mode === 'dark' ? tokens.shadows.elevation.sm.dark : tokens.shadows.elevation.sm.light,
      md: mode === 'dark' ? tokens.shadows.elevation.md.dark : tokens.shadows.elevation.md.light,
      lg: mode === 'dark' ? tokens.shadows.elevation.lg.dark : tokens.shadows.elevation.lg.light,
      xl: mode === 'dark' ? tokens.shadows.elevation.xl.dark : tokens.shadows.elevation.xl.light,
    },
  };
};

/**
 * Hook to get spacing tokens
 * @param size - Spacing size key
 * @returns Pixel value for spacing
 */
export const useSpacing = (size: keyof typeof defaultTokens.spacing) => {
  const tokens = useTokens();
  return tokens.spacing[size];
};

/**
 * Hook to get border radius
 * @param size - Border radius size key
 * @returns Pixel value for border radius
 */
export const useBorderRadius = (size: keyof typeof defaultTokens.borderRadius) => {
  const tokens = useTokens();
  return tokens.borderRadius[size];
};
