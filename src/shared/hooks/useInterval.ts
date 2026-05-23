import { useEffect } from 'react';
import { useStableCallback } from './useStableCallback';

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useStableCallback(callback);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(savedCallback, delay);
      return () => clearInterval(id);
    }
  }, [delay, savedCallback]);
}
