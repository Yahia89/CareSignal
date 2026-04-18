import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../constants/theme';

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  leftBorderColor?: string;
  style?: ViewStyle;
}

export function AppCard({
  children,
  padding = Spacing.lg,
  radius = Radius.lg,
  leftBorderColor,
  style,
  ...rest
}: AppCardProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          borderRadius: radius,
          borderLeftColor: leftBorderColor ?? 'transparent',
          borderLeftWidth: leftBorderColor ? 4 : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    ...Shadows.md,
  },
});
