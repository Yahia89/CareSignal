import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface GlossBackgroundProps {
  /** Top gradient color (lighter — the highlight). */
  from?: string;
  /** Bottom gradient color (slight tint — the soft shade). */
  to?: string;
  /** Corner radius of the filled rect (use a large value for a full pill). */
  radius?: number;
  /** Unique id so multiple gradients on one screen don't collide. */
  id?: string;
}

/**
 * Absolute-fill vertical gradient rendered with react-native-svg (already
 * linked in the app, so no extra native module / rebuild needed). Gives the
 * soft, glossy "liquid glass" surface from the design when placed behind a
 * pill's content. Parent should be `position: relative` and the content should
 * render after this so it sits on top.
 */
export const GlossBackground = ({
  from = '#FFFFFF',
  to = '#E4EBF5',
  radius = 999,
  id = 'gloss',
}: GlossBackgroundProps) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={from} />
        <Stop offset="1" stopColor={to} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" rx={radius} ry={radius} fill={`url(#${id})`} />
  </Svg>
);
