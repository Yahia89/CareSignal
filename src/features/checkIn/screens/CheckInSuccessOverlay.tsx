import React, { useEffect, useRef } from 'react';
import { Animated, View, Text as RNText, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { Check } from 'lucide-react-native';
import { CheckInStatus } from '../../../types';
import { spacing, borderRadius } from '../../../shared/design';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';

/** Per-status palette — mirrors the status cards on CheckInHome. */
const THEME: Record<CheckInStatus, { bg: string; fg: string; confetti: string[] }> = {
  ok: {
    bg: '#E6F4EA',
    fg: '#2E7D32',
    confetti: ['#2E7D32', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7'],
  },
  needs_help: {
    bg: '#FBF0DA',
    fg: '#B7791F',
    confetti: ['#B7791F', '#D4A017', '#E0B341', '#ECC76B', '#F2D89A'],
  },
  urgent: {
    bg: '#FBE3E0',
    fg: '#D32F2F',
    confetti: ['#D32F2F', '#E25241', '#EC7063', '#F1948A', '#F5B7B1'],
  },
};

/** Title + body copy shown on the success screen, per status. `{name}` is filled in. */
const CONTENT: Record<CheckInStatus, { title: string; lines: string[] }> = {
  ok: {
    title: "I'm OK",
    lines: [
      'Thanks for checking in, {name}.',
      "We're happy to know you're feeling okay today.",
      'Please capture blood sugar or blood pressure',
    ],
  },
  needs_help: {
    title: 'I Need Help',
    lines: [
      "We've notified your support circle, {name}.",
      'Help is on the way — stay calm.',
      'Please capture blood sugar or blood pressure',
    ],
  },
  urgent: {
    title: 'Urgent Help',
    lines: [
      'Alerting urgent help now, {name}.',
      'Help is coming right away.',
      'Please capture blood sugar or blood pressure',
    ],
  },
};

/**
 * Deterministic scatter of confetti pieces across the card (matches the
 * design's settled-confetti look). Values are percentages of the card box;
 * `c` indexes into the theme's confetti palette.
 */
const CONFETTI_LAYOUT: { left: number; top: number; size: number; rot: number; c: number }[] = [
  { left: 10, top: 12, size: 10, rot: 18, c: 1 },
  { left: 22, top: 30, size: 7, rot: -25, c: 3 },
  { left: 18, top: 46, size: 12, rot: 40, c: 0 },
  { left: 30, top: 8, size: 8, rot: -10, c: 2 },
  { left: 38, top: 24, size: 6, rot: 30, c: 4 },
  { left: 33, top: 52, size: 9, rot: -35, c: 1 },
  { left: 48, top: 14, size: 7, rot: 12, c: 3 },
  { left: 50, top: 40, size: 11, rot: -20, c: 0 },
  { left: 58, top: 26, size: 6, rot: 45, c: 2 },
  { left: 62, top: 10, size: 9, rot: -15, c: 4 },
  { left: 66, top: 48, size: 8, rot: 22, c: 1 },
  { left: 72, top: 32, size: 7, rot: -40, c: 3 },
  { left: 78, top: 16, size: 10, rot: 16, c: 0 },
  { left: 82, top: 44, size: 6, rot: -28, c: 2 },
  { left: 88, top: 28, size: 8, rot: 35, c: 4 },
  { left: 14, top: 58, size: 7, rot: -18, c: 2 },
  { left: 44, top: 60, size: 9, rot: 26, c: 4 },
  { left: 70, top: 60, size: 7, rot: -32, c: 0 },
  { left: 26, top: 18, size: 6, rot: 50, c: 0 },
  { left: 56, top: 54, size: 8, rot: -12, c: 3 },
];

interface CheckInSuccessOverlayProps {
  status: CheckInStatus;
  name: string;
  onDone: () => void;
  /** How long the success screen stays up before auto-dismissing. */
  durationMs?: number;
}

/**
 * Celebratory confirmation card shown right after a status check-in (State 2
 * in the design). It occupies the content area BELOW the header — the header
 * (logo + Settings) stays visible — animates a scaling checkmark with a burst
 * of scattered confetti, holds for `durationMs`, then calls `onDone` so the
 * parent reveals the collapsed status + vital-capture view (State 3).
 *
 * Built entirely on the RN `Animated` API (no extra deps), native-driven.
 */
export const CheckInSuccessOverlay = ({
  status,
  name,
  onDone,
  durationMs = 3000,
}: CheckInSuccessOverlayProps) => {
  const theme = THEME[status];
  const content = CONTENT[status];
  const { height } = useWindowDimensions();

  const cardFade = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.3)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const confetti = useRef(
    CONFETTI_LAYOUT.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(textFade, {
        toValue: 1,
        duration: 420,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.stagger(
        25,
        confetti.map((v) =>
          Animated.timing(v, {
            toValue: 1,
            duration: 650,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(cardFade, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(() => onDone());
    }, durationMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lines = content.lines.map((l) => l.replace('{name}', name));

  return (
    <Animated.View style={[styles.card, { backgroundColor: theme.bg, minHeight: height * 0.74, opacity: cardFade }]}>
      {/* Scattered confetti layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {CONFETTI_LAYOUT.map((p, i) => {
          const v = confetti[i];
          if (!v) return null;
          // Each piece fades in while dropping a few px into place + spinning.
          const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] });
          const opacity = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1] });
          const rotate = v.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${p.rot}deg`],
          });
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size * 0.6,
                borderRadius: 2,
                backgroundColor: theme.confetti[p.c],
                opacity,
                transform: [{ translateY }, { rotate }],
              }}
            />
          );
        })}
      </View>

      {/* Checkmark */}
      <Animated.View
        style={[
          styles.checkCircle,
          { backgroundColor: theme.fg, transform: [{ scale: checkScale }] },
        ]}
      >
        <Check size={46} color="#FFFFFF" strokeWidth={3.5} />
      </Animated.View>

      <Animated.View style={{ opacity: textFade, alignItems: 'center' }}>
        <RNText style={[styles.title, { color: theme.fg }]}>{content.title}</RNText>
        <View style={{ height: spacing[16] }} />
        {lines.slice(0, 2).map((line, idx) => (
          <RNText key={idx} style={styles.body}>
            {line}
          </RNText>
        ))}
        <View style={{ height: spacing[16] }} />
        <RNText style={styles.hint}>{lines[2]}</RNText>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[24],
    paddingVertical: spacing[32],
    overflow: 'hidden',
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[24],
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: interFamilyForWeight(700),
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: interFamilyForWeight(400),
    color: '#333333',
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(400),
    color: '#444444',
    textAlign: 'center',
  },
});
