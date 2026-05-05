import { useEffect } from 'react';
import { pushService } from '../services/pushService';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';

export function useRegisterDevice() {
  const { state } = useAuth();
  const userId = state.user?.id;

  useEffect(() => {
    if (userId) {
      pushService.registerForPushNotificationsAsync().then((token) => {
        if (token) {
          // Fire and forget registering the token
          apiClient.post('/devices/register', { token, userId }).catch(() => {});
        }
      });
    }
  }, [userId]);
}
