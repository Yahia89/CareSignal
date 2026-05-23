import { useCallback, useState } from 'react';
import { authService } from '../services/auth.service';

interface UseForgotPasswordReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  /**
   * Request a password-reset email. Always returns `true` on a 2xx response —
   * per the API spec the server doesn't reveal whether the email is registered
   * (OWASP A07), so we treat any 2xx as "email sent if address was registered".
   */
  forgotPassword: (email: string) => Promise<boolean>;
  /**
   * Set a new password using the reset deep-link token. The `tokenHash` comes
   * from the URL query string of the `caresignal://auth/confirm?token_hash=…&type=recovery`
   * deep link the user clicks in their email.
   */
  resetPassword: (
    tokenHash: string,
    password: string,
    passwordConfirm: string
  ) => Promise<boolean>;
  reset: () => void;
}

import { extractApiError as extractError } from '../shared/utils';

export function useForgotPassword(): UseForgotPasswordReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setMessage(null);

    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
      setMessage(
        'If that email is registered, we just sent a reset link. Check your inbox.'
      );
      return true;
    } catch (err: any) {
      setError(extractError(err, 'Failed to request password reset.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (
      tokenHash: string,
      password: string,
      passwordConfirm: string
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setMessage(null);

      if (password !== passwordConfirm) {
        setError('Passwords do not match');
        setLoading(false);
        return false;
      }

      try {
        await authService.resetPassword({
          token_hash: tokenHash,
          type: 'recovery',
          password,
        });
        setSuccess(true);
        setMessage('Password updated. You can now log in with your new password.');
        return true;
      } catch (err: any) {
        setError(extractError(err, 'Failed to reset password.'));
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

  return { loading, error, success, message, forgotPassword, resetPassword, reset };
}
