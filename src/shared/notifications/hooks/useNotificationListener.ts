import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { notificationEventBus } from '../notificationEventBus';

type PushData = {
  type?: string;
  slot?: 'morning' | 'afternoon' | 'evening';
  alertId?: string;
  [k: string]: unknown;
};

/**
 * Foreground reception logging + tap-to-open routing.
 *
 * The hook keeps a stable shape (always 5 hooks in the same order) so
 * Fast Refresh doesn't trip the Rules-of-Hooks warning. `role` is read
 * via a ref updated in an effect rather than as a render-time dep — the
 * listener subscriptions are created once and read the latest role at
 * tap time, instead of being torn down + recreated on every role change.
 */
export function useNotificationListener() {
  const navigation = useNavigation<any>();
  const { state } = useAuth();
  const roleRef = useRef<string | undefined>(state.user?.role);
  const receivedSub = useRef<Notifications.EventSubscription | null>(null);
  const responseSub = useRef<Notifications.EventSubscription | null>(null);

  // Keep the ref current without re-subscribing.
  useEffect(() => {
    roleRef.current = state.user?.role;
  }, [state.user?.role]);

  useEffect(() => {
    receivedSub.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[push] received (fg)', {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
      });

      // Broadcast to subscribed screens so they can auto-refresh
      notificationEventBus.emit(notification);
    });

    responseSub.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as PushData;
      const role = roleRef.current;
      console.log('[push] tapped', { role, data });

      if (role === 'elder' && (data.type === 'checkin_reminder' || data.slot)) {
        navigation.navigate('Elder', {
          screen: 'CheckInHome',
          params: { slot: data.slot },
        });
        return;
      }

      if (
        role === 'family' &&
        (data.type === 'help' || data.type === 'urgent' || data.type === 'missed' || data.alertId)
      ) {
        navigation.navigate('Family', { screen: 'Alerts' });
        return;
      }
    });

    return () => {
      receivedSub.current?.remove();
      responseSub.current?.remove();
    };
  }, [navigation]);
}
