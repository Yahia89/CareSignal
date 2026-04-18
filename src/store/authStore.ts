import { create } from 'zustand';
import { User, AuthSession } from '../types';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setSession: (session: AuthSession) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: true }),

  setSession: (session) =>
    set({ session }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  signOut: () =>
    set({ user: null, session: null, isAuthenticated: false }),
}));
