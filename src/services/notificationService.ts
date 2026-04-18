import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const MOCK_DELAY = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async registerPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('[notifications] Push notifications require a physical device.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[notifications] Push notification permission not granted.');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('[notifications] Expo push token:', token);
    return token;
  },

  async sendTokenToServer(token: string, userId: string): Promise<void> {
    await delay(MOCK_DELAY);
    console.log(`[mock] Push token ${token} registered for user ${userId}`);
  },

  scheduleLocalNotification(title: string, body: string, seconds = 1): void {
    Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
    }).catch(console.error);
  },

  addNotificationReceivedListener(
    handler: (notification: Notifications.Notification) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(handler);
  },

  addNotificationResponseListener(
    handler: (response: Notifications.NotificationResponse) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },

  removeSubscription(subscription: Notifications.Subscription): void {
    subscription.remove();
  },
};
