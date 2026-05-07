import { User } from '../../../shared/types/domain';

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginPayload {
  email: string;
  password: string;
  familyAccount?: string;
  /** Optional override for demo/testing; in real flow, role comes from the API. */
  role?: User['role'];
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    // Mock API call — real call would be:
    // return apiClient.post<AuthResponse>('/auth/login', payload);

    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      user: {
        id: '1',
        role: payload.role ?? 'family',
        name: payload.email.split('@')[0] || 'Eleanor',
        phoneNumber: '',
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
