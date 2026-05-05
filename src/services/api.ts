import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { storage } from '../utils/storage';

const API_BASE_URL = 'https://carsignal-api.vercel.app/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;
  access_token?: string;
}

interface ApiError {
  message: string;
  code?: string | undefined;
  status?: number | undefined;
}

let authToken: string | null = null;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      authToken = null;
      await storage.clear();
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.code,
      status: error.response?.status,
    };

    return Promise.reject(apiError);
  }
);

export const setAuthToken = async (token: string) => {
  authToken = token;
  await storage.setToken(token);
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const clearAuthToken = async () => {
  authToken = null;
  await storage.clear();
};

export const initializeAuthToken = async () => {
  const token = await storage.getToken();
  if (token) {
    authToken = token;
  }
};

export default apiClient;
