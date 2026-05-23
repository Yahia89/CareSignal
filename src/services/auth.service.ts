import apiClient from './api';
import {
  ApiEnvelope,
  ForgotPasswordPayload,
  LoginPayload,
  Profile,
  RefreshTokenPayload,
  ResetPasswordPayload,
  Session,
  SignupPayload,
  UpdateProfilePayload,
  VerifyEmailPayload,
} from '../types';

/**
 * Every CareSignal endpoint returns `{ data, error }`. This unwraps that
 * envelope into either `data` (success) or a thrown Error (`error !== null`).
 *
 * Throws preserve the API's own error string so screens can surface it.
 */
function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope?.error) {
    throw new Error(envelope.error);
  }
  if (envelope?.data == null) {
    throw new Error('Empty response from server');
  }
  return envelope.data;
}

export const authService = {
  /**
   * POST /auth/signup
   * 201 → returns a Session (account created, confirmation email sent).
   * Until the user confirms via email, login may fail with an
   * "Email not confirmed" error from Supabase.
   */
  signup: async (payload: SignupPayload): Promise<Session> => {
    const response = await apiClient.post<ApiEnvelope<Session>>('/auth/signup', payload);
    return unwrap(response.data);
  },

  /** POST /auth/login → 200 with Session. */
  login: async (payload: LoginPayload): Promise<Session> => {
    const response = await apiClient.post<ApiEnvelope<Session>>('/auth/login', payload);
    console.log('Login response:', response.data);
    return unwrap(response.data);
  },

  /**
   * POST /auth/verify-email
   * Called from the deep link the user taps in the confirmation email.
   * Returns a fresh Session so the user is signed in immediately.
   */
  verifyEmail: async (payload: VerifyEmailPayload): Promise<Session> => {
    const response = await apiClient.post<ApiEnvelope<Session>>('/auth/verify-email', payload);
    console.log('Verify email response:', response.data);
    return unwrap(response.data);
  },

  /** POST /auth/logout — server invalidates the refresh token. */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /** GET /profiles/me — name + role + plan etc. (requires bearer token). */
  getProfile: async (): Promise<Profile> => {
    try {
      const response = await apiClient.get<ApiEnvelope<Profile>>('/profiles/me');
      console.log('[profiles/me] ←', { status: response.status, body: response.data });
      return unwrap(response.data);
    } catch (err: any) {
      console.warn('[profiles/me] ✗', {
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

  /** PATCH /profiles/me — partial update (first_name and/or last_name). */
  updateProfile: async (payload: UpdateProfilePayload): Promise<Profile> => {
    const response = await apiClient.patch<ApiEnvelope<Profile>>('/profiles/me', payload);
    return unwrap(response.data);
  },

  /**
   * POST /auth/forgot-password
   * Spec: always 200 — never reveals whether the email is registered.
   * No useful response body. We treat any 2xx as success.
   * Axios throws on 4xx/5xx, which we let propagate (rate limit, validation).
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await apiClient.post('/auth/forgot-password', payload);
  },

  /**
   * POST /auth/reset-password
   * `token_hash` + `type: 'recovery'` come from the password-reset deep link:
   *   caresignal://auth/confirm?token_hash=xxx&type=recovery
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    await apiClient.post('/auth/reset-password', payload);
  },

  /**
   * POST /auth/refresh — Supabase rotates the refresh_token on each call,
   * so always store the new one for next time.
   */
  refreshToken: async (payload: RefreshTokenPayload): Promise<Session> => {
    const response = await apiClient.post<ApiEnvelope<Session>>('/auth/refresh', payload);
    return unwrap(response.data);
  },
};
