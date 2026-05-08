import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { HeartPulse, Wifi } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../../shared/design';

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * auth screens.
 *
 * Card spec (exact Figma values):
 *   - Width 390 (full screen on iPhone 13/14), height 121
 *   - Background #F1F5F9 (NOT white — same as input fill)
 *   - Border radius 16
 *   - Padding 11 top / 24 right / 24 bottom / 24 left
 *   - Dual neumorphic drop shadow:
 *       light: -8/-8, blur 16, #FFFFFF
 *       dark : +8/+8, blur 16, #C9D9E8
 *
 * Logo: rendered programmatically (lucide icons + Text) because both
 * `require()` of a PNG asset and base64 data URIs failed on the user's
 * Android dev build (the latter with a "Cannot load SVG from stream"
 * error from expo-image's cache decoder). Once the dev APK is rebuilt
 * with the asset bundled at compile time, this can be swapped for a
 * single <Image source={require('.../caresignal-logo.png')} /> in one
 * edit.
 *
 * Dual shadow caveat: iOS RN supports shadowColor/shadowOffset/
 * shadowOpacity natively, so both shadows render. Android uses
 * `elevation` which is a single neutral shadow — the inner dark shadow
 * still works, but the outer light highlight is approximated.
 */
export const LogoCard = () => (
  <View style={styles.lightShadow}>
    <View style={styles.darkShadow}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <HeartPulse
              size={42}
              color={colors.accent.primary}
              strokeWidth={2.6}
              fill={colors.accent.primary}
            />
            <View style={styles.signalWrap} pointerEvents="none">
              <Wifi size={16} color={colors.accent.primary} strokeWidth={2.6} />
            </View>
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.wordmark}>CareSignal</Text>
            <Text style={styles.tagline}>by MedTech Care</Text>
          </View>
        </View>
      </View>
    </View>
  </View>
);

const cardBackground = '#F1F5F9';
const lightShadowColor = '#FFFFFF';
const darkShadowColor = '#C9D9E8';

const styles = StyleSheet.create({
  // Outer wrapper — casts the light highlight from upper-left.
  // (iOS only: Android collapses both into a single neutral elevation.)
  lightShadow: {
    borderRadius: borderRadius.lg,
    backgroundColor: cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: lightShadowColor,
        shadowOffset: { width: -8, height: -8 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        // Android: rely on the inner dark shadow elevation only.
      },
    }),
  },
  // Inner wrapper — casts the dark shadow from lower-right.
  darkShadow: {
    borderRadius: borderRadius.lg,
    backgroundColor: cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: darkShadowColor,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  card: {
    backgroundColor: cardBackground,
    borderRadius: borderRadius.lg,
    paddingTop: 11,
    paddingRight: spacing[24],
    paddingBottom: spacing[24],
    paddingLeft: spacing[24],
    minHeight: 121,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 56,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalWrap: {
    position: 'absolute',
    top: -4,
    right: -2,
    transform: [{ rotate: '45deg' }],
  },

  textWrap: {
    marginLeft: spacing[8],
    flexShrink: 1,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.accent.primary,
    letterSpacing: 0.1,
    lineHeight: 30,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
    marginTop: 2,
    letterSpacing: 0.6,
  },
});
