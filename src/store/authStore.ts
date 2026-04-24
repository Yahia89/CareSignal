import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, AuthSession } from '../types';

const KEYS = {
  user: 'auth_user',
  session: 'auth_session',
};

async function loadFromStorage(): Promise<{ user: User | null; session: AuthSession | null }> {
  try {
    const [userJson, sessionJson] = await Promise.all([
      SecureStore.getItemAsync(KEYS.user),
      SecureStore.getItemAsync(KEYS.session),
    ]);
    const user = userJson ? (JSON.parse(userJson) as User) : null;
    const session = sessionJson ? (JSON.parse(sessionJson) as AuthSession) : null;
    if (session && session.expiresAt < Date.now()) {
      await clearStorage();
      return { user: null, session: null };
    }
    return { user, session };
  } catch {
    return { user: null, session: null };
  }
}

async function clearStorage(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.user),
    SecureStore.deleteItemAsync(KEYS.session),
  ]);
}

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
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
  isHydrated: false,

  hydrate: async () => {
    const { user, session } = await loadFromStorage();
    set({ user, session, isAuthenticated: !!user, isHydrated: true });
  },

  setUser: (user) => {
    SecureStore.setItemAsync(KEYS.user, JSON.stringify(user)).catch(console.error);
    set({ user, isAuthenticated: true });
  },

  setSession: (session) => {
    SecureStore.setItemAsync(KEYS.session, JSON.stringify(session)).catch(console.error);
    set({ session });
  },

  setLoading: (isLoading) => set({ isLoading }),

  signOut: () => {
    clearStorage().catch(console.error);
    set({ user: null, session: null, isAuthenticated: false });
  },
}));
