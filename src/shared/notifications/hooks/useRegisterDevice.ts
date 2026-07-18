import { useEffect } from 'react';
import { Platform } from 'react-native';
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

      const cacheKey = `${LAST_REGISTERED_KEY}_${userId}`;
      const last = await AsyncStorage.getItem(cacheKey);
      if (last === token) {
        console.log('[push] token unchanged since last registration — skipping POST');
        return;
      }

      try {
        // Don't send userId — the backend derives the user from the auth
        // token, and its /devices/register schema is strict() so an extra
        // field is rejected with 422 (silently skipping token registration).
        const res = await apiClient.post('/devices/register', {
          token,
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
