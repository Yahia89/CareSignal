# CareSignal API reference

Source: OpenAPI 3.0.3 spec at `https://carsignal-api.vercel.app/api/docs` (the `/docs` page is a Swagger UI shell — the JSON lives at `/api/docs`).

This file is the **source of truth** for backend integration. When wiring a new endpoint:

1. Pull the request/response shapes from this doc — don't re-read the live spec each time.
2. Update the **Integration status** table at the bottom with `✅ wired` / `⏳ pending` / `🚫 blocked` and a path to the service file.
3. If the spec ever changes, **update this doc first**, then update the code.

> ⚠️ **No breaking changes**: when adding new endpoints, *extend* `src/types.ts` and `src/services/auth.service.ts` (or create a new `<domain>.service.ts`). Don't rename or remove existing keys without updating every caller in the same commit.

---

## Conventions

### Auth
- All protected routes require `Authorization: Bearer <access_token>`.
- Tokens come from `/auth/login`, `/auth/signup`, or `/auth/refresh`.
- Access token lifetime: **1 hour** (JWT `exp`).
- Supabase **rotates** the refresh token on every `/auth/refresh` — always store the new one.
- 401 from any endpoint → token expired or invalid; force logout (already handled in `apiClient` interceptor).

### Response envelope
**Every** endpoint wraps its payload in:
```json
{ "data": <payload> | null, "error": <string> | null }
```
- Exactly one of the two is non-null on a "successful" HTTP status.
- `auth.service.ts` has an `unwrap<T>(envelope)` helper that returns `data` or throws `error`.
- For paginated responses there's a third field `meta: Pagination`.

### Error schema
```ts
{ data: null, error: string }
```
HTTP status codes carry the actual semantic. `error` is a human-readable string we can surface in the UI.

### Roles
- `senior` — can submit check-ins, log vitals, generate invite codes.
- `family` — can read senior's status, manage alert settings, view alert history (Plus plan), accept invites.
- API enforces role per endpoint. `403` = wrong role.

### Plan tiers
- `free` (default) — basic features.
- `plus` — adds alert history (`/alerts`).
- `pro` — reserved for future features.
- `403` with `"plan below Plus"` message means upgrade required.

### Rate limits (per user)
| Endpoint | Limit |
|---|---|
| `/auth/signup` | 5/min |
| `/auth/login` | 10/min |
| `/auth/forgot-password` | 3/min |
| `/auth/reset-password` | 5/min |
| `/auth/verify-email` | 5/min |
| `/auth/refresh` | 60/min |
| `/vitals` POST | 20/min |
| `/check-ins` POST | 5/min |
| `/alert-settings` PUT | 20/min |

---

## Schemas

### `Session`
Returned by login/signup/refresh/verify-email.
```ts
{
  access_token: string;       // JWT, ~1hr lifetime
  refresh_token: string;      // rotates on each refresh
  expires_in: number;         // seconds (e.g. 3600)
  user: User;                 // id + email only
}
```

### `User` (auth payload — minimal)
```ts
{ id: string /* uuid */, email: string }
```
**Note**: name, role, phone come from the *Profile* resource, not Session.user.

### `Profile`
```ts
{
  id: string;                 // uuid
  user_id: string;            // uuid (FK → auth user)
  first_name: string;
  last_name: string;
  role: 'senior' | 'family';
  plan: 'free' | 'plus' | 'pro';
  phone_number: string | null;
  created_at: string;         // ISO 8601 datetime
}
```

### `Link`
Senior ↔ Family pairing.
```ts
{
  id: string;                 // uuid
  senior_user_id: string;     // uuid
  family_user_id: string | null;  // null until accepted
  invite_code: string;        // hex (currently 10 chars in prod, e.g. "4EB82C8D9D"). Spec originally said 5-char "AB12C" — flag the divergence with the backend team before launch.
  status: 'pending' | 'active';
  created_at: string;         // ISO 8601
}
```

### `Vital`
```ts
{
  id: string;                 // uuid
  senior_user_id: string;     // uuid
  vital_type: 'blood_sugar' | 'blood_pressure';
  value: number;              // e.g. 95
  unit: string;               // e.g. "mg/dL"
  input_method: 'camera' | 'manual';
  recorded_at: string;        // ISO 8601
}
```

### `CheckIn`
```ts
{
  id: string;                 // uuid
  senior_user_id: string;     // uuid
  status: 'ok' | 'needs_help' | 'urgent';
  checked_in_at: string;      // ISO 8601
}
```

### `AlertSettings`
```ts
{
  vital_capture_enabled: boolean;
  needs_help_email: boolean;
  needs_help_text: boolean;
  needs_help_phone: boolean;
  urgent_help_email: boolean;
  urgent_help_text: boolean;
  urgent_help_phone: boolean;
  urgent_auto_call_senior: boolean;
}
```

### `Alert`
```ts
{
  id: string;                 // uuid
  senior_profile_id: string;  // uuid
  family_profile_id: string;  // uuid
  trigger_type: 'ok' | 'needs_help' | 'urgent';
  dismissed_at: string | null;
  created_at: string;         // ISO 8601
}
```

### `Pagination`
Returned in `meta` on paginated list endpoints.
```ts
{ page: number; limit: number; total: number; totalPages: number }
```

---

## Auth — `/api/auth/*`

### `POST /auth/signup` (public)
Register a new user. Sends a confirmation email.
- Body: `{ email, password (≥8), first_name, last_name, role: 'senior' | 'family' }`
- 201 → `{ data: Session }` (session is "pending" until email confirmed)
- 409 → email already registered
- 422 → validation error
- 429 → rate-limited

### `POST /auth/login` (public)
- Body: `{ email, password }`
- 200 → `{ data: Session }`
- 401 → invalid credentials
- 429 → rate-limited

### `POST /auth/logout`
- Auth required.
- 200 → logged out (server invalidates refresh token).

### `POST /auth/forgot-password` (public)
Always returns 200 — doesn't reveal whether the email exists (OWASP A07).
- Body: `{ email }`
- 200 → "if registered, email sent"

### `POST /auth/reset-password` (public)
Called from the deep link in the password-reset email.
- Body: `{ token_hash, type: 'recovery', password (≥8) }`
- 200 → password updated

Deep-link format: `caresignal://auth/confirm?token_hash=<hash>&type=recovery`

### `POST /auth/verify-email` (public)
Called from the deep link in the email-confirmation email after signup.
- Body: `{ token_hash, type: 'signup' | 'email' }`
- 200 → `{ data: Session }` — user is now signed in.

### `POST /auth/refresh` (public)
- Body: `{ refresh_token }`
- 200 → `{ data: Session }` — **store the new `refresh_token`**, the old one is now invalid.
- Already wired up in `tokenManager.ts` with proactive refresh 5min before `exp`.

---

## Profile — `/api/profiles/*`

### `GET /profiles/me`
- Auth required.
- 200 → `{ data: Profile }`
- Used by `AuthContext.finalizeAuth` after login/signup to enrich the user with name + role.

### `PATCH /profiles/me`
Partial update.
- Body: `{ first_name?, last_name? }`
- 200 → `{ data: Profile }` (updated)
- 422 → validation error

---

## Links — `/api/links/*`
Senior ↔ Family pairing.

### `POST /links/generate-invite` *(senior only)*
- Auth required, role=`senior`.
- 200 → `{ data: { invite_code: string } }` — code to share. Spec originally specified 5-char (`"AB12C"`); production currently returns 10-char hex (`"4EB82C8D9D"`). Client accepts either via `maxLength: 32` and a `length >= 4` validator.
- 403 → not a senior.

### `GET /links`
- Auth required.
- 200 → `{ data: Link }` (single — current pairing).

### `POST /links/accept` *(family only)*
- Auth required, role=`family`.
- Body: `{ invite_code }`
- 200 → `{ data: Link }` (now `status: 'active'`)
- 400 → invalid or already-used code.

### `DELETE /links/{id}`
- Auth required (must own the link).
- 204 → revoked.
- 404 → not found.

---

## Vitals — `/api/vitals` *(senior only)*

### `POST /vitals`
- Body: `{ vital_type: 'blood_sugar' | 'blood_pressure', value: number, unit: string, input_method: 'camera' | 'manual' }`
- 201 → `{ data: Vital }`
- 429 → 20/min limit

### `GET /vitals`
- Query: `?page=1&limit=20&vital_type=blood_sugar`
- 200 → `{ data: Vital[], meta: Pagination }`
- `limit` cap: 100.

---

## Check-ins — `/api/check-ins` *(senior only)*

### `POST /check-ins`
- Body: `{ status: 'ok' | 'needs_help' | 'urgent' }`
- 201 → `{ data: CheckIn }`
- 429 → 5/min limit

### `GET /check-ins`
- Query: `?page=1&limit=20`
- 200 → `{ data: CheckIn[], meta: Pagination }`

### `GET /check-ins/today`
- 200 → `{ data: CheckIn | null }` — null if not yet checked in today.

---

## Alert settings — `/api/alert-settings` *(family only)*

### `GET /alert-settings`
- 200 → `{ data: AlertSettings }`

### `PUT /alert-settings`
**Full replace** — send all fields.
- Body: full `AlertSettings`
- 200 → `{ data: AlertSettings }` (updated)
- 429 → 20/min limit

---

## Alerts — `/api/alerts` *(family only — Plus plan required)*

### `GET /alerts`
- Query: `?page=1&limit=20`
- 200 → `{ data: Alert[], meta: Pagination }`
- 403 → either not family OR plan below Plus.

### `PATCH /alerts/{id}` — dismiss
Marks `dismissed_at` — alert stays in history.
- 200 → `{ data: Alert }`
- 404 → not found.

---

## Senior status — `/api/senior/status` *(family only)*

### `GET /senior/status`
Returns the linked senior's status for the family dashboard.
- 200 →
  ```ts
  {
    data: {
      senior: Profile;
      check_in: CheckIn | null;
      care_status: 'checked_in_ok' | 'needs_help' | 'urgent' | 'not_checked_in';
    }
  }
  ```
- 403 → not family OR no active link.

This is the primary endpoint behind the FamilyDashboardScreen.

---

## Integration status

Update this table as endpoints get wired. Service file path is the file that owns the call.

| Endpoint | Method | Status | Service / location |
|---|---|---|---|
| `/auth/signup` | POST | ✅ wired | `src/services/auth.service.ts` → `authService.signup()` |
| `/auth/login` | POST | ✅ wired | `src/services/auth.service.ts` → `authService.login()` |
| `/auth/logout` | POST | ✅ wired | `src/services/auth.service.ts` → `authService.logout()` |
| `/auth/forgot-password` | POST | ✅ wired | `authService.forgotPassword()` + `useForgotPassword` hook + `ForgotPasswordScreen` |
| `/auth/reset-password` | POST | ✅ wired | `authService.resetPassword()` (now takes `token_hash`/`type`/`password` per spec) |
| `/auth/verify-email` | POST | ✅ wired | `authService.verifyEmail()` via `AuthContext.verifyEmail()`; ConfirmDeepLinkScreen handles `caresignal://auth/confirm?token_hash=…&type=signup\|email` |
| `/auth/refresh` | POST | ✅ wired (proactive + 401-retry) | `tokenManager.refreshAccessToken` runs 5min before exp; **also** triggered on any 401 via the axios response interceptor in `services/api.ts` (calls `setRefreshCallback`-registered fn, retries the original request once) |
| `/profiles/me` | GET | ✅ wired | `authService.getProfile()` — called from `AuthContext.finalizeAuth` |
| `/profiles/me` | PATCH | ✅ service wired | `authService.updateProfile()` — UI binding pending |
| `/links/generate-invite` | POST | ✅ wired | `linksService.generateInvite()` — PairingScreen "Generate invite code" button (senior) |
| `/links` | GET | ✅ wired | `linksService.getMyLink()` — PairingScreen fetches on mount + pull-to-refresh; 404 → "no link" empty state |
| `/links/accept` | POST | ✅ wired | `linksService.acceptInvite({ invite_code })` — PairingScreen "Accept invite" (family); bounces to FamilyDashboard on success |
| `/links/{id}` | DELETE | ✅ wired | `linksService.revokeLink(id)` — PairingScreen "Revoke link" with Alert confirmation |
| `/vitals` | POST | ✅ wired | `vitalsService.createVital()` — Save Reading button in CheckInHome with positive-number validation + default unit per vital type |
| `/vitals` | GET | ✅ service wired | `vitalsService.listVitals()` — UI binding pending (history screen) |
| `/check-ins` | POST | ✅ wired | `checkInsService.createCheckIn()` — three status buttons in CheckInHome with inline error + post-submit disabled state |
| `/check-ins` | GET | ✅ service wired | `checkInsService.listCheckIns()` — UI binding pending |
| `/check-ins/today` | GET | ✅ wired | `checkInsService.getTodayCheckIn()` — fetched on CheckInHome mount; null = no check-in yet, set = renders "already checked in" card |
| `/alert-settings` | GET | ✅ wired | `alertSettingsService.get()` — SettingsScreen fetches on mount + pull-to-refresh; 404 → falls back to `DEFAULT_ALERT_SETTINGS` |
| `/alert-settings` | PUT | ✅ wired | `alertSettingsService.update()` — SettingsScreen optimistic toggle + 400ms debounce; revert + inline error on failure |
| `/alerts` | GET | ✅ wired | `alertsService.listAlerts()` — AlertsScreen FlatList with infinite scroll + pull-to-refresh; gated to Plus/Pro plan client-side |
| `/alerts/{id}` | PATCH | ✅ wired | `alertsService.dismiss()` — per-row "Dismiss" button updates the row in place |
| `/senior/status` | GET | ✅ wired | `seniorService.getStatus()` — FamilyDashboard fetches on mount + pull-to-refresh; 403 → "Get linked" empty state |

---

## Suggested next-up integration order

When you tell me to wire one of these, I'll create the service + types + UI binding in one commit. My recommended order:

1. **`POST /check-ins`** — wire the three "I'm OK / I Need Help / Urgent Help" buttons in `CheckInHome.tsx`. Smallest change, big visible impact.
2. **`GET /check-ins/today`** — show today's status on CheckInHome instead of always greeting fresh.
3. **`POST /vitals`** — wire the Save Reading button.
4. **`GET /senior/status`** — light up FamilyDashboard with real data.
5. **`POST /links/generate-invite` + `POST /links/accept`** — finish the senior↔family pairing flow.
6. **`/alert-settings`** — read + write from FamilySettings.
7. **`/alerts`** — alert history (Plus plan gated).
8. **Profile edit + Email verification deep link** — polish.

Tell me which one to start with.
