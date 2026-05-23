import apiClient from './api';
import { AlertSettings, ApiEnvelope } from '../types';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope?.error) throw new Error(envelope.error);
  if (envelope?.data == null) throw new Error('Empty response from server');
  return envelope.data;
}

export const alertSettingsService = {
  /** GET /alert-settings — family only. */
  get: async (): Promise<AlertSettings> => {
    const response = await apiClient.get<ApiEnvelope<AlertSettings>>('/alert-settings');
    return unwrap(response.data);
  },

  /**
   * PUT /alert-settings — family only, 20/min rate limit.
   * Server expects a full replacement of the settings object.
   */
  update: async (payload: AlertSettings): Promise<AlertSettings> => {
    const response = await apiClient.put<ApiEnvelope<AlertSettings>>('/alert-settings', payload);
    return unwrap(response.data);
  },
};
