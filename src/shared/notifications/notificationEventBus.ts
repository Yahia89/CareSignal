import { useEffect, useRef } from 'react';
import type { Notification } from 'expo-notifications';

type NotificationCallback = (notification: Notification) => void;

/**
 * Lightweight pub/sub for broadcasting foreground push notifications to any
 * interested screen (AlertsScreen, FamilyDashboard, etc.) so they can
 * auto-refresh without a manual pull-to-refresh.
 *
 * Why an event bus instead of React Context?
 * - Zero re-renders on the provider tree when a notification arrives.
 * - Screens opt-in with `useOnNotificationReceived` — no wrapper needed.
 * - Trivially testable (subscribe → emit → assert callback).
 */
const subscribers = new Set<NotificationCallback>();

export const notificationEventBus = {
  /** Register a callback. Returns an unsubscribe function. */
  subscribe(cb: NotificationCallback): () => void {
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  },

  /** Broadcast a notification to all current subscribers. */
  emit(notification: Notification): void {
    subscribers.forEach((cb) => {
      try {
        cb(notification);
      } catch (e) {
        console.warn('[notificationEventBus] subscriber threw', e);
      }
    });
  },
};

/**
 * React hook — calls `callback` whenever a foreground push notification is
 * received. The callback is kept stable via a ref so the subscription is
 * created only once (no re-subscribe on every render).
 */
export function useOnNotificationReceived(callback: NotificationCallback): void {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  });

  useEffect(() => {
    const unsub = notificationEventBus.subscribe((n) => cbRef.current(n));
    return unsub;
  }, []);
}
