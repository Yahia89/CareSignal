import React, { createContext, useContext, useReducer, useMemo, ReactNode, useEffect, useRef } from 'react';
import { User } from '../types/domain';
import { authService } from '../../services/auth.service';
import { storage } from '../../utils/storage';
import { setAuthToken } from '../../services/api';
import { setupTokenRefreshTimer, clearTokenRefreshTimer } from '../../utils/tokenManager';

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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { access_token, user: apiUser } = await authService.login({ email, password });

      // Transform API user to app User type
      const user: User = {
        id: apiUser.id,
        name: `${apiUser.first_name} ${apiUser.last_name}`,
        phoneNumber: apiUser.phone || '',
        role: apiUser.role === 'senior' ? 'elder' : 'family',
      };

      await setAuthToken(access_token);
      await storage.setUser(user);

      // Setup automatic token refresh
      clearTokenRefreshTimer(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = setupTokenRefreshTimer(access_token);

      dispatch({ type: 'LOGIN', payload: { user, token: access_token } });
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { access_token, user: apiUser } = await authService.signup({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: 'senior',
      });

      // Transform API user to app User type
      const user: User = {
        id: apiUser.id,
        name: `${apiUser.first_name} ${apiUser.last_name}`,
        phoneNumber: apiUser.phone || '',
        role: apiUser.role === 'senior' ? 'elder' : 'family',
      };

      await setAuthToken(access_token);
      await storage.setUser(user);

      // Setup automatic token refresh
      clearTokenRefreshTimer(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = setupTokenRefreshTimer(access_token);

      dispatch({ type: 'LOGIN', payload: { user, token: access_token } });
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return false;
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

  const value = useMemo(() => ({ state, dispatch, login, signup, logout }), [state]);

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
