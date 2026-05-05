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
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  title,
  onPress,
  size = 'md',
  state = 'default',
  loading = false,
  variant = 'primary',
  style,
}) => {
  const { isDark } = useThemeMode();
  const isDisabled = state === 'disabled' || loading;

  const buttonStyle = createNeuButtonStyle(state, size, isDark);
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
        <ActivityIndicator color={colors.text.inverse} />
      ) : (
        <Text
          style={[
            textStyle,
            {
              color: variant === 'primary' ? colors.text.inverse : colors.accent.primary,
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
  secondaryButton: {
    backgroundColor: colors.surface.light,
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
});
