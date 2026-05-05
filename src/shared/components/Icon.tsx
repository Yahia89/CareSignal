import React, { memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { icons } from 'lucide-react-native';

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon = memo(({ name, size = 24, color }: IconProps) => {
  const theme = useTheme();
  const LucideIcon = icons[name];
  
  if (!LucideIcon) return null;

  return <LucideIcon size={size} color={color || theme.colors.text} />;
});

Icon.displayName = 'Icon';
