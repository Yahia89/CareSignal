import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { UserRole } from '../types';

export function useAuth() {
  const { user, session, isLoading, isAuthenticated, setUser, setSession, setLoading, signOut: storeSignOut } =
    useAuthStore();

  const sendOtp = useCallback(async (phone: string) => {
    setLoading(true);
    try {
      await authService.sendOtp(phone);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const verifyOtp = useCallback(
    async (phone: string, otp: string): Promise<{ isNewUser: boolean }> => {
      setLoading(true);
      try {
        const { session: newSession, isNewUser } = await authService.verifyOtp(phone, otp);
        setSession(newSession);

        if (!isNewUser) {
          const existingUser = await authService.getMe(phone);
          if (existingUser) {
            setUser(existingUser);
          }
        }

        return { isNewUser };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSession, setUser],
  );

  const selectRole = useCallback(
    async (role: UserRole) => {
      if (!session) throw new Error('No active session');
      setLoading(true);
      try {
        const newUser = await authService.setRole(session.token, role);
        setUser(newUser);
      } finally {
        setLoading(false);
      }
    },
    [session, setLoading, setUser],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      storeSignOut();
    } finally {
      setLoading(false);
    }
  }, [setLoading, storeSignOut]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { session, user } = await authService.loginWithEmail(email, password);
        setSession(session);
        setUser(user);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSession, setUser],
  );

  // Quick-login helpers for demo/testing
  const loginAsElder = useCallback(async () => {
    setLoading(true);
    try {
      const { session: newSession } = await authService.verifyOtp('+15550142', '123456');
      setSession(newSession);
      const elderUser = await authService.getMe('+15550142');
      if (elderUser) setUser(elderUser);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSession, setUser]);

  const loginAsFamily = useCallback(async () => {
    setLoading(true);
    try {
      const { session: newSession } = await authService.verifyOtp('+15550201', '123456');
      setSession(newSession);
      const familyUser = await authService.getMe('+15550201');
      if (familyUser) setUser(familyUser);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSession, setUser]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    loginWithEmail,
    sendOtp,
    verifyOtp,
    selectRole,
    signOut,
    loginAsElder,
    loginAsFamily,
  };
}
