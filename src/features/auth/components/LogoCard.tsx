import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { HeartPulse } from 'lucide-react-native';
import { colors, spacing, borderRadius, getShadowStyle } from '../../../shared/design';

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * new auth screens.
 *
 * NOTE: We use Lucide's `HeartPulse` (heart + EKG) as a stand-in for the
 * full custom logo (which also has wireless arcs). Swap the icon out for
 * an `<Image source={...} />` once an exported asset is available.
 */
export const LogoCard = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <HeartPulse size={36} color={colors.accent.primary} strokeWidth={2.5} />
      <View style={styles.textWrap}>
        <Text style={styles.wordmark}>CareSignal</Text>
        <Text style={styles.tagline}>by MedTech Care</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[20],
    paddingHorizontal: spacing[20],
    ...getShadowStyle('md'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textWrap: {
    marginLeft: spacing[12],
    flexShrink: 1,
  },
  wordmark: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent.primary,
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 2,
    letterSpacing: 0.4,
  },
});
