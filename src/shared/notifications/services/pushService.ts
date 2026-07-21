import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { logger } from '../../utils/logger';

/**
 * Soft `expo-device` dependency — if the native module isn't linked into the
 * current APK (e.g. dep was added after the last native rebuild), we fall
 * back to assuming "is device". Real devices behave correctly; simulators
 * will simply fail at `getExpoPushTokenAsync` later, which we already handle.
 */
let isPhysicalDevice = true;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Device = require('expo-device');
  if (typeof Device.isDevice === 'boolean') {
    isPhysicalDevice = Device.isDevice;
  }
} catch {
  logger.warn('[push] expo-device not linked — skipping device check. Rebuild the APK to enable simulator detection.');
}

/**
 * How notifications behave when received while the app is in the foreground.
 *
 * All flags are enabled so the OS always presents the notification reliably.
 * Our custom `InAppNotificationToast` also fires via
 * `addNotificationReceivedListener` for a richer in-app experience.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Android notification channels — created once per install. Each maps to a
 * server-side notification category so the family device buzzes differently
 * for "help" vs "urgent" vs the daily check-in reminder. Channel id MUST
 * match what the backend puts in the Expo push payload's `channelId` field.
 */
async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1E3A5F',
  });
  await Notifications.setNotificationChannelAsync('checkin-reminder', {
    name: 'Daily Check-in Reminder',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1E3A5F',
  });
  await Notifications.setNotificationChannelAsync('help', {
    name: 'Senior needs help',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 400, 250, 400],
    lightColor: '#E0A93E',
  });
  await Notifications.setNotificationChannelAsync('urgent', {
    name: 'Urgent alert',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 600, 200, 600, 200, 600],
    lightColor: '#C0392B',
    bypassDnd: true,
  });
}

/**
 * Resolve the EAS projectId. Required by `getExpoPushTokenAsync()` on real
 * devices since SDK 49. We read from app.json → extra.eas.projectId via
 * `Constants`. If it's missing or still the placeholder, log clearly and
 * fall back to letting Expo auto-detect (works on dev client but fails on
 * a real release build).
 */
function resolveProjectId(): string | undefined {
  // SDK 50+: expoConfig.extra.eas.projectId
  // SDK <50: manifest.extra.eas.projectId
  const fromExpoConfig =
    (Constants.expoConfig as any)?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId ??
    (Constants.manifest as any)?.extra?.eas?.projectId;
  if (!fromExpoConfig || fromExpoConfig === 'REPLACE_WITH_EAS_PROJECT_ID') {
    logger.warn(
      '[push] EAS projectId is missing in app.json. Push tokens will fail on real Android devices. Run `npx eas init` and paste the id into app.json → extra.eas.projectId.',
    );
    return undefined;
  }
  return fromExpoConfig as string;
}

export const pushService = {
  /**
   * Request permission, ensure channels, return the Expo push token.
   *
   * Returns `undefined` in any of these expected-failure cases:
   *   - Running on iOS Simulator or non-Play emulator (no push capability)
   *   - User denied notification permission
   *   - EAS projectId missing AND not in a managed dev client
   *
   * Callers should treat `undefined` as "device cannot receive push" and
   * skip backend registration.
   */
  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (!isPhysicalDevice) {
      logger.warn('[push] Not a physical device — push not supported on simulators / non-Play emulators.');
      return;
    }

    await ensureAndroidChannels();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      logger.warn('[push] Notification permission denied.');
      return;
    }

    const projectId = resolveProjectId();
    try {
      const token = (
        await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        )
      ).data;
      return token;
    } catch (e) {
      logger.error('[push] Error getting Expo push token', e);
      return;
    }
  },
};
