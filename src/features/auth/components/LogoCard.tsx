import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { HeartPulse, Wifi } from 'lucide-react-native';
import { colors, spacing, borderRadius, getShadowStyle } from '../../../shared/design';

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * new auth screens.
 *
 * The Figma logo is a custom mark (heart with EKG line + signal arcs).
 * Until we have an exported asset, we approximate by stacking lucide's
 * `HeartPulse` (heart+EKG) with a small `Wifi` mark rotated to suggest the
 * radiating arcs in the upper-right.
 *
 * Swap the inner logo block for `<Image source={require(...)} />` once
 * the production asset lands.
 */
export const LogoCard = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <HeartPulse size={40} color={colors.accent.primary} strokeWidth={2.4} />
        <View style={styles.signalWrap} pointerEvents="none">
          <Wifi size={14} color={colors.accent.primary} strokeWidth={2.4} />
        </View>
      </View>
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
  iconWrap: {
    width: 48,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalWrap: {
    position: 'absolute',
    top: -2,
    right: -4,
    transform: [{ rotate: '45deg' }],
  },
  textWrap: {
    marginLeft: spacing[12],
    flexShrink: 1,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.accent.primary,
    letterSpacing: 0.1,
    lineHeight: 30,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 2,
    letterSpacing: 0.6,
  },
});
