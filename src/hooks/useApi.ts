import { useEffect, useRef, useState, useCallback } from 'react';
import apiClient from '../services/api';

interface UseApiOptions {
  skip?: boolean;
  cacheDuration?: number; // in milliseconds
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: any | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<any | null>(null);
  const cacheKeyRef = useRef(endpoint);

  const fetchData = useCallback(async () => {
    const cacheKey = cacheKeyRef.current;
    const cached = cache.get(cacheKey);

    // Return cached data if available and not expired
    if (cached && options.cacheDuration) {
      const age = Date.now() - cached.timestamp;
      if (age < options.cacheDuration) {
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<T>(endpoint);
      const responseData = response.data.data || response.data;

      setData(responseData);

      // Cache the response
      if (options.cacheDuration) {
        cache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now(),
        });
      }

      options.onSuccess?.(responseData);
    } catch (err) {
      setError(err);
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    if (!options.skip) {
      fetchData();
    }
  }, [endpoint, options.skip, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useMutation<T = any, D = any>(
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options: { onSuccess?: (data: T) => void; onError?: (error: any) => void } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const mutate = useCallback(
    async (endpoint: string, data?: D): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient[method]<T>(endpoint, data);
        const responseData = response.data.data || response.data;

        // Invalidate relevant cache entries
        cache.forEach((_, key) => {
          if (key.includes(endpoint.split('/')[0])) {
            cache.delete(key);
          }
        });

        options.onSuccess?.(responseData);
        return responseData;
      } catch (err) {
        setError(err);
        options.onError?.(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [method, options]
  );

  return { mutate, loading, error };
}
