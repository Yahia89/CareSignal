import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import {
  spacing,
  borderRadius,
  figmaColor,
  figmaFont,
  slideTo,
  animDuration,
} from '../design';
import { interFamilyForWeight } from '../design/tokens/utils';

export interface SegmentedControlOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const TRACK_PADDING = spacing[4];


/**
 * Pill-style segmented control with a sliding selection indicator.
 *
 * The indicator is an absolutely-positioned navy pill that animates its
 * `translateX` whenever `value` changes. Width per segment is measured on
 * the track's onLayout pass, so the indicator stays correct across rotations
 * and dynamic option counts.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onValueChange,
  disabled,
  style,
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0);
  const segmentWidth = trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / options.length : 0;

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const slideX = useRef(new Animated.Value(selectedIndex * segmentWidth)).current;

  // Animate to the new index whenever value or measured width changes.
  // Uses the shared `slideTo` helper (cubic-out, no overshoot, native-driven).
  useEffect(() => {
    if (segmentWidth <= 0) return;
    slideTo(slideX, selectedIndex * segmentWidth, animDuration.fast).start();
  }, [selectedIndex, segmentWidth, slideX]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackWidth(w);
    // First measure: snap the indicator to the right place without animating.
    const targetX = selectedIndex * ((w - TRACK_PADDING * 2) / options.length);
    slideX.setValue(targetX);
  };

  return (
    <View
      style={[styles.track, disabled && { opacity: 0.5 }, style]}
      onLayout={handleLayout}
    >
      {/* Sliding selection indicator */}
      {segmentWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: segmentWidth,
              transform: [{ translateX: slideX }],
            },
          ]}
        />
      )}

      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            disabled={disabled}
            onPress={() => onValueChange(opt.value)}
            style={styles.segment}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, selected && styles.labelSelected]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    minHeight: 44,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: figmaColor.border,
    backgroundColor: figmaColor.surface,
    overflow: 'hidden',
    padding: TRACK_PADDING,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    bottom: TRACK_PADDING,
    backgroundColor: figmaColor.titleNavy,
    borderRadius: borderRadius.full,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.full,
    zIndex: 1,
  },
  label: {
    fontFamily: interFamilyForWeight(500),
    fontSize: figmaFont.body,
    color: figmaColor.titleNavy,
  },
  labelSelected: {
    color: figmaColor.textInverse,
    fontFamily: interFamilyForWeight(700),
  },
});
