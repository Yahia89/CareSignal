import React, { createContext, useContext, useReducer, useMemo, ReactNode, useEffect, useRef, useCallback } from 'react';
import { User } from '../types/domain';
import { UserRole } from '../../types';
import { authService } from '../../services/auth.service';
import { storage } from '../../utils/storage';
import { setAuthToken, setLogoutCallback } from '../../services/api';
import { setupTokenRefreshTimer, clearTokenRefreshTimer } from '../../utils/tokenManager';

/** Result wrapper used by login/signup so screens can render errors locally
 *  without subscribing to global state. */
export type AuthResult = { ok: true } | { ok: false; error: string };

export interface SignupParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

import { extractApiError as extractErrorMessage } from '../utils';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INIT'; payload: { user: User; token: string } };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
    case 'INIT':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return initialState;
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (params: SignupParams) => Promise<AuthResult>;
  logout: () => Promise<void>;
  verifyEmail: (token_hash: string, type: 'signup' | 'email') => Promise<AuthResult>;
} | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const tokenRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize auth from stored token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await storage.getToken();
        const user = await storage.getUser();

        if (token && user) {
          setAuthToken(token);
          dispatch({ type: 'INIT', payload: { user, token } });

          // Setup automatic token refresh for existing token
          tokenRefreshTimerRef.current = setupTokenRefreshTimer(token);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();

    // Wire the api-client logout callback to our reducer so a failed
    // refresh (401 → refresh fails → user is truly logged out) triggers
    // a proper LOGOUT dispatch and the UI flips to the auth stack.
    setLogoutCallback(() => {
      clearTokenRefreshTimer(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = null;
      dispatch({ type: 'LOGOUT' });
    });

    // Cleanup timer on unmount
    return () => {
      clearTokenRefreshTimer(tokenRefreshTimerRef.current);
      setLogoutCallback(null);
    };
  }, []);

  /**
   * Finalize a fresh Session: persist tokens, fetch the Profile (which is
   * what carries name + role — the Session.user only has id + email), build
   * the app User, schedule refresh, and dispatch LOGIN.
   *
   * The bearer token has to be set BEFORE getProfile so the request is
   * authorized. If the profile fetch fails, we surface the error and roll
   * back the token so the user isn't stuck "logged in but useless".
   */
  const finalizeAuth = useCallback(async (session: import('../../types').Session) => {
    await setAuthToken(session.access_token);
    await storage.setRefreshToken(session.refresh_token);
    console.log('Session finalized:', session);

    // Try to fetch the profile, with one retry to absorb Vercel cold starts.
    // If it still fails (known backend issue: /profiles/me sometimes 500s
    // for newly-confirmed accounts), fall back to a minimal user built from
    // the session so the user is not locked out at the front door. They'll
    // see the Family dashboard's "Get linked" empty state, which is graceful.
    let profile: import('../../types').Profile | null = null;
    try {
      profile = await authService.getProfile();
    } catch (firstErr) {
      console.warn('[finalizeAuth] /profiles/me failed — retrying once', firstErr);
      await new Promise((r) => setTimeout(r, 600));
      try {
        profile = await authService.getProfile();
      } catch (secondErr) {
        console.warn(
          '[finalizeAuth] /profiles/me failed twice — using session fallback',
          secondErr,
        );
        profile = null;
      }
    }

    const emailLocal = session.user.email?.split('@')[0] ?? '';
    const user: User = profile
      ? {
          id: session.user.id,
          name: `${profile.first_name} ${profile.last_name}`.trim() || emailLocal,
          phoneNumber: profile.phone_number ?? '',
          role: profile.role === 'senior' ? 'elder' : 'family',
          plan: profile.plan ?? 'free',
        }
      : {
          // Minimal fallback — keeps login functional when the profile
          // endpoint is unhealthy. Defaults to 'family' so the user lands
          // on the dashboard (handles missing data gracefully) rather than
          // the elder check-in flow (which assumes a senior profile exists).
          id: session.user.id,
          name: emailLocal,
          phoneNumber: '',
          role: 'family',
          plan: 'free',
        };

    await storage.setUser(user);

    clearTokenRefreshTimer(tokenRefreshTimerRef.current);
    tokenRefreshTimerRef.current = setupTokenRefreshTimer(session.access_token);

    dispatch({ type: 'LOGIN', payload: { user, token: session.access_token } });
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const session = await authService.login({ email, password });
      await finalizeAuth(session);
      return { ok: true };
    } catch (error: any) {
      const errorMsg = extractErrorMessage(error, 'Login failed. Please check your credentials.');
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { ok: false, error: errorMsg };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signup = async (params: SignupParams): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const session = await authService.signup({
        email: params.email,
        password: params.password,
        first_name: params.firstName,
        last_name: params.lastName,
        role: params.role,
      });
      await finalizeAuth(session);
      return { ok: true };
    } catch (error: any) {
      const errorMsg = extractErrorMessage(error, 'Signup failed. Please try again.');
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { ok: false, error: errorMsg };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyEmail = async (token_hash: string, type: 'signup' | 'email'): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const session = await authService.verifyEmail({ token_hash, type });
      await finalizeAuth(session);
      return { ok: true };
    } catch (error: any) {
      const errorMsg = extractErrorMessage(error, 'Could not verify email. Try again or request a new link.');
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { ok: false, error: errorMsg };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    // Tell the backend to drop this device's push token before we wipe local
    // auth. Best-effort — if the call fails we still proceed with logout.
    //
    // Spec (https://carsignal-api.vercel.app/docs#/Devices/post_api_devices_unregister):
    //   body: { token: string<=512 }
    //   auth: Bearer JWT (must come BEFORE we clear it — that's why this
    //         block runs first, not in `finally`)
    //   response 200: { data: { ok: boolean, removed: number }, error: null }
    //
    // Reads the token from the AsyncStorage cache populated at register time,
    // not from expo-notifications — much cheaper and avoids re-prompting for
    // permissions during a logout flow.
    try {
      const AsyncStorage = (
        await import('@react-native-async-storage/async-storage')
      ).default;
      const userIdAtLogout = state.user?.id;
      const cacheKey = userIdAtLogout
        ? `@caresignal_last_registered_push_token_${userIdAtLogout}`
        : null;
      const token = cacheKey ? await AsyncStorage.getItem(cacheKey) : null;

      if (token) {
        const apiClient = (await import('../../services/api')).default;
        try {
          const res = await apiClient.post('/devices/unregister', { token });
          console.log('[push] /devices/unregister ←', res.status, res.data);
        } catch (err: any) {
          console.warn('[push] /devices/unregister ✗', {
            status: err?.response?.status,
            body: err?.response?.data,
            message: err?.message,
          });
        }
        // Drop the cached token so a future login on the same device will
        // re-register fresh (don't leak across user accounts).
        if (cacheKey) await AsyncStorage.removeItem(cacheKey);
      } else {
        console.log('[push] no cached token to unregister — skipping');
      }
    } catch (err) {
      console.warn('[push] could not unregister device on logout', err);
    }

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear refresh timer
      clearTokenRefreshTimer(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = null;

      await storage.clear();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = useMemo(() => ({ state, dispatch, login, signup, logout, verifyEmail }), [state, login, signup, logout, verifyEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const useUser = () => {
  return useAuth().state.user;
};
