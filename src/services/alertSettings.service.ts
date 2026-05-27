import apiClient from './api';
import { AlertSettings, ApiEnvelope } from '../types';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope?.error) throw new Error(envelope.error);
  if (envelope?.data == null) throw new Error('Empty response from server');
  return envelope.data;
}

/**
 * The canonical list of writable fields on `/alert-settings`. The backend
 * uses a strict zod schema on PUT and rejects unknown keys — its GET
 * response, however, decorates the body with non-writable metadata
 * (`id`, `family_user_id`, `created_at`, `updated_at`). If we naively spread
 * the GET response back into a PUT we get HTTP 422 with:
 *   "Unrecognized key(s) in object: 'id', 'family_user_id', ..."
 * Picking explicitly here guarantees the PUT payload is what the API expects.
 */
const ALERT_SETTINGS_KEYS: ReadonlyArray<keyof AlertSettings> = [
  'vital_capture_enabled',
  'needs_help_email',
  'needs_help_text',
  'needs_help_phone',
  'urgent_help_email',
  'urgent_help_text',
  'urgent_help_phone',
  'urgent_auto_call_senior',
];

function pickAlertSettings(payload: Partial<AlertSettings>): AlertSettings {
  const out: Partial<AlertSettings> = {};
  for (const k of ALERT_SETTINGS_KEYS) {
    out[k] = payload[k] ?? false;
  }
  return out as AlertSettings;
}

export const alertSettingsService = {
  /** GET /alert-settings — family only. */
  get: async (): Promise<AlertSettings> => {
    const response = await apiClient.get<ApiEnvelope<AlertSettings>>('/alert-settings');
    return unwrap(response.data);
  },

  /**
   * PUT /alert-settings — family only, 20/min rate limit.
   * Server expects a full replacement of the settings object (writable
   * fields only — `pickAlertSettings` strips any metadata we may have
   * inherited from the GET response).
   */
  update: async (payload: AlertSettings): Promise<AlertSettings> => {
    const clean = pickAlertSettings(payload);
    const response = await apiClient.put<ApiEnvelope<AlertSettings>>('/alert-settings', clean);
    return unwrap(response.data);
  },
};
