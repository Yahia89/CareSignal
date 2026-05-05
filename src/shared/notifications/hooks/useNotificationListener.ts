import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export function useNotificationListener() {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle foreground notification
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { slot } = response.notification.request.content.data;
      if (slot) {
        navigation.navigate('Elder', { screen: 'CheckInHome', params: { slot } });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [navigation]);
}
