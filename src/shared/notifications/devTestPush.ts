import * as Notifications from 'expo-notifications';
import { pushService } from './services/pushService';

/**
 * Dev helper: schedule a local notification or send a self-push via Expo.
 *
 * `localNow` — fires immediately via the OS; bypasses the network. Great for
 * confirming notification icon, channel, sound, and the listener wiring.
 *
 * `selfRemote` — hits Expo's push service with this device's own token. This
 * proves the full path (your token → Expo → FCM → device) works end-to-end,
 * which is the same path the backend will use.
 */
export const devTestPush = {
  async localNow(opts: { title?: string; body?: string; channel?: string; data?: object } = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: opts.title ?? 'Test (local)',
        body: opts.body ?? 'Local notification fired from devTestPush.localNow',
        data: opts.data ?? { type: 'help' },
        ...(opts.channel ? { android: { channelId: opts.channel } } : {}),
      } as any,
      trigger: null,
    });
  },

  async selfRemote(opts: { title?: string; body?: string; channel?: string; data?: object } = {}) {
    const token = await pushService.registerForPushNotificationsAsync();
    if (!token) {
      console.warn('[devTestPush] no token — cannot send remote test');
      return;
    }
    const payload = {
      to: token,
      sound: 'default',
      title: opts.title ?? 'Test (remote)',
      body: opts.body ?? 'Remote push fired from devTestPush.selfRemote',
      data: opts.data ?? { type: 'help' },
      channelId: opts.channel ?? 'help',
      priority: 'high',
    };
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      console.log('[devTestPush] selfRemote ←', res.status, body);
    } catch (err) {
      console.warn('[devTestPush] selfRemote ✗', err);
    }
  },
};
