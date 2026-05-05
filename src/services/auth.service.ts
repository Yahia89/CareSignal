import apiClient from './api';
import {
  AuthResponse,
  SignupPayload,
  LoginPayload,
  User,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
} from '../types';

export const authService = {
  /**
   * Sign up a new user
   * POST /auth/signup
   *
   * Request body:
   * {
   *   "email": "senior@example.com",
   *   "password": "password123",
   *   "first_name": "Margaret",
   *   "last_name": "Johnson",
   *   "role": "senior"
   * }
   *
   * Response: { access_token: string, user: User }
   */
  signup: async (payload: SignupPayload): Promise<{ access_token: string; user: User }> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', payload);
    const { access_token, user } = response.data;

    if (!access_token) {
      throw new Error('No access token received from signup');
    }

    return { access_token, user };
  },

  /**
   * Sign in an existing user
   * POST /auth/login
   */
  login: async (payload: LoginPayload): Promise<{ access_token: string; user: User }> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    const { access_token, user } = response.data;

    if (!access_token) {
      throw new Error('No access token received from login');
    }

    return { access_token, user };
  },

  /**
   * Sign out the current user
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current user profile
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  /**
   * Request password reset
   * POST /auth/forgot-password
   *
   * Request body:
   * {
   *   "email": "senior@example.com"
   * }
   *
   * Response: { message: string, success: boolean }
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', payload);
    return response.data;
  },

  /**
   * Reset password with token
   * POST /auth/reset-password
   *
   * Request body:
   * {
   *   "token": "reset_token_from_email",
   *   "password": "newpassword123",
   *   "password_confirm": "newpassword123"
   * }
   *
   * Response: { message: string, success: boolean }
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/reset-password', payload);
    return response.data;
  },
};
