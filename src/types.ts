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

/**
 * `/auth/reset-password` per the OpenAPI spec — `token_hash` + `type` come
 * from the deep link `caresignal://auth/confirm?token_hash=xxx&type=recovery`.
 */
export interface ResetPasswordPayload {
  token_hash: string;
  type: 'recovery';
  password: string;
}

/** PATCH /profiles/me body — partial update; both fields optional. */
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
}

/** Link record (senior ↔ family pairing). */
export interface Link {
  id: string;
  senior_user_id: string;
  family_user_id: string | null;
  invite_code: string;
  status: 'pending' | 'active';
  created_at: string;
}

export interface AcceptInvitePayload {
  invite_code: string;
}

export interface GenerateInviteResult {
  invite_code: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

/**
 * `/api/auth/refresh` returns a fresh Session, same shape as login. We expose
 * it under this name for clarity at the call site.
 */
export type RefreshTokenResponse = Session;

// ─── Check-ins ─────────────────────────────────────────────────────────────

/** Senior's status report — three discrete options matching the Figma buttons. */
export type CheckInStatus = 'ok' | 'needs_help' | 'urgent';

/** GET /api/check-ins / GET /api/check-ins/today result. */
export interface CheckIn {
  id: string;
  senior_user_id: string;
  status: CheckInStatus;
  checked_in_at: string; // ISO 8601
}

/** POST /api/check-ins body. */
export interface CreateCheckInPayload {
  status: CheckInStatus;
}

// ─── Vitals ────────────────────────────────────────────────────────────────

export type VitalType = 'blood_sugar' | 'blood_pressure';
export type VitalInputMethod = 'camera' | 'manual';

/** GET /api/vitals row. */
export interface Vital {
  id: string;
  senior_user_id: string;
  vital_type: VitalType;
  value: number;
  unit: string;
  input_method: VitalInputMethod;
  recorded_at: string; // ISO 8601
}

/** POST /api/vitals body. */
export interface CreateVitalPayload {
  vital_type: VitalType;
  value: number;
  unit: string;
  input_method: VitalInputMethod;
}

/** Default unit per vital type — matches the spec's example values. */
export const DEFAULT_VITAL_UNIT: Record<VitalType, string> = {
  blood_sugar: 'mg/dL',
  blood_pressure: 'mmHg',
};

// ─── Alerts (family, Plus plan) ───────────────────────────────────────────

export type AlertTriggerType = 'ok' | 'needs_help' | 'urgent';

/** GET /api/alerts row. */
export interface ApiAlert {
  id: string;
  senior_profile_id: string;
  family_profile_id: string;
  trigger_type: AlertTriggerType;
  dismissed_at: string | null;
  created_at: string;
}

// ─── Alert settings (family) ──────────────────────────────────────────────

/** GET /api/alert-settings & PUT /api/alert-settings shape (family only). */
export interface AlertSettings {
  vital_capture_enabled: boolean;
  needs_help_email: boolean;
  needs_help_text: boolean;
  needs_help_phone: boolean;
  urgent_help_email: boolean;
  urgent_help_text: boolean;
  urgent_help_phone: boolean;
  urgent_auto_call_senior: boolean;
}

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  vital_capture_enabled: false,
  needs_help_email: true,
  needs_help_text: false,
  needs_help_phone: false,
  urgent_help_email: true,
  urgent_help_text: true,
  urgent_help_phone: false,
  urgent_auto_call_senior: false,
};

// ─── Senior status (family dashboard) ─────────────────────────────────────

/** care_status from GET /api/senior/status — derived server-side from today's check-in. */
export type CareStatus = 'checked_in_ok' | 'needs_help' | 'urgent' | 'not_checked_in';

/** GET /api/senior/status result (family only). */
export interface SeniorStatusResult {
  senior: Profile;
  check_in: CheckIn | null;
  care_status: CareStatus;
}

/** Pagination meta returned alongside paginated list responses. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Paginated response envelope (`{ data, error, meta }`). */
export interface PaginatedEnvelope<T> {
  data: T[] | null;
  error: string | null;
  meta?: PaginationMeta;
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
