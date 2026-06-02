import { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushService } from '../services/pushService';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../../services/api';

const LAST_REGISTERED_KEY = '@caresignal_last_registered_push_token';

/**
 * After login, get the Expo push token and tell the backend about it.
 *
 * Re-registers only when the token actually changes (Expo tokens can rotate
 * if the app is reinstalled / FCM credentials change). The last-registered
 * token is cached in AsyncStorage so we don't hammer `/devices/register`
 * on every app launch.
 */
export function useRegisterDevice() {
  const { state } = useAuth();
  const userId = state.user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      const token = await pushService.registerForPushNotificationsAsync();
      if (cancelled) return;
      if (!token) {
        console.warn('[push] no token — skipping device registration');
        return;
      }
      console.log('[push] ExpoPushToken =', token, 'userId =', userId);

      // DEV/TEST: also fetch the NATIVE FCM device token and surface it on
      // screen so it can be pasted into Firebase Console → Cloud Messaging →
      // "Send test message". This bypasses the backend + Plus-plan gate and
      // proves the device can receive push. Copy to clipboard for convenience.
      try {
        const native = await Notifications.getDevicePushTokenAsync();
        const fcmToken = String(native?.data ?? '');
        console.log('[push] NATIVE FCM token =', fcmToken);
        if (fcmToken) {
          await Clipboard.setStringAsync(fcmToken);
          Alert.alert(
            'FCM Token (copied)',
            fcmToken,
            [{ text: 'OK' }],
            { cancelable: true },
          );
        }
      } catch (e) {
        console.warn('[push] could not get native FCM token', e);
      }

      const cacheKey = `${LAST_REGISTERED_KEY}_${userId}`;
      const last = await AsyncStorage.getItem(cacheKey);
      if (last === token) {
        console.log('[push] token unchanged since last registration — skipping POST');
        return;
      }

      try {
        const res = await apiClient.post('/devices/register', {
          token,
          userId,
          platform: Platform.OS, // 'ios' | 'android'
          appVersion: '1.0.0',
        });
        console.log('[push] /devices/register ←', res.status, res.data);
        await AsyncStorage.setItem(cacheKey, token);
      } catch (err: any) {
        console.warn('[push] /devices/register ✗', {
          status: err?.response?.status,
          body: err?.response?.data,
          message: err?.message,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);
}
