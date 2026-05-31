import apiClient from './api';
import {
  AcceptInvitePayload,
  ApiEnvelope,
  GenerateInviteResult,
  Link,
} from '../types';

/**
 * Tolerant envelope unwrapper. Some endpoints wrap the result in `{ data, error }`,
 * others return the bare object — accept either shape.
 * Throws an `Error` carrying the API's own error string on a non-null `error`.
 */
function unwrap<T>(body: ApiEnvelope<T> | T | null | undefined): T {
  if (body == null) throw new Error('Empty response from server');
  // Envelope shape — `{ data, error }`
  const env = body as ApiEnvelope<T>;
  if (env.error) throw new Error(env.error);
  if ('data' in (body as object) && env.data !== undefined) {
    if (env.data == null) throw new Error('Empty response from server');
    return env.data;
  }
  // Bare object — assume it's already the result
  return body as T;
}

export const linksService = {
  /**
   * POST /links/generate-invite — senior only.
   * Returns the 5-character invite code the senior shares with their family.
   */
  generateInvite: async (): Promise<string> => {
    const response = await apiClient.post<ApiEnvelope<GenerateInviteResult> | GenerateInviteResult>(
      '/links/generate-invite'
    );
    return unwrap<GenerateInviteResult>(response.data).invite_code;
  },

  /**
   * GET /links — current pairing record (status `pending` until accepted).
   * Returns the Link, or `null` when the user has no link yet.
   *
   * Backend may signal "no link" three ways: HTTP 404, an envelope with
   * `data: null`, or an empty body. We map all three to `null` so callers
   * don't have to special-case errors.
   */
  getMyLink: async (): Promise<Link | null> => {
    try {
      const response = await apiClient.get<ApiEnvelope<Link> | Link | null>('/links');
      const body = response.data;
      if (body == null) return null;
      const env = body as ApiEnvelope<Link>;
      if (env.error) throw new Error(env.error);
      if ('data' in (body as object)) return env.data ?? null;
      return body as Link;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  /**
   * POST /links/accept — family only. Accepts a senior's invite code.
   * After this resolves, the link record is `status: 'active'`.
   */
  acceptInvite: async (payload: AcceptInvitePayload): Promise<Link> => {
    const response = await apiClient.post<ApiEnvelope<Link> | Link>('/links/accept', payload);
    return unwrap<Link>(response.data);
  },

  /**
   * DELETE /links/{id} — revoke an existing link. The caller must own it
   * (server enforces). Returns void on success (204).
   */
  revokeLink: async (id: string): Promise<void> => {
    await apiClient.delete(`/links/${encodeURIComponent(id)}`);
  },
};
