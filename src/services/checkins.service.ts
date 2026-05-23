import apiClient from './api';
import {
  ApiEnvelope,
  CheckIn,
  CreateCheckInPayload,
  PaginatedEnvelope,
  PaginationMeta,
} from '../types';

/** Standard `{ data, error }` unwrapper. Throws on a non-null `error`. */
function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope?.error) throw new Error(envelope.error);
  if (envelope?.data == null) throw new Error('Empty response from server');
  return envelope.data;
}

interface ListResult<T> {
  items: T[];
  meta?: PaginationMeta;
}

export const checkInsService = {
  /**
   * POST /check-ins — senior only. Submits a status report.
   * Server enforces rate limit of 5/min.
   */
  createCheckIn: async (payload: CreateCheckInPayload): Promise<CheckIn> => {
    const response = await apiClient.post<ApiEnvelope<CheckIn>>('/check-ins', payload);
    return unwrap(response.data);
  },

  /**
   * GET /check-ins/today — senior only.
   * Returns null if the user hasn't checked in today yet (NOT a thrown error).
   */
  getTodayCheckIn: async (): Promise<CheckIn | null> => {
    const response = await apiClient.get<ApiEnvelope<CheckIn | null>>('/check-ins/today');
    if (response.data?.error) throw new Error(response.data.error);
    return response.data?.data ?? null;
  },

  /**
   * GET /check-ins — paginated history (senior only).
   * `limit` capped at 100 server-side.
   */
  listCheckIns: async (page = 1, limit = 20): Promise<ListResult<CheckIn>> => {
    const response = await apiClient.get<PaginatedEnvelope<CheckIn>>('/check-ins', {
      params: { page, limit },
    });
    if (response.data?.error) throw new Error(response.data.error);
    const items = response.data?.data ?? [];
    const meta = response.data?.meta;
    return meta ? { items, meta } : { items };
  },
};
