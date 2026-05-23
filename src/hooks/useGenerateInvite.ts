import { useCallback, useState } from 'react';
import { linksService } from '../services/links.service';

interface UseGenerateInviteReturn {
  loading: boolean;
  error: string | null;
  inviteCode: string | null;
  generateInvite: () => Promise<boolean>;
  reset: () => void;
  copyToClipboard: () => Promise<void>;
}

export function useGenerateInvite(): UseGenerateInviteReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const generateInvite = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const code = await linksService.generateInvite();
      setInviteCode(code);
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate invite code';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!inviteCode) return;

    try {
      // For React Native, use clipboard library
      // This is a placeholder - install @react-native-clipboard/clipboard
      // import Clipboard from '@react-native-clipboard/clipboard';
      // Clipboard.setString(inviteCode);

      console.log('Invite code copied:', inviteCode);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [inviteCode]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setInviteCode(null);
  }, []);

  return {
    loading,
    error,
    inviteCode,
    generateInvite,
    reset,
    copyToClipboard,
  };
}
