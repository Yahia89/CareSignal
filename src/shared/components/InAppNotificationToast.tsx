import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText,
  Platform,
  StatusBar,
} from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Bell, AlertTriangle, Check, X } from 'lucide-react-native';
import { figmaColor, figmaFont, figmaRadius, spacing } from '../design';
import { interFamilyForWeight } from '../design/tokens/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type AlertType = 'ok' | 'help' | 'urgent' | 'default';

interface ToastData {
  id: string;
  title: string;
  body: string;
  alertType: AlertType;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Derive the accent type from the notification's data payload. */
function resolveAlertType(data: Record<string, unknown> | undefined): AlertType {
  const type = data?.type as string | undefined;
  if (type === 'urgent') return 'urgent';
  if (type === 'needs_help' || type === 'help') return 'help';
  if (type === 'ok' || type === 'checkin_reminder') return 'ok';
  return 'default';
}

const accentForType = (type: AlertType): string => {
  switch (type) {
    case 'urgent':
      return figmaColor.red;
    case 'help':
      return figmaColor.amber;
    case 'ok':
      return figmaColor.green;
    default:
      return figmaColor.titleNavy;
  }
};

const IconForType = ({ type, color }: { type: AlertType; color: string }) => {
  switch (type) {
    case 'urgent':
      return <AlertTriangle size={20} color={color} strokeWidth={2.4} />;
    case 'help':
      return <Bell size={20} color={color} strokeWidth={2.4} />;
    case 'ok':
      return <Check size={20} color={color} strokeWidth={2.4} />;
    default:
      return <Bell size={20} color={color} strokeWidth={2.4} />;
  }
};

// ── Constants ────────────────────────────────────────────────────────────────

const TOAST_HEIGHT = 88;
const SLIDE_DURATION_IN = 320;
const SLIDE_DURATION_OUT = 220;
const AUTO_DISMISS_MS = 4500;
const SWIPE_THRESHOLD = -30; // px upward to dismiss

// ── Component ────────────────────────────────────────────────────────────────

/**
 * A self-contained, globally-mounted toast that listens for foreground push
 * notifications via `expo-notifications` and shows an animated drop-down
 * from the top of the screen.
 *
 * Mount once in App.tsx — it renders nothing when idle.
 *
 * Features:
 * - Slides down from above the notch with swift cubic-out easing
 * - Left accent strip colored by notification type (green/amber/red/navy)
 * - Auto-dismisses after 4.5 s
 * - Swipe-up to dismiss early
 * - Tap to navigate (optional onPress callback)
 */
export const InAppNotificationToast = () => {
  // Use initialWindowMetrics (no provider needed) with a sensible fallback
  const topInset =
    initialWindowMetrics?.insets.top ??
    (Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ?? 24);
  const [toast, setToast] = useState<ToastData | null>(null);
  const translateY = useRef(new Animated.Value(-TOAST_HEIGHT - 60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimating = useRef(false);

  // ── Dismiss ──────────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    isAnimating.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -TOAST_HEIGHT - 60,
        duration: SLIDE_DURATION_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: SLIDE_DURATION_OUT,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimating.current = false;
      setToast(null);
    });
  }, [translateY, opacity]);

  // ── Show ─────────────────────────────────────────────────────────────────
  const show = useCallback(
    (data: ToastData) => {
      // If one is already showing, quick-dismiss first
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }

      // Reset position off-screen
      translateY.setValue(-TOAST_HEIGHT - 60);
      opacity.setValue(0);
      setToast(data);

      // Slide in
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: SLIDE_DURATION_IN,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: SLIDE_DURATION_IN,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });

      // Auto-dismiss
      dismissTimer.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    },
    [translateY, opacity, dismiss],
  );

  // ── Pan responder (swipe up to dismiss) ──────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        // Only allow upward drag
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < SWIPE_THRESHOLD) {
          dismiss();
        } else {
          // Snap back
          Animated.timing(translateY, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // ── Subscribe to expo-notifications ──────────────────────────────────────
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content;
      const title = content.title ?? '';
      const body = content.body ?? '';

      console.log('[InAppToast] notification received', { title, body, data: content.data });

      // Don't show a toast for silent/data-only notifications
      if (!title && !body) return;

      const alertType = resolveAlertType(content.data as Record<string, unknown>);

      show({
        id: notification.request.identifier,
        title,
        body,
        alertType,
      });
    });

    return () => sub.remove();
  }, [show]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  // ── Render nothing when idle ─────────────────────────────────────────────
  if (!toast) return null;

  const accent = accentForType(toast.alertType);
  const topOffset = topInset + spacing[4];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topOffset,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={dismiss}
        style={styles.touchable}
      >
        {/* Left accent strip */}
        <View style={[styles.accentStrip, { backgroundColor: accent }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: accent + '18' }]}>
            <IconForType type={toast.alertType} color={accent} />
          </View>

          {/* Text */}
          <View style={styles.textWrap}>
            <RNText style={styles.title} numberOfLines={1}>
              {toast.title}
            </RNText>
            {toast.body ? (
              <RNText style={styles.body} numberOfLines={2}>
                {toast.body}
              </RNText>
            ) : null}
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={dismiss}
            hitSlop={8}
            style={styles.closeBtn}
          >
            <X size={16} color={figmaColor.textMuted} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[12],
    right: spacing[12],
    zIndex: 99999,
    elevation: 99999,
  },
  touchable: {
    flexDirection: 'row',
    backgroundColor: figmaColor.cardBg,
    borderRadius: figmaRadius.card,
    overflow: 'hidden',
    // Shadow — matches the app's neumorphic "soft float" pattern
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
  },
  accentStrip: {
    width: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[12],
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[12],
  },
  textWrap: {
    flex: 1,
    marginRight: spacing[8],
  },
  title: {
    fontFamily: interFamilyForWeight(600),
    fontSize: figmaFont.bodyLg,
    color: figmaColor.titleNavy,
    lineHeight: 20,
  },
  body: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.body,
    color: figmaColor.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  closeBtn: {
    padding: spacing[4],
  },
});
