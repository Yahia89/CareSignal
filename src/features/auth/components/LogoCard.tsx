import React, { useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { colors, spacing, borderRadius, getShadowStyle } from '../../../shared/design';
import { CARESIGNAL_LOGO_DATA_URI } from './logoData';

/**
 * White rounded "CareSignal by MedTech Care" card used at the top of the
 * auth screens.
 *
 * Logo source strategy: try `require('../../assets/...png')` first (bundled
 * asset, fast). If that fails (e.g. asset registry was stale at compile
 * time), fall back to the inlined base64 data URI so the user always sees
 * a logo regardless of build state. If both fail, render a labelled
 * placeholder so debugging is obvious.
 */
const REQUIRED_LOGO = require('../../../../assets/caresignal-logo.png');

export const LogoCard = () => {
  const [stage, setStage] = useState<'require' | 'datauri' | 'failed'>('require');

  const source =
    stage === 'require'
      ? REQUIRED_LOGO
      : stage === 'datauri'
        ? { uri: CARESIGNAL_LOGO_DATA_URI }
        : null;

  return (
    <View style={styles.card}>
      {source ? (
        <Image
          source={source}
          style={styles.logo}
          resizeMode="contain"
          onError={(e) => {
            // eslint-disable-next-line no-console
            console.warn(
              `LogoCard: ${stage} source failed —`,
              e.nativeEvent?.error ?? '(no error message)'
            );
            setStage(stage === 'require' ? 'datauri' : 'failed');
          }}
        />
      ) : (
        <Text style={styles.fallback}>CareSignal logo failed to load</Text>
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
    minHeight: 78, // 46 (logo) + 32 (vertical padding)
    justifyContent: 'center',
  },
  logo: {
    width: 167,
    height: 46,
  },
  fallback: {
    color: colors.semantic.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
