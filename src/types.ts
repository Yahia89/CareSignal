// Common Types

/**
 * User roles per the CareSignal API spec (`/api/auth/signup` and the Profile
 * schema both enumerate `'senior' | 'family'`).
 *
 * Note: `'admin'` is reserved for future use server-side and not selectable
 * from any current screen.
 */
export type UserRole = 'senior' | 'family';

/**
 * Standard API envelope used by every CareSignal endpoint:
 *   { data: T | null, error: string | null }
 * Exactly one of the two is populated. `auth.service.ts` unwraps this so
 * callers see plain `T` and a thrown Error on `error !== null`.
 */
export interface ApiEnvelope<T> {
  data: T | null;
  error: string | null;
}

/**
 * `Session.user` from the API only carries `{ id, email }`. Profile data
 * (name, role, phone) lives in a separate Profile resource at
 * `GET /api/profiles/me`.
 */
export interface ApiUser {
  id: string;
  email: string;
}

/** GET /api/profiles/me result. */
export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  plan?: 'free' | 'plus' | 'pro';
  phone_number?: string | null;
  created_at?: string;
}

/** Inner Session payload returned by login / signup / verify-email / refresh. */
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  user: ApiUser;
}

/** App-shaped User after Session.user is enriched with Profile data. */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  token_hash: string;
  type: 'signup' | 'email';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  password_confirm: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

/**
 * `/api/auth/refresh` returns a fresh Session, same shape as login. We expose
 * it under this name for clarity at the call site.
 */
export type RefreshTokenResponse = Session;

export interface GenerateInviteResponse {
  data: {
    invite_code: string;
  };
  error: null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
