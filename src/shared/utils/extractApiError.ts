import { AxiosError } from 'axios';

/**
 * Pull a human-readable message out of any error shape thrown across the app.
 *
 * Priority:
 *  1. Axios response body's `error` field (the API envelope shape).
 *  2. Axios response body's `message` field (some endpoints use this).
 *  3. Axios's own `message` (e.g. "Network Error", "timeout of 10000ms exceeded").
 *  4. `Error.message` from a vanilla thrown Error.
 *  5. The supplied fallback.
 *
 * Use this everywhere instead of inline `extractError` / `extractErrorMessage`
 * helpers so wording / behaviour stays consistent.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (!err) return fallback;

  // Axios error path
  const ax = err as AxiosError<{ error?: string; message?: string }>;
  const body = ax?.response?.data;
  if (body?.error) return body.error;
  if (body?.message) return body.message;
  if (ax?.message && ax?.isAxiosError) return ax.message;

  // Plain Error
  if (err instanceof Error && err.message) return err.message;

  return fallback;
}
