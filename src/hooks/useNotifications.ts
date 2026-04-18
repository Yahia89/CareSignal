import { useCallback, useEffect, useRef } from 'react';
import { Subscription } from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

export function useNotifications() {
  const { user } = useAuthStore();
  const receivedSub = useRef<Subscription | null>(null);
  const responseSub = useRef<Subscription | null>(null);

  const registerForPushNotifications = useCallback(async () => {
    const token = await notificationService.registerPushToken();
    if (token && user) {
      await notificationService.sendTokenToServer(token, user.id);
    }
  }, [user]);

  useEffect(() => {
    receivedSub.current = notificationService.addNotificationReceivedListener((notification) => {
      console.log('[notification received]', notification.request.content.title);
    });

    responseSub.current = notificationService.addNotificationResponseListener((response) => {
      console.log('[notification tapped]', response.notification.request.content.title);
    });

    return () => {
      if (receivedSub.current) notificationService.removeSubscription(receivedSub.current);
      if (responseSub.current) notificationService.removeSubscription(responseSub.current);
    };
  }, []);

  return { registerForPushNotifications };
}
