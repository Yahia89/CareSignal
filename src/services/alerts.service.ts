import apiClient from './api';
import { ApiAlert, ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '../types';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope?.error) throw new Error(envelope.error);
  if (envelope?.data == null) throw new Error('Empty response from server');
  return envelope.data;
}

interface ListResult<T> {
  items: T[];
  meta?: PaginationMeta;
}

export const alertsService = {
  /**
   * GET /alerts — family + Plus plan only. 403 if not family OR plan < Plus.
   */
  listAlerts: async (params: { page?: number; limit?: number } = {}): Promise<ListResult<ApiAlert>> => {
    const { page = 1, limit = 20 } = params;
    const response = await apiClient.get<PaginatedEnvelope<ApiAlert>>('/alerts', {
      params: { page, limit },
    });
    if (response.data?.error) throw new Error(response.data.error);
    const items = response.data?.data ?? [];
    const meta = response.data?.meta;
    return meta ? { items, meta } : { items };
  },

  /** PATCH /alerts/{id} — mark dismissed. Returns the updated Alert. */
  dismiss: async (id: string): Promise<ApiAlert> => {
    const response = await apiClient.patch<ApiEnvelope<ApiAlert>>(
      `/alerts/${encodeURIComponent(id)}`
    );
    return unwrap(response.data);
  },
};
