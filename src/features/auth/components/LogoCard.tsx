import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { HeartPulse, Wifi } from 'lucide-react-native';
import { colors, spacing, borderRadius, getShadowStyle } from '../../../shared/design';

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * auth screens.
 *
 * Implementation: rendered programmatically using lucide-react-native icons
 * + <Text>. Earlier attempts with require() of a PNG and an inlined base64
 * data URI both failed silently on the user's Android dev build (likely a
 * native asset-registry mismatch from the originally-built APK). Vector
 * icons + text always render — no asset registry, no data-URI parser.
 *
 * When the team wants the exact custom logo from Figma, replace this entire
 * View tree with `<Image source={require('.../caresignal-logo.png')} />`
 * once the dev APK is rebuilt with the asset present at compile time.
 */
export const LogoCard = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <HeartPulse size={36} color={colors.accent.primary} strokeWidth={2.5} fill={colors.accent.primary} />
        <View style={styles.signalWrap} pointerEvents="none">
          <Wifi size={14} color={colors.accent.primary} strokeWidth={2.5} />
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
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[20],
    ...getShadowStyle('md'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Small "wifi" rotated 45° so the arcs visually radiate from the upper-
  // right of the heart — closest no-dependency approximation of the Figma
  // logo's signal lines.
  signalWrap: {
    position: 'absolute',
    top: -2,
    right: -2,
    transform: [{ rotate: '45deg' }],
  },
  textWrap: {
    marginLeft: spacing[12],
    flexShrink: 1,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent.primary,
    letterSpacing: 0.1,
    lineHeight: 26,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.primary,
    marginTop: 2,
    letterSpacing: 0.6,
  },
});
