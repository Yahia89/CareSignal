import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing as themeSpacing } from '../theme';

export interface SpacerProps {
  x?: keyof typeof themeSpacing;
  y?: keyof typeof themeSpacing;
  flex?: number;
}

export const Spacer = memo(({ x, y, flex }: SpacerProps) => {
  const theme = useTheme();

  return (
    <View
      style={{
        width: x ? theme.spacing[x] : undefined,
        height: y ? theme.spacing[y] : undefined,
        flex: flex !== undefined ? flex : undefined,
      }}
    />
  );
});

Spacer.displayName = 'Spacer';
