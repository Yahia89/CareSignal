import { AuthSession, User, UserRole } from '../types';

const MOCK_DELAY = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_USERS: Record<string, User> = {
  '+15550142': { id: 'elder-1', name: 'Margaret Chen', phone: '+15550142', role: 'elder' },
  '+15550201': { id: 'family-1', name: 'David Chen', phone: '+15550201', role: 'family' },
};

const EMAIL_CREDENTIALS: Record<string, { password: string; phone: string }> = {
  'margaret@caresignal.com': { password: 'senior123', phone: '+15550142' },
  'david@caresignal.com': { password: 'family123', phone: '+15550201' },
};

export const authService = {
  async loginWithEmail(email: string, password: string): Promise<{ session: AuthSession; user: User }> {
    await delay(MOCK_DELAY);
    const creds = EMAIL_CREDENTIALS[email.toLowerCase().trim()];
    if (!creds || creds.password !== password) {
      throw new Error('Invalid email or password.');
    }
    const user = MOCK_USERS[creds.phone]!;
    const session: AuthSession = {
      token: `mock-token-${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    return { session, user };
  },

  async sendOtp(phone: string): Promise<void> {
    await delay(MOCK_DELAY);
    console.log(`[mock] OTP sent to ${phone}: 123456`);
  },

  async verifyOtp(phone: string, otp: string): Promise<{ session: AuthSession; isNewUser: boolean }> {
    await delay(MOCK_DELAY);
    if (otp !== '123456') throw new Error('Invalid OTP. Please try again.');
    const session: AuthSession = {
      token: `mock-token-${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    return { session, isNewUser: !MOCK_USERS[phone] };
  },

  async setRole(token: string, role: UserRole): Promise<User> {
    await delay(MOCK_DELAY);
    return { id: 'family-2', name: 'Lisa Chen', phone: '+15550300', role };
  },

  async getMe(phone: string): Promise<User | null> {
    await delay(400);
    return MOCK_USERS[phone] ?? null;
  },

  async signOut(): Promise<void> {
    await delay(300);
  },
};
