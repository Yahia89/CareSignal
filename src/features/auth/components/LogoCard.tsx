import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors, spacing, borderRadius, getShadowStyle } from '../../../shared/design';

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * auth screens.
 *
 * The whole logo (heart + EKG + signal arcs + wordmark + tagline) is one
 * PNG asset exported from Figma. Original asset is 489×135 (≈3.62:1).
 * We render at 167×46 — the size shown in the Figma frame.
 */
export const LogoCard = () => (
  <View style={styles.card}>
    <Image
      source={require('../../../../assets/caresignal-logo.png')}
      style={styles.logo}
      resizeMode="contain"
      onError={(e) =>
        // eslint-disable-next-line no-console
        console.warn('LogoCard image failed to load:', e.nativeEvent?.error)
      }
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[20],
    ...getShadowStyle('md'),
  },
  logo: {
    width: 167,
    height: 46,
  },
});
