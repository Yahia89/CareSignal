/**
 * Neumorphic Button Component
 * Uses design tokens for consistent styling with neumorphic effect
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useThemeMode } from '../tokens/useTokens';
import { createNeuButtonStyle, createTypography } from '../tokens/utils';
import { colors } from '../tokens';

interface NeuButtonProps {
  title: string;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'pressed' | 'disabled';
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  title,
  onPress,
  size = 'md',
  state = 'default',
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const { isDark } = useThemeMode();
  const isDisabled = state === 'disabled' || loading || disabled;
  const effectiveState = isDisabled ? 'disabled' : state;

  const buttonStyle = createNeuButtonStyle(effectiveState, size, isDark);
  const textStyle = createTypography(size === 'sm' ? 'sm' : 'base', 'semibold');

  return (
    <TouchableOpacity
      style={[
        buttonStyle,
        variant === 'secondary' && styles.secondaryButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent.primary} />
      ) : (
        <Text
          style={[
            textStyle,
            {
              color:
                isDisabled
                  ? colors.text.disabled
                  : variant === 'primary'
                    ? colors.text.primary
                    : colors.accent.primary,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Secondary: outlined ghost button — transparent fill, green border, green text.
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
});
