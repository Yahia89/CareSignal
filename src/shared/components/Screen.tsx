import React, { memo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  noSafeArea?: boolean;
}

export const Screen = memo(({ children, noSafeArea = false, style, ...props }: ScreenProps) => {
  const theme = useTheme();

  const content = (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]} {...props}>
      {children}
    </View>
  );

  if (noSafeArea) {
    return content;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {content}
    </SafeAreaView>
  );
});

Screen.displayName = 'Screen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
