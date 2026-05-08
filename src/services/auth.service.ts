import apiClient from './api';
import {
  ApiEnvelope,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  Profile,
  RefreshTokenPayload,
  ResetPasswordPayload,
  Session,
  SignupPayload,
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
    return unwrap(response.data);
  },

  /**
   * POST /auth/verify-email
   * Called from the deep link the user taps in the confirmation email.
   * Returns a fresh Session so the user is signed in immediately.
   */
  verifyEmail: async (payload: VerifyEmailPayload): Promise<Session> => {
    const response = await apiClient.post<ApiEnvelope<Session>>('/auth/verify-email', payload);
    return unwrap(response.data);
  },

  /** POST /auth/logout — server invalidates the refresh token. */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /** GET /profiles/me — name + role + plan etc. (requires bearer token). */
  getProfile: async (): Promise<Profile> => {
    const response = await apiClient.get<ApiEnvelope<Profile>>('/profiles/me');
    return unwrap(response.data);
  },

  /** POST /auth/forgot-password */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ApiEnvelope<ForgotPasswordResponse>>(
      '/auth/forgot-password',
      payload
    );
    return unwrap(response.data);
  },

  /** POST /auth/reset-password */
  resetPassword: async (payload: ResetPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ApiEnvelope<ForgotPasswordResponse>>(
      '/auth/reset-password',
      payload
    );
    return unwrap(response.data);
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
