import apiClient from './api';
import { ApiEnvelope, PaginatedEnvelope, SeniorStatusResult, Vital } from '../types';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope?.error) throw new Error(envelope.error);
  if (envelope?.data == null) throw new Error('Empty response from server');
  return envelope.data;
}

export const seniorService = {
  /**
   * GET /senior/status — family only.
   * 403 when caller is not family OR has no active link — caller should
   * surface the empty "Get linked" state in that case.
   */
  getStatus: async (): Promise<SeniorStatusResult> => {
    try {
      const response = await apiClient.get<ApiEnvelope<SeniorStatusResult>>('/senior/status');
      // eslint-disable-next-line no-console
      console.log('[senior/status] ←', {
        status: response.status,
        body: response.data,
      });
      return unwrap(response.data);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('[senior/status] ✗', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        body: err?.response?.data,
        url: err?.config?.url,
        method: err?.config?.method,
        message: err?.message,
      });
      throw err;
    }
  },

  /**
   * GET /senior/vitals — family only.
   * Returns the linked senior's recent vital readings so the family dashboard
   * can display the Vitals Snapshot section.
   * Returns [] on 403/404 (not linked, no vitals, or endpoint not supported).
   */
  getVitals: async (limit = 5): Promise<Vital[]> => {
    try {
      const response = await apiClient.get<PaginatedEnvelope<Vital>>('/senior/vitals', {
        params: { limit },
      });
      return response.data?.data ?? [];
    } catch {
      return [];
    }
  },
};
