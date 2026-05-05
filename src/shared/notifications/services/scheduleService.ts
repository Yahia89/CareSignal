import * as Notifications from 'expo-notifications';
import { Slot } from '../../types/domain';

export const scheduleService = {
  async scheduleCheckInNotification(slot: Slot, hour: number, minute: number) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Check-In',
        body: 'How are you today?',
        data: { slot },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  },

  async clearAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};
