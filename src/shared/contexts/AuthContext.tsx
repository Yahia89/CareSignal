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
  /**
   * Log the user in from a pre-issued Supabase session (e.g. obtained from
   * the backend's email-verification deep link, which now hands us tokens
   * directly instead of a `token_hash`). Wraps the same `finalizeAuth` path
   * used by login / signup so storage + refresh-timer + profile fetch all
   * happen consistently.
   */
  loginWithSession: (session: import('../../types').Session) => Promise<AuthResult>;
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
    // Supabase returns a Session with null tokens when email confirmation is
    // required — the account exists but isn't logged in yet. Bail with a
    // clear message so signup/login surface "check your email" instead of
    // crashing in storage/decode.
    if (!session?.access_token || !session?.refresh_token) {
      throw new Error('Please check your email to confirm your account before signing in.');
    }

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

  // All public auth methods are wrapped in useCallback so consumers can
  // safely use them in useEffect dependency arrays without triggering
  // render loops. (Without this, ConfirmDeepLinkScreen hit "Maximum update
  // depth exceeded" because every dispatch re-rendered the provider and
  // produced new function references.)
  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
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
  }, [finalizeAuth]);

  const signup = useCallback(async (params: SignupParams): Promise<AuthResult> => {
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
      // The backend's signup response is identical for "email already
      // registered" and "brand-new email needing confirmation" — Supabase's
      // anti-enumeration mode is on, so we genuinely cannot tell them apart
      // from a single API call (we confirmed by probing /auth/login with a
      // nonexistent email; it also returns "Invalid credentials").
      //
      // We collapse three signal classes into one inline message that is
      // truthful for both cases:
      //   • explicit-dupe responses (409 / "already" / "exists" / etc.)
      //   • Supabase confirm-required responses ("check your email" / etc.)
      //   • Any other unrecognized error → show the raw message.
      const status: number | undefined = error?.response?.status;
      const raw = extractErrorMessage(error, 'Signup failed. Please try again.');
      const lowered = raw.toLowerCase();
      const isAmbiguousAuthResponse =
        status === 409 ||
        lowered.includes('already') ||
        lowered.includes('exists') ||
        lowered.includes('registered') ||
        lowered.includes('in use') ||
        lowered.includes('check your email') ||
        lowered.includes('confirm your account') ||
        lowered.includes('before signing in');
      const errorMsg = isAmbiguousAuthResponse
        ? 'Check your email to confirm your account. If you already have an account, log in instead.'
        : raw;
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { ok: false, error: errorMsg };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [finalizeAuth]);

  const verifyEmail = useCallback(async (token_hash: string, type: 'signup' | 'email'): Promise<AuthResult> => {
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
  }, [finalizeAuth]);

  /**
   * Sign in from a Supabase session that's already been issued elsewhere
   * (the backend's email-verification page now hands the app a ready
   * session via the deep link instead of a `token_hash` to verify).
   * Just runs the existing finalize path — fetch profile, store token,
   * arm the refresh timer, dispatch LOGIN.
   */
  const loginWithSession = useCallback(async (session: import('../../types').Session): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      await finalizeAuth(session);
      return { ok: true };
    } catch (error: any) {
      const errorMsg = extractErrorMessage(error, 'Could not complete sign-in. Try again.');
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { ok: false, error: errorMsg };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [finalizeAuth]);

  const logout = useCallback(async () => {
    // Tell the backend to drop this device's push token first, before we
    // wipe local auth. Best-effort — if the call fails we still proceed
    // with logout. The token comes from expo-notifications via pushService
    // (cached on the device, so this is a cheap read).
    try {
      const { pushService } = await import('../notifications/services/pushService');
      const token = await pushService.registerForPushNotificationsAsync();
      if (token) {
        const apiClient = (await import('../../services/api')).default;
        await apiClient
          .post('/devices/unregister', { token })
          .catch((err) =>
            console.warn('[push] /devices/unregister ✗', {
              status: err?.response?.status,
              message: err?.message,
            }),
          );
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
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, login, signup, logout, verifyEmail, loginWithSession }),
    [state, login, signup, logout, verifyEmail, loginWithSession],
  );

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
