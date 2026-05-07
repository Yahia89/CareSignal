import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
}

/**
 * Thin wrapper around a lucide-react-native icon component.
 *
 * Usage:
 *   import { HeartPulse } from 'lucide-react-native';
 *   <Icon icon={HeartPulse} size={24} />
 *
 * The previous API took a string `name` and indexed `lucide.icons`, but
 * lucide-react-native no longer exposes that map — pass the component directly.
 */
export const Icon = memo(({ icon: LucideIconCmp, size = 24, color }: IconProps) => {
  const theme = useTheme();
  if (!LucideIconCmp) return null;
  return <LucideIconCmp size={size} color={color ?? theme.colors.text} />;
});

Icon.displayName = 'Icon';
