import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { HeartPulse, Wifi } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../../shared/design';
import { CARESIGNAL_LOGO_DATA_URI } from './logoData';

const LOGO_FILE_NAME = 'caresignal-logo.png';

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
/**
 * Decode a base64 string to raw bytes. Avoids relying on `File.write`'s
 * `encoding: 'base64'` option, which on Android Glide produced "Problem
 * decoding into existing bitmap" — likely because the option wrote the
 * base64 *text* to disk rather than its decoded bytes.
 */
function base64ToUint8Array(b64: string): Uint8Array {
  // atob is available in Hermes / RN out of the box.
  const binary = global.atob ? global.atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function useLogoFileUri(): { uri: string | null; failed: boolean } {
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const file = new File(Paths.cache, LOGO_FILE_NAME);

        // Always rewrite to be safe — if a previous attempt wrote the
        // base64 *text* (which produces a non-decodable bitmap), the
        // file would already exist with bad content. Cheap operation.
        const idx = CARESIGNAL_LOGO_DATA_URI.indexOf(',');
        const b64 = idx >= 0 ? CARESIGNAL_LOGO_DATA_URI.slice(idx + 1) : CARESIGNAL_LOGO_DATA_URI;
        const bytes = base64ToUint8Array(b64);

        if (file.exists) {
          file.delete();
        }
        file.create();
        file.write(bytes);

        // Cache-bust the URI so Glide doesn't serve a previously-failed
        // bitmap from its in-memory cache.
        const bustedUri = `${file.uri}?v=${Date.now()}`;
        if (!cancelled) setUri(bustedUri);
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
      android: { elevation: 6 },
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
