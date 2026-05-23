import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, StyleProp, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Text } from './Text';
import { NeumorphicView } from './NeumorphicView';

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'neumorphic';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const Button = memo(({ 
  onPress, 
  title, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  backgroundColor: customBg,
  textColor: customText,
  style
}: ButtonProps) => {
  const theme = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    if (customBg) return customBg;
    if (variant === 'neumorphic') return theme.colors.surface;
    if (variant === 'ghost') return 'transparent';
    if (variant === 'danger') return theme.colors.danger;
    if (variant === 'secondary') return theme.colors.secondary;
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    if (customText) return customText;
    if (variant === 'neumorphic') return theme.colors.primary;
    if (variant === 'ghost') return theme.colors.primary;
    return theme.colors.surface;
  };

  const heights = { sm: 36, md: 48, lg: 56 };

  const content = (
    <View
      style={[
        styles.base,
        {
          height: heights[size],
          borderRadius: variant === 'neumorphic' ? theme.radii.md : theme.radii.md,
        }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text variant="heading" color={getTextColor()}>{title}</Text>
      )}
    </View>
  );

  if (variant === 'neumorphic') {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        disabled={disabled || loading}
        style={[style]}
      >
        <NeumorphicView
          borderRadius={theme.radii.md}
          style={{ padding: 0 }}
        >
          {content}
        </NeumorphicView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          height: heights[size],
          borderRadius: theme.radii.md,
          // Add subtle neumorphic shadow even to colored buttons if we want premium look
          shadowColor: theme.colors.darkShadow,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        },
        style
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text variant="heading" color={getTextColor()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
  }
});
