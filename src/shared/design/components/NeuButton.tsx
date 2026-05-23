/**
 * Neumorphic Button Component
 * Uses design tokens for consistent styling with neumorphic effect.
 *
 * Variants:
 *   - primary   (default): light raised pill, navy text. Used for most CTAs.
 *   - secondary           : outlined ghost button (transparent fill, green border).
 *   - filled              : solid dark-navy fill, white text. Used for "active"
 *                           toggle states (e.g. "Voice ON" in the Daily Checkin).
 *
 * Optional `icon` renders a Lucide-style component before the title with
 * an 8px gap. Pass it as a *component reference*, not an instance:
 *   <NeuButton icon={Smile} title="I'm OK" onPress={...} />
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useThemeMode } from '../tokens/useTokens';
import { createNeuButtonStyle, createTypography } from '../tokens/utils';
import { colors } from '../tokens';

export type NeuButtonVariant = 'primary' | 'secondary' | 'filled';

interface NeuButtonProps {
  title: string;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'pressed' | 'disabled';
  loading?: boolean;
  disabled?: boolean;
  variant?: NeuButtonVariant;
  icon?: LucideIcon;
  style?: ViewStyle;
}

const FILLED_BG = '#36597D'; // matches colors.text.primary (Figma navy)

export const NeuButton: React.FC<NeuButtonProps> = ({
  title,
  onPress,
  size = 'md',
  state = 'default',
  loading = false,
  disabled = false,
  variant = 'primary',
  icon: Icon,
  style,
}) => {
  const { isDark } = useThemeMode();
  const isDisabled = state === 'disabled' || loading || disabled;
  const effectiveState = isDisabled ? 'disabled' : state;

  const buttonStyle = createNeuButtonStyle(effectiveState, size, isDark);
  const textStyle = createTypography(size === 'sm' ? 'sm' : 'base', 'semibold');

  // Pick text + icon color based on variant
  const fgColor = isDisabled
    ? colors.text.disabled
    : variant === 'filled'
      ? colors.text.inverse
      : variant === 'secondary'
        ? colors.accent.primary
        : colors.text.primary;

  // Variant-specific overrides for the touchable
  const variantStyle: ViewStyle | null =
    variant === 'secondary'
      ? styles.secondaryButton
      : variant === 'filled'
        ? styles.filledButton
        : null;

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 20;

  return (
    <TouchableOpacity
      style={[buttonStyle, variantStyle, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? colors.text.inverse : colors.accent.primary} />
      ) : (
        <View style={styles.row}>
          {Icon ? (
            <View style={styles.iconWrap}>
              <Icon size={iconSize} color={fgColor} strokeWidth={2.2} />
            </View>
          ) : null}
          <Text
            style={[textStyle, { color: fgColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginRight: 8,
  },
  // Secondary: outlined ghost — transparent fill, green border, green text.
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  // Filled: solid dark-navy fill, white text. For active/toggle states.
  filledButton: {
    backgroundColor: FILLED_BG,
    shadowOpacity: 0.15,
  },
});
