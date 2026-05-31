import { Animated, Easing } from 'react-native';

/**
 * Centralised animation tokens — duration, easing, and small helpers for
 * the patterns we re-use (slide, fade, scale). Whenever a screen needs a
 * transition, import from here instead of hand-rolling timing values.
 */

// ── Durations (ms) ─────────────────────────────────────────────────────────
export const animDuration = {
  fast: 150,         // micro-interactions (switch toggle, hover-ish)
  base: 220,         // default — feels swift but not snappy
  slow: 320,         // bigger movements (sheet open, page transitions)
} as const;

// ── Easings ────────────────────────────────────────────────────────────────
// Swift snap, decelerates into place. Best for "the user pressed
// something, snap to the new state" feel.
export const easingSwift = Easing.out(Easing.cubic);
// Gentle ease in/out. Best for soft cross-fades.
export const easingSoft = Easing.bezier(0.4, 0, 0.2, 1);

// ── Spring presets ─────────────────────────────────────────────────────────
// Tight, near-no-overshoot spring for indicator slides.
export const springSnappy = {
  useNativeDriver: true,
  tension: 220,
  friction: 26,
} as const;

// Slightly bouncier spring for "playful" transitions (rarely used).
export const springPlayful = {
  useNativeDriver: true,
  tension: 140,
  friction: 14,
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Slide an `Animated.Value` to a target position with the swift cubic-out
 * easing. Best for indicator/selection transitions that should feel snappy
 * without overshoot.
 */
export function slideTo(
  value: Animated.Value,
  toValue: number,
  duration: number = animDuration.base,
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: easingSwift,
    useNativeDriver: true,
  });
}

/**
 * Fade an `Animated.Value` between `0` and `1` with soft easing.
 */
export function fadeTo(
  value: Animated.Value,
  toValue: number,
  duration: number = animDuration.base,
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: easingSoft,
    useNativeDriver: true,
  });
}
