import { useCallback, useState } from 'react';
import { authService } from '../services/auth.service';
import { ForgotPasswordResponse } from '../types';

interface UseForgotPasswordReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<boolean>;
  reset: () => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setMessage(null);

      const response = await authService.forgotPassword({ email });

      if (response.success) {
        setSuccess(true);
        setMessage(response.message || 'Password reset email sent. Please check your inbox.');
        return true;
      } else {
        setError(response.message || 'Failed to send reset email');
        return false;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string, passwordConfirm: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setMessage(null);

        if (password !== passwordConfirm) {
          setError('Passwords do not match');
          return false;
        }

        const response = await authService.resetPassword({ token, password, password_confirm: passwordConfirm });

        if (response.success) {
          setSuccess(true);
          setMessage(response.message || 'Password reset successful. Please log in with your new password.');
          return true;
        } else {
          setError(response.message || 'Failed to reset password');
          return false;
        }
      } catch (err: any) {
        const errorMsg = err.message || 'An error occurred';
        setError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setMessage(null);
  }, []);

  return {
    loading,
    error,
    success,
    message,
    forgotPassword,
    resetPassword,
    reset,
  };
}
