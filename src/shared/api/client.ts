import { ApiError, ApiResponse } from '../types/api';
import { logger } from '../utils/logger';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // In a real app we'd inject the auth token here from secure storage
    // const token = await SecureStore.getItemAsync('auth_token');
    // if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, { ...options, headers });
      
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        const error: ApiError = {
          message: data?.message || 'An error occurred',
          code: data?.code || 'UNKNOWN_ERROR',
          status: response.status,
        };
        throw error;
      }

      return data as T;
    } catch (error) {
      logger.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
