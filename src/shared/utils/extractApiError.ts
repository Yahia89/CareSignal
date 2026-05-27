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
  const ax = err as AxiosError<{ error?: unknown; message?: unknown }>;
  const body = ax?.response?.data;
  const fromError = stringifyApiField(body?.error);
  if (fromError) return fromError;
  const fromMessage = stringifyApiField(body?.message);
  if (fromMessage) return fromMessage;
  if (ax?.message && ax?.isAxiosError) return ax.message;

  // Plain Error
  if (err instanceof Error && err.message) return err.message;

  return fallback;
}

/**
 * The backend's validation errors come back as zod's `flatten()` shape:
 *   { formErrors: string[], fieldErrors: { [field]: string[] } }
 * Rendering that object directly crashes React ("Objects are not valid as a
 * React child"). Convert it to a single human-readable line.
 *
 * Also tolerates plain strings, arrays, and anything else by stringifying
 * defensively — never returns anything that can't be safely rendered.
 */
function stringifyApiField(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    const joined = value
      .map((v) => stringifyApiField(v))
      .filter((v): v is string => !!v)
      .join('; ');
    return joined || null;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // zod's `.flatten()` shape
    if ('formErrors' in obj || 'fieldErrors' in obj) {
      const lines: string[] = [];
      const formErrors = obj.formErrors;
      if (Array.isArray(formErrors)) {
        for (const f of formErrors) {
          const s = stringifyApiField(f);
          if (s) lines.push(s);
        }
      }
      const fieldErrors = obj.fieldErrors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        for (const [field, msgs] of Object.entries(fieldErrors as Record<string, unknown>)) {
          const s = stringifyApiField(msgs);
          if (s) lines.push(`${field}: ${s}`);
        }
      }
      return lines.join(' · ') || null;
    }
    // Last resort — JSON dump so the user sees *something* rather than [object Object].
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
  return null;
}
