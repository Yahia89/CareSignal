import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { figmaColor, figmaRadius } from '../design';

/**
 * Lightweight shimmer primitive — no extra deps. A solid base block with a
 * translucent highlight bar that sweeps across it on a loop. Designed to
 * stand in for content while it loads (matches Moti shimmer feel without
 * pulling in Reanimated).
 *
 * Usage:
 *   <SkeletonBlock width={120} height={16} />
 *   <SkeletonBlock height={48} radius="card" style={{ alignSelf: 'stretch' }} />
 */

type RadiusKey = keyof typeof figmaRadius | number;

export type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: RadiusKey;
  style?: StyleProp<ViewStyle>;
  /** Override the base block color (defaults to a soft surface tint). */
  baseColor?: string;
  /** Override the highlight color. */
  highlightColor?: string;
};

const DEFAULT_BASE = '#E2E8F0';
const DEFAULT_HIGHLIGHT = 'rgba(255, 255, 255, 0.65)';

function resolveRadius(radius: RadiusKey | undefined): number {
  if (radius == null) return figmaRadius.fieldSm;
  if (typeof radius === 'number') return radius;
  return figmaRadius[radius];
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width,
  height = 16,
  radius,
  style,
  baseColor = DEFAULT_BASE,
  highlightColor = DEFAULT_HIGHLIGHT,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (trackWidth === 0) return;
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [translateX, trackWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== trackWidth) setTrackWidth(w);
  };

  const highlightWidth = Math.max(trackWidth * 0.6, 80);
  const sweep = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [-highlightWidth, trackWidth + highlightWidth],
  });

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.block,
        {
          width: width as number | undefined,
          height,
          backgroundColor: baseColor,
          borderRadius: resolveRadius(radius),
        },
        style,
      ]}
    >
      {trackWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sweep,
            {
              width: highlightWidth,
              backgroundColor: highlightColor,
              transform: [{ translateX: sweep }],
            },
          ]}
        />
      ) : null}
    </View>
  );
};

/**
 * Container that lays out skeleton rows with consistent vertical spacing.
 */
export const SkeletonGroup: React.FC<{
  children: React.ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ children, gap = 12, style }) => (
  <View style={[{ gap }, style]}>{children}</View>
);

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
  sweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    opacity: 0.7,
  },
});

// Re-export figma color used as fallback so callers can theme if needed.
export const shimmerDefaults = {
  base: DEFAULT_BASE,
  highlight: DEFAULT_HIGHLIGHT,
  navy: figmaColor.titleNavy,
};
