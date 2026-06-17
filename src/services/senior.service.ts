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
   * GET /vitals — vital history. NOTE: this endpoint is **Senior only** on the
   * backend (a senior reading their OWN vitals). A family/caregiver token gets
   * 403, so the Family Dashboard's Vitals Snapshot will be empty until the
   * backend adds a family-accessible endpoint (there is currently none — the
   * family-only `/senior/status` returns care status + today's check-in, not
   * vitals). The old `/senior/vitals` path returned 404 (route does not exist).
   * Returns [] on 401/403/404 so the dashboard degrades gracefully.
   */
  getVitals: async (limit = 5): Promise<Vital[]> => {
    try {
      const response = await apiClient.get<PaginatedEnvelope<Vital>>('/vitals', {
        params: { page: 1, limit },
      });
      return response.data?.data ?? [];
    } catch {
      return [];
    }
  },
};
