/**
 * Neumorphic Card Component
 * Container with neumorphic depth and shadow
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useThemeMode } from '../tokens/useTokens';
import { createCardStyle } from '../tokens/utils';

interface NeuCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevated?: boolean;
}

export const NeuCard: React.FC<NeuCardProps> = ({ children, style, elevated = false }) => {
  const { isDark } = useThemeMode();
  const cardStyle = createCardStyle(isDark);

  return (
    <View
      style={[
        cardStyle,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  elevated: {
    // Additional elevation for cards that need more depth
    marginVertical: 8,
  },
});
