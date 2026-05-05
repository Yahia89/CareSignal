import { useCallback, useEffect, useState } from 'react';
import apiClient, { setAuthToken, clearAuthToken, initializeAuthToken } from '../services/api';
import { storage } from '../utils/storage';
import { User, AuthResponse, SignupPayload, LoginPayload, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  // Initialize auth from stored token on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuthToken();
        const storedUser = await storage.getUser();

        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const payload: LoginPayload = { email, password };
        const response = await apiClient.post<AuthResponse>('/auth/login', payload);

        const { access_token, user: userData } = response.data;

        if (!access_token) {
          throw new Error('No access token received');
        }

        setAuthToken(access_token);
        await storage.setUser(userData);
        setUser(userData);

        return { success: true, user: userData };
      } catch (err) {
        setError(err);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: UserRole = 'senior'
    ) => {
      try {
        setLoading(true);
        setError(null);

        const payload: SignupPayload = {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role,
        };

        const response = await apiClient.post<AuthResponse>('/auth/signup', payload);

        const { access_token, user: userData } = response.data;

        if (!access_token) {
          throw new Error('No access token received');
        }

        setAuthToken(access_token);
        await storage.setUser(userData);
        setUser(userData);

        return { success: true, user: userData };
      } catch (err) {
        setError(err);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await clearAuthToken();
      setUser(null);
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };
}
