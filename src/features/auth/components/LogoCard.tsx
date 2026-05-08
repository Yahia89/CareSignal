import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors, spacing, borderRadius, getShadowStyle } from '../../../shared/design';
import { CARESIGNAL_LOGO_DATA_URI } from './logoData';

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * auth screens.
 *
 * The logo is inlined as a base64 data URI (see logoData.ts). We intentionally
 * skip the `require('../assets/...png')` path because Metro registers asset
 * URIs at build time, so adding a new asset to a previously-built dev APK
 * leaves the require() returning a stale "not found" reference until you
 * rebuild. Inline data URIs sidestep the registry entirely.
 *
 * Original asset is 489×135. We render at 167×46 — the size from the Figma
 * frame. resizeMode="contain" preserves the aspect ratio.
 */
export const LogoCard = () => (
  <View style={styles.card}>
    <Image
      source={{ uri: CARESIGNAL_LOGO_DATA_URI }}
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
