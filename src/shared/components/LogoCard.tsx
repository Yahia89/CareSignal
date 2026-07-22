import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
// Use the legacy File API — it has explicit base64-decoding via
// EncodingType.Base64 that's known-good across SDK versions. The new
// SDK 54 File.write(Uint8Array) was producing files Glide rejected
// with "Problem decoding into existing bitmap".
import * as FileSystem from 'expo-file-system/legacy';
import { HeartPulse, Wifi } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../design';
import { interFamilyForWeight } from '../design/tokens/utils';
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
        const cacheDir = FileSystem.cacheDirectory;
        if (!cacheDir) throw new Error('No cache directory available');
        const path = cacheDir + LOGO_FILE_NAME;

        // Best-effort: drop any stale logos from previous sessions so the
        // cache dir doesn't grow unbounded. Failures here are non-fatal.
        try {
          const entries = await FileSystem.readDirectoryAsync(cacheDir);
          await Promise.all(
            entries
              .filter((e: string) => e.startsWith('caresignal-logo-') && e !== LOGO_FILE_NAME)
              .map((e: string) => FileSystem.deleteAsync(cacheDir + e, { idempotent: true }))
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
        await FileSystem.writeAsStringAsync(path, b64, {
          encoding: 'base64' as any,
        });

        // Sanity-check that the bytes actually landed (8927 = original PNG)
        const info = await FileSystem.getInfoAsync(path);
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
 * "CareSignal by MedTech Care" header used at the top of the auth screens.
 *
 * No visible card background — page bg shows through. Only a subtle bottom
 * shadow / hairline separates the logo region from the form below. This
 * matches the Figma render where the page bg (#EEF1F5) and card bg
 * (#F1F5F9) are nearly identical hexes, so the "card" effectively
 * dissolves into the page; the only visible boundary is a soft bottom edge.
 *
 * Logo image: PNG materialized to disk on first load (see useLogoFileUri),
 * loaded via file:// URI through RN's standard <Image>. Programmatic
 * lucide-icon fallback only renders if both write+load fail.
 */
interface LogoCardProps {
  /**
   * Render the soft bottom shadow fade. Default true. Pass `false` when the
   * LogoCard is nested inside a parent container that already provides its
   * own visual boundary (e.g. the white header section in CheckInHome).
   */
  showSeparator?: boolean;
}

export const LogoCard = ({ showSeparator = true }: LogoCardProps = {}) => {
  const { uri, failed: writeFailed } = useLogoFileUri();
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const showFallback = writeFailed || imageLoadFailed;

  return (
    <View style={[styles.container, showSeparator && styles.containerShadow]}>
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
        <View style={styles.logo} />
      )}
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

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    paddingLeft: spacing[4],
    paddingRight: spacing[16],
    backgroundColor: 'transparent',
  },
  containerShadow: {
    shadowColor: '#C9D8E8',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  logo: {
    width: 167,
    height: 46,
  },

  // Fallback layout
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 56, height: 50, justifyContent: 'center', alignItems: 'center' },
  signalWrap: { position: 'absolute', top: -4, right: -2, transform: [{ rotate: '45deg' }] },
  textWrap: { marginLeft: spacing[8], flexShrink: 1 },
  wordmark: {
    fontSize: 26,
    fontFamily: interFamilyForWeight(700),
    color: colors.accent.primary,
    letterSpacing: 0.1,
    lineHeight: 30,
  },
  tagline: {
    fontSize: 12,
    fontFamily: interFamilyForWeight(500),
    color: colors.text.primary,
    marginTop: 2,
    letterSpacing: 0.6,
  },
});
