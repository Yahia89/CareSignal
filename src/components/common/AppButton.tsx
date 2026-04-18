import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';

interface AppButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.textInverse },
  secondary: { bg: Colors.card, text: Colors.primary, border: Colors.primary },
  success: { bg: Colors.success, text: Colors.textInverse },
  warning: { bg: Colors.warning, text: Colors.textInverse },
  danger: { bg: Colors.urgent, text: Colors.textInverse },
  ghost: { bg: 'transparent', text: Colors.primary, border: Colors.border },
};

const sizeStyles: Record<'sm' | 'md' | 'lg', { height: number; fontSize: number; paddingH: number }> = {
  sm: { height: 40, fontSize: Typography.fontSizeSm, paddingH: Spacing.md },
  md: { height: 52, fontSize: Typography.fontSizeMd, paddingH: Spacing.lg },
  lg: { height: 60, fontSize: Typography.fontSizeLg, paddingH: Spacing.xl },
};

export function AppButton({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  size = 'md',
  leftIcon,
  rightIcon,
  disabled,
  ...rest
}: AppButtonProps): React.JSX.Element {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: vs.bg,
          borderColor: vs.border ?? 'transparent',
          borderWidth: vs.border ? 1.5 : 0,
          height: ss.height,
          paddingHorizontal: ss.paddingH,
          alignSelf: fullWidth ? 'stretch' : 'center',
          opacity: isDisabled ? 0.55 : 1,
        },
      ]}
      disabled={isDisabled}
      activeOpacity={0.78}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <View style={styles.row}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.label, { color: vs.text, fontSize: ss.fontSize }]}>{label}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: Typography.fontWeightSemiBold,
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
