import { storage } from './storage';
import { authService } from '../services/auth.service';
import { setAuthToken, setRefreshCallback } from '../services/api';

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT token (without verification - client side only)
 * Uses atob for React Native compatibility (no Buffer)
 */
export const decodeToken = (token: string | null | undefined): DecodedToken | null => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;

    // Use atob for base64 decoding (works in React Native)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string | null | undefined, bufferSeconds: number = 0): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - bufferSeconds < now;
};

/**
 * Get time until token expiration (in seconds)
 */
export const getTokenExpiryTime = (token: string | null | undefined): number | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now;
};

/**
 * Refresh access token using refresh token
 * Proactively called when token is near expiry
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await storage.getRefreshToken();

    if (!refreshToken) {
      console.warn('No refresh token available');
      return false;
    }

    const response = await authService.refreshToken({ refresh_token: refreshToken });

    if (!response.access_token || !response.refresh_token) {
      console.error('Invalid refresh response');
      return false;
    }

    // Store new tokens
    await setAuthToken(response.access_token);
    await storage.setRefreshToken(response.refresh_token);

    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * Setup automatic token refresh
 * Call this when token is set (after login/signup)
 * Proactively refreshes when token is near expiry (within 5 minutes)
 */
export const setupTokenRefreshTimer = (token: string | null | undefined): ReturnType<typeof setTimeout> | null => {
  if (!token) {
    console.warn('setupTokenRefreshTimer called without a token; skipping');
    return null;
  }
  const expiryTime = getTokenExpiryTime(token);

  if (!expiryTime) {
    console.warn('Unable to determine token expiry time');
    return null;
  }

  // Refresh when token is within 5 minutes of expiry
  const REFRESH_BUFFER = 5 * 60; // 5 minutes in seconds
  const refreshInSeconds = Math.max(expiryTime - REFRESH_BUFFER, 0);

  if (refreshInSeconds === 0) {
    // Token already near expiry, refresh immediately
    refreshAccessToken();
    return null;
  }

  console.log(`Token refresh scheduled in ${refreshInSeconds} seconds`);

  const timerId = setTimeout(() => {
    console.log('Refreshing access token proactively...');
    refreshAccessToken();
  }, refreshInSeconds * 1000);

  return timerId;
};

/**
 * Clear token refresh timer
 */
export const clearTokenRefreshTimer = (timerId: ReturnType<typeof setTimeout> | null) => {
  if (timerId) {
    clearTimeout(timerId);
  }
};

// Register `refreshAccessToken` with the api client so any 401 response
// triggers a refresh + retry. Module-load side effect — runs once when
// tokenManager is first imported (which happens at app boot via AuthContext).
setRefreshCallback(refreshAccessToken);
