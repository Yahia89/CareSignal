import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface NeumorphicViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
  inset?: boolean;
}

export const NeumorphicView = memo(({ 
  children, 
  style, 
  containerStyle,
  borderRadius,
  inset = false 
}: NeumorphicViewProps) => {
  const theme = useTheme();
  const radius = borderRadius ?? theme.radii.lg;

  if (inset) {
    // Simulated inset look with borders
    return (
      <View
        style={[
          styles.insetOuter,
          {
            backgroundColor: theme.colors.background,
            borderRadius: radius,
            borderColor: theme.colors.darkShadow,
            borderWidth: 1,
          },
          containerStyle,
        ]}
      >
        <View
          style={[
            styles.insetInner,
            {
              borderRadius: radius - 1,
              borderColor: theme.colors.lightShadow,
              borderWidth: 1,
              padding: theme.spacing.md,
            },
            style,
          ]}
        >
          {children}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.outerShadow,
        {
          ...theme.shadows.neumorphic.light,
          borderRadius: radius,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.innerShadow,
          {
            ...theme.shadows.neumorphic.dark,
            backgroundColor: theme.colors.surface,
            borderRadius: radius,
            padding: theme.spacing.md,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outerShadow: {
    // iOS light shadow
  },
  innerShadow: {
    // iOS dark shadow + background
  },
  insetOuter: {
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  insetInner: {
    flex: 1,
  }
});
