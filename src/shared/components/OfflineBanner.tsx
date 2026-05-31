import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useOnlineStatus } from '../hooks';
import { spacing, figmaColor, figmaFont } from '../design';
import { interFamilyForWeight } from '../design/tokens/utils';

/**
 * Top-of-screen banner that shows when the device is offline. Renders nothing
 * when online, so it's safe to mount globally.
 */
export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <View style={styles.banner} accessible accessibilityRole="alert">
      <WifiOff size={14} color={figmaColor.textInverse} strokeWidth={2.4} />
      <Text style={styles.text}>You're offline — some actions may fail</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: figmaColor.red,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[8],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: interFamilyForWeight(600),
    color: figmaColor.textInverse,
    fontSize: figmaFont.small,
    marginLeft: spacing[8],
  },
});
