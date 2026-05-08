import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { HeartPulse, Wifi } from 'lucide-react-native';
import { colors, spacing, borderRadius, getShadowStyle } from '../../../shared/design';
import { CARESIGNAL_LOGO_DATA_URI } from './logoData';

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * auth screens.
 *
 * Logo loading strategy (in order):
 *   1. expo-image with the inlined base64 data URI. expo-image's loader
 *      handles long base64 URIs reliably on Android where core RN's
 *      <Image> failed silently in this project.
 *   2. If that fails, fall back to a programmatic vector logo built from
 *      lucide icons + Text — always renders.
 *
 * expo-image is already a project dep; no install needed.
 */
export const LogoCard = () => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View style={styles.card}>
      {!imageFailed ? (
        <ExpoImage
          source={CARESIGNAL_LOGO_DATA_URI}
          style={styles.logo}
          contentFit="contain"
          onError={(e) => {
            // eslint-disable-next-line no-console
            console.warn('LogoCard expo-image failed:', e?.error ?? '(no error)');
            setImageFailed(true);
          }}
        />
      ) : (
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <HeartPulse
              size={36}
              color={colors.accent.primary}
              strokeWidth={2.5}
              fill={colors.accent.primary}
            />
            <View style={styles.signalWrap} pointerEvents="none">
              <Wifi size={14} color={colors.accent.primary} strokeWidth={2.5} />
            </View>
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.wordmark}>CareSignal</Text>
            <Text style={styles.tagline}>by MedTech Care</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[20],
    ...getShadowStyle('md'),
    minHeight: 78,
    justifyContent: 'center',
  },
  logo: {
    width: 167,
    height: 46,
  },

  // Programmatic-fallback styles (only used if expo-image fails)
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 40, justifyContent: 'center', alignItems: 'center' },
  signalWrap: { position: 'absolute', top: -2, right: -2, transform: [{ rotate: '45deg' }] },
  textWrap: { marginLeft: spacing[12], flexShrink: 1 },
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
