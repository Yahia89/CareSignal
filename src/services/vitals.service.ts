import apiClient from './api';
import {
  ApiEnvelope,
  CreateVitalPayload,
  PaginatedEnvelope,
  PaginationMeta,
  Vital,
  VitalType,
} from '../types';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope?.error) throw new Error(envelope.error);
  if (envelope?.data == null) throw new Error('Empty response from server');
  return envelope.data;
}

interface ListResult<T> {
  items: T[];
  meta?: PaginationMeta;
}

export const vitalsService = {
  /**
   * POST /vitals — senior only. Logs a vital reading.
   * Server enforces 20/min rate limit.
   */
  createVital: async (payload: CreateVitalPayload): Promise<Vital> => {
    const response = await apiClient.post<ApiEnvelope<Vital>>('/vitals', payload);
    return unwrap(response.data);
  },

  /**
   * GET /vitals — paginated history (senior only).
   * Optional `vital_type` filter narrows by blood_sugar or blood_pressure.
   */
  listVitals: async (params: {
    page?: number;
    limit?: number;
    vitalType?: VitalType;
  } = {}): Promise<ListResult<Vital>> => {
    const { page = 1, limit = 20, vitalType } = params;
    const response = await apiClient.get<PaginatedEnvelope<Vital>>('/vitals', {
      params: { page, limit, ...(vitalType ? { vital_type: vitalType } : {}) },
    });
    if (response.data?.error) throw new Error(response.data.error);
    const items = response.data?.data ?? [];
    const meta = response.data?.meta;
    return meta ? { items, meta } : { items };
  },
};
