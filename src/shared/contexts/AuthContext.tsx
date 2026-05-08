import React, { createContext, useContext, useReducer, useMemo, ReactNode, useEffect, useRef, useCallback } from 'react';
import { User } from '../types/domain';
import { UserRole } from '../../types';
import { authService } from '../../services/auth.service';
import { storage } from '../../utils/storage';
import { setAuthToken } from '../../services/api';
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

/** Best-effort extraction of an actionable error message from the API/network. */
function extractErrorMessage(err: any, fallback: string): string {
  if (err?.response?.data) {
    const d = err.response.data;
    if (typeof d === 'string') return d;
    if (d.message) return d.message;
    if (d.error) return typeof d.error === 'string' ? d.error : d.error.message ?? fallback;
  }
  if (err?.message && typeof err.message === 'string') {
    if (err.message === 'Network Error') return 'Network error — check your connection and try again.';
    return err.message;
  }
  return fallback;
}

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

    // Cleanup timer on unmount
    return () => {
      clearTokenRefreshTimer(tokenRefreshTimerRef.current);
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

    let profile: import('../../types').Profile;
    try {
      profile = await authService.getProfile();
    } catch (err) {
      // Roll back partial auth so we don't leave a token sitting around.
      await storage.clear();
      throw err;
    }

    const user: User = {
      id: session.user.id,
      name: `${profile.first_name} ${profile.last_name}`.trim(),
      phoneNumber: profile.phone_number ?? '',
      role: profile.role === 'senior' ? 'elder' : 'family',
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

  const logout = async () => {
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

  const value = useMemo(() => ({ state, dispatch, login, signup, logout }), [state, login, signup, logout]);

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
