import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';

const API_BASE_URL = 'https://carsignal-api-prod.vercel.app/api';

let authToken: string | null = null;

/**
 * Refresh callback registered by `tokenManager` (via setRefreshCallback below).
 * We use a callback rather than a direct import to break the circular dep:
 *   api.ts → tokenManager → authService → api.ts
 * On 401 the response interceptor calls this; if it returns true the original
 * request is retried with the refreshed bearer.
 */
type RefreshCallback = () => Promise<boolean>;
let refreshCallback: RefreshCallback | null = null;
export const setRefreshCallback = (cb: RefreshCallback | null) => {
  refreshCallback = cb;
};

/**
 * Logout callback registered by AuthContext. Called when refresh fails (the
 * user is genuinely no longer authenticated). Without this the user would
 * keep seeing 401 errors with stale UI state.
 */
type LogoutCallback = () => void | Promise<void>;
let logoutCallback: LogoutCallback | null = null;
export const setLogoutCallback = (cb: LogoutCallback | null) => {
  logoutCallback = cb;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Endpoints that must NEVER carry a stale bearer token. The signup / login
// flows are public; sending a bearer (e.g. left over from a previous session
// in storage) makes the API reject the request with 401 even though the
// caller's body is valid.
const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/signup',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/refresh',
];

// ─── Request interceptor: attach bearer token ──────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url ?? '';
    const isPublic = PUBLIC_AUTH_ENDPOINTS.some((p) => url.startsWith(p));
    if (authToken && !isPublic) {
      config.headers.authorization = `Bearer ${authToken}`;
    } else if (isPublic) {
      // Make sure no header sneaks through on public calls.
      delete (config.headers as Record<string, unknown>).authorization;
      delete (config.headers as Record<string, unknown>).Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: 401 → try refresh → retry once ──────────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retryAfterRefresh?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    // Don't try to refresh on the refresh endpoint itself — would loop forever.
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retryAfterRefresh &&
      !isRefreshCall &&
      refreshCallback
    ) {
      originalRequest._retryAfterRefresh = true;
      try {
        const refreshed = await refreshCallback();
        if (refreshed && authToken) {
          originalRequest.headers.authorization = `Bearer ${authToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // fall through to logout
      }
      // Refresh failed — the user is truly logged out.
      authToken = null;
      await storage.clear();
      if (logoutCallback) await logoutCallback();
    }

    // Propagate the original error untouched so callers can read
    // `err.response.data.error` (the API's error string).
    return Promise.reject(error);
  }
);

// ─── Token management exports ──────────────────────────────────────────────
export const setAuthToken = async (token: string) => {
  authToken = token;
  await storage.setToken(token);
};

export const getAuthToken = (): string | null => authToken;

export const clearAuthToken = async () => {
  authToken = null;
  await storage.clear();
};

export const initializeAuthToken = async () => {
  const token = await storage.getToken();
  if (token) authToken = token;
};

export default apiClient;
