import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, Platform } from 'react-native';
// Use the legacy File API — it has explicit base64-decoding via
// EncodingType.Base64 that's known-good across SDK versions. The new
// SDK 54 File.write(Uint8Array) was producing files Glide rejected
// with "Problem decoding into existing bitmap".
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LegacyFS: typeof import('expo-file-system/build/legacy/FileSystem') = require('expo-file-system/legacy');
import { HeartPulse, Wifi } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../../shared/design';
import { CARESIGNAL_LOGO_DATA_URI } from './logoData';

// Use a unique filename per app launch. Android Glide caches bitmaps in a
// pool keyed by URI; a previous failed decode (when we briefly wrote bad
// bytes via the new-API File.write) poisons that pool entry, and every
// subsequent load of the *same URI* fails with "Problem decoding into
// existing bitmap" even when the file on disk is correct. A fresh URI
// per launch guarantees Glide allocates a new bitmap.
const SESSION_ID = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const LOGO_FILE_NAME = `caresignal-logo-${SESSION_ID}.png`;

/**
 * Materialize the base64 PNG (logoData.ts) into a real file in the OS
 * cache directory once per app launch, then return its `file://` URI so
 * RN's <Image> can load it via Glide / NSImage directly.
 *
 * Why: require()-bundled assets failed because the dev APK's native
 * asset registry was compiled before the file existed. Direct
 * `data:image/png;base64,...` URIs failed silently in core RN <Image>
 * and produced "Cannot load SVG from stream" in expo-image's cache
 * decoder. file:// URIs go through the standard image pipeline — most
 * reliable.
 */
function useLogoFileUri(): { uri: string | null; failed: boolean } {
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cacheDir = LegacyFS.cacheDirectory;
        if (!cacheDir) throw new Error('No cache directory available');
        const path = cacheDir + LOGO_FILE_NAME;

        // Best-effort: drop any stale logos from previous sessions so the
        // cache dir doesn't grow unbounded. Failures here are non-fatal.
        try {
          const entries = await LegacyFS.readDirectoryAsync(cacheDir);
          await Promise.all(
            entries
              .filter((e) => e.startsWith('caresignal-logo-') && e !== LOGO_FILE_NAME)
              .map((e) => LegacyFS.deleteAsync(cacheDir + e, { idempotent: true }))
          );
        } catch {
          // ignore
        }

        // Strip the "data:image/png;base64," prefix so we pass only the
        // raw base64 payload to writeAsStringAsync.
        const idx = CARESIGNAL_LOGO_DATA_URI.indexOf(',');
        const b64 = idx >= 0 ? CARESIGNAL_LOGO_DATA_URI.slice(idx + 1) : CARESIGNAL_LOGO_DATA_URI;

        // Always rewrite — covers the case where a previous attempt left
        // a bad/partial file at the same path.
        await LegacyFS.writeAsStringAsync(path, b64, {
          encoding: 'base64' as any,
        });

        // Sanity-check that the bytes actually landed (8927 = original PNG)
        const info = await LegacyFS.getInfoAsync(path);
        // eslint-disable-next-line no-console
        console.log(
          `LogoCard: wrote ${info.exists ? (info as any).size : '?'} bytes to ${path}`
        );

        if (!cancelled) setUri(path);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('LogoCard: failed to materialize logo file —', err);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { uri, failed };
}

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * auth screens.
 *
 * Card spec (exact Figma): #F1F5F9 fill, radius 16, padding 11/24/24/24,
 * dual neumorphic drop shadow (white -8/-8/16 + #C9D9E8 +8/+8/16).
 *
 * Logo image: PNG materialized to disk on first load (see useLogoFileUri),
 * loaded via file:// URI through RN's standard <Image>. Programmatic
 * lucide-icon fallback only renders if both write+load fail.
 */
export const LogoCard = () => {
  const { uri, failed: writeFailed } = useLogoFileUri();
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const showFallback = writeFailed || imageLoadFailed;

  return (
    <View style={styles.lightShadow}>
      <View style={styles.darkShadow}>
        <View style={styles.card}>
          {showFallback ? (
            <ProgrammaticLogo />
          ) : uri ? (
            <Image
              source={{ uri }}
              style={styles.logo}
              resizeMode="contain"
              onError={(e) => {
                // eslint-disable-next-line no-console
                console.warn(
                  'LogoCard file:// load failed —',
                  e.nativeEvent?.error ?? '(no message)'
                );
                setImageLoadFailed(true);
              }}
            />
          ) : (
            <View style={styles.logo} /> /* placeholder while file is being written */
          )}
        </View>
      </View>
    </View>
  );
};

const ProgrammaticLogo = () => (
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
);

const cardBackground = '#F1F5F9';
const lightShadowColor = '#FFFFFF';
const darkShadowColor = '#C9D9E8';

const styles = StyleSheet.create({
  // iOS: dual neumorphic shadow (light upper-left highlight + dark
  // lower-right shadow) — Figma values, full opacity.
  // Android: elevation gives a single neutral shadow we can't tint;
  // bumped DOWN to a barely-perceptible value so the card looks like
  // it floats just above the page rather than sitting in a deep well.
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
      android: {},
    }),
  },
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
        // Subtle: page bg #EEF1F5 and card bg #F1F5F9 are nearly identical,
        // so a heavy shadow makes the card look obviously distinct (not
        // the Figma intent). elevation 1.5 gives just a bottom-edge hint.
        elevation: 2,
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
    height: 121, // exact Figma frame height (not minHeight)
    // Logo sits at top-left per Figma padding (11/24/24/24); the empty
    // space below is intentional — see the Figma frame.
  },
  logo: {
    width: 167,
    height: 46,
  },

  // Fallback layout
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 56, height: 50, justifyContent: 'center', alignItems: 'center' },
  signalWrap: { position: 'absolute', top: -4, right: -2, transform: [{ rotate: '45deg' }] },
  textWrap: { marginLeft: spacing[8], flexShrink: 1 },
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
