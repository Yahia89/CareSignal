import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushService } from '../services/pushService';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../../services/api';

const LAST_REGISTERED_KEY = '@caresignal_last_registered_push_token';

/**
 * After login, get the Expo push token and POST it to `/devices/register`.
 *
 * Spec (https://carsignal-api.vercel.app/docs#/Devices/post_api_devices_register):
 *   body: { token: string<=512, platform: 'ios'|'android'|'web', appVersion?: string<=32 }
 *   auth: Bearer JWT (user_id pulled from token, NOT from body)
 *   response 200: { data: DeviceToken, error: null }
 *   rate limit: 10/min
 *
 * Re-registers only when the token actually changes (Expo tokens can rotate
 * if the app is reinstalled / FCM credentials change). The last-registered
 * token is cached in AsyncStorage so we don't hammer `/devices/register`
 * on every app launch (also protects us from the 10/min rate limit).
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

      // platform must be one of: 'ios' | 'android' | 'web' (spec enum).
      // RN's Platform.OS can also return 'windows' / 'macos' on edge builds —
      // coerce those to 'web' so the request still validates.
      const platform: 'ios' | 'android' | 'web' =
        Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';

      // Read the app version from app.json so we don't ship a stale literal.
      const appVersion = Constants.expoConfig?.version ?? undefined;

      try {
        const res = await apiClient.post('/devices/register', {
          token,
          platform,
          ...(appVersion ? { appVersion } : {}),
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
