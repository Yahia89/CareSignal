import apiClient from './api';
import { PaginationParams, PaginatedResponse } from '../types';

// TEMPLATE: Replace with actual endpoints from Swagger

// Example structure for any service
export const exampleService = {
  // GET endpoints
  getList: async (params?: PaginationParams) => {
    const response = await apiClient.get('/example', { params });
    return response.data.data || response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/example/${id}`);
    return response.data.data || response.data;
  },

  // POST endpoints
  create: async (data: any) => {
    const response = await apiClient.post('/example', data);
    return response.data.data || response.data;
  },

  // PUT endpoints
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/example/${id}`, data);
    return response.data.data || response.data;
  },

  // DELETE endpoints
  delete: async (id: string) => {
    const response = await apiClient.delete(`/example/${id}`);
    return response.data.data || response.data;
  },
};

// INSTRUCTIONS:
// 1. Replace 'example' with actual endpoint names from Swagger
// 2. Update method signatures based on actual request/response schemas
// 3. Add type safety with proper TypeScript interfaces
// 4. Consider caching strategies for GET requests
// 5. Add proper error handling for each endpoint
