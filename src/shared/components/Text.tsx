import React, { memo } from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface TextProps extends RNTextProps {
  variant?: 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'small';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text = memo(({ variant = 'body', color, align = 'left', style, ...props }: TextProps) => {
  const theme = useTheme();
  
  return (
    <RNText
      style={[
        theme.typography[variant as keyof typeof theme.typography],
        { color: color || theme.colors.text, textAlign: align },
        style,
      ]}
      {...props}
    />
  );
});

Text.displayName = 'Text';
