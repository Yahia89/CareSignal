import { User } from '../../../shared/types/domain';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(phoneNumber: string): Promise<AuthResponse> {
    // This is a mock API call
    // return apiClient.post<AuthResponse>('/auth/login', { phoneNumber });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success
    return {
      user: {
        id: '1',
        role: 'elder',
        name: 'Eleanor',
        phoneNumber,
      },
      token: 'demo-token-xyz',
    };
  },

  async signUp(data: any): Promise<AuthResponse> {
    // This is a mock API call
    // return apiClient.post<AuthResponse>('/auth/signup', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success
    return {
      user: {
        id: '2',
        role: data.role || 'elder',
        name: `${data.firstName} ${data.lastName}`,
        phoneNumber: '1234567890',
      },
      token: 'demo-token-signup',
    };
  }
};
