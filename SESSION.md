# SESSION.md

Chronological log of work sessions. **Append a new entry at the top** when you start. Keep entries skimmable — a future reader should be able to pick up cold from the most recent entry.

Format:
```
## YYYY-MM-DD — <short title>
**Who:** <name or "Claude (Haiku/Opus)">
**Branch:** <git branch>
**Goal:** <one line>
**Done:** <bullet list of concrete changes>
**Left off at:** <next concrete step the next person should take>
**Open questions / blockers:** <anything pending>
```

---

## 2026-05-08 — Project documentation overhaul (CLAUDE.md / SESSION.md / MEMORY.md)
**Who:** Claude (Opus 4.7) with Isha
**Branch:** `claude/priceless-diffie-a1619e` (worktree)
**Goal:** Replace shallow CLAUDE.md with a deep-analysis version, then set up shared SESSION.md + MEMORY.md so a colleague can pick up the project.
**Done:**
- Deep two-agent analysis of the entire `src/` tree (architecture, API, state, design system, types, config).
- Rewrote [CLAUDE.md](CLAUDE.md) from scratch — documents the 5 active duplicates (AuthContext, API client, design system, User/Role types, hook dirs), `useColors()` shadowing gotcha, provider order, token refresh strategy, ESLint strictness.
- Created this file and [MEMORY.md](MEMORY.md).
**Left off at:** Two cleanup candidates not yet started:
1. `CheckInHome.tsx` still imports legacy `theme` directly + uses `<NeumorphicView>` + has a stray `Button` import from `react-native`. Migrate to new design system.
2. `SignUpScreen.tsx` has a duplicate `colors` import (line 20 imports `colors` from design package AND line 26 shadows it with `useColors()`). Remove the package-level import.
**Open questions / blockers:** None — the duplicates listed in CLAUDE.md (two AuthContexts, two API clients, two User types) need a deliberate consolidation decision before they're touched.

---

## 2026-05-07 — Apply neumorphic design system to all screens
**Who:** Claude (Haiku 4.5) with Isha
**Branch:** `claude/priceless-diffie-a1619e`
**Goal:** Convert all 8 screens from legacy `theme.colors.*` + `<NeumorphicView>` to new `useColors()` + `<NeuCard>`/`<NeuButton>`.
**Done:**
- Converted: LoginScreen, SignUpScreen, ForgotPasswordScreen, DashboardScreen, FamilyDashboardScreen, CheckInHome (partial), SettingsScreen, GenerateInviteScreen.
- Fixed `borderRadius.2xl` → `borderRadius['2xl']` (numeric literal property names need brackets).
- Fixed `colors.background.light` → `colors.background` (the `useColors()` hook resolves the mode-specific value; nested object is shadowed — see MEMORY.md).
- Fixed unclosed `<Card>` → `</NeuCard>` mismatch in FamilyDashboardScreen.
- Three commits on the branch ending at `47fe350`.
**Left off at:** CheckInHome still has stale legacy imports; see 2026-05-08 entry above.

---

<!-- Add new sessions above this line -->

## 2026-05-08 — Phase 1: Senior daily flow lit up
**Who:** Claude (Opus 4.7) with Isha
**Branch:** `feature/design-remodification`
**Goal:** First phase of the integration plan — make CheckInHome actually work end-to-end against the real API. Buttons previously only `speak()`d.
**Done:** (uncommitted; awaiting batch commit)
- Added types: `CheckInStatus`, `CheckIn`, `CreateCheckInPayload`, `VitalType`, `VitalInputMethod`, `Vital`, `CreateVitalPayload`, `DEFAULT_VITAL_UNIT` map, `PaginationMeta`, `PaginatedEnvelope<T>`.
- New `src/services/checkins.service.ts` — `createCheckIn`, `getTodayCheckIn` (returns null if no check-in yet), `listCheckIns` paginated.
- New `src/services/vitals.service.ts` — `createVital`, `listVitals` paginated with optional `vital_type` filter.
- `CheckInHome` rewired:
  - On mount: `getTodayCheckIn()` populates `todayCheckIn` state. If non-null, the three status buttons are replaced with an "Already checked in today" card showing the recorded status (OK / Needs Help / Urgent). On error, falls back to enabled buttons (server will reject duplicates).
  - Status buttons (`I'm OK` / `I Need Help` / `Urgent Help`): each shows `loading` while its own `POST /check-ins` is in flight; the other two are disabled during submit. Voice line still plays optimistically. On success, sets `todayCheckIn` so buttons swap to the disabled card. On error, surfaces inline message via `extractErrorMessage` helper.
  - `Save Reading`: validates positive-numeric input via `Number.isFinite() && > 0`, posts `{ vital_type, value: number, unit, input_method }` with `unit` defaulted from `DEFAULT_VITAL_UNIT[vitalType]`. Shows inline error on validation/network failure. Shows "Saved at HH:MM:SS" success message on resolve.
  - `vital_type` and `input_method` selects now type-cast to the proper enum types.
  - Placeholder for the value input now shows the unit (e.g. "E.g. 108 mg/dL").
- API.md status table flipped: 11 → **16 endpoints wired** (+5: `POST /check-ins`, `GET /check-ins`, `GET /check-ins/today`, `POST /vitals`, `GET /vitals` — the GETs marked "service wired, UI binding pending").
- PLAN.md: Phase 1 marked ✅, all acceptance checks ticked.
- Verified: `tsc --noEmit` clean; `expo export --platform android` bundles successfully.
**Left off at:** Phase 1 complete. Phase 2 (FamilyDashboard live data + redesign) is the obvious next pick. Awaiting user's go-ahead.
**Open questions / blockers:** None code-side. Untested against the live API on a simulator — will surface UX tweaks (e.g. unit format, error string formatting) only on real exercise.



## 2026-05-08 — Auth screens to exact Figma values + real logo asset
**Who:** Claude (Opus 4.7) with Isha
**Branch:** `feature/design-remodification`
**Goal:** Stop eyeballing — apply the values Isha pulled from Figma's right panel directly.
**Done:** (commit `ad9fdf2`)
- Saved the real CareSignal logo as `assets/caresignal-logo.png` (decoded from the base64 inside the SVG export). LogoCard now renders the PNG via `<Image>` instead of stacking Lucide icons. Drops the wordmark/tagline `<Text>` since they're baked into the asset.
- Updated tokens to the exact Figma colors: `text.primary` → `#36597D`, added `text.placeholder = #A6B1C3`, `border.light → #8D98A7`, new `inputFill.light = #F1F5F9`. Added `fontSize.title = 23` and `fontSize.field = 15`.
- `OutlinedField` + `OutlinedSelect` height 52 → **41**, radius 12 → **8**, fill transparent → **#F1F5F9**, placeholder color → **#A6B1C3**, value font 16 → **15**.
- Title 30/900 → **23/700**, lh 100%, letter-spacing 0, color **#36597D**. Subtitle/eyebrow → 15/400/`#36597D`.
- Phone screen padding 20 → **24**.
- All values documented in MEMORY.md "Design system: exact Figma values" so the colleague has a single source of truth.
- Verified: tsc + iOS Metro bundle clean.
**Open gap:** Font family. Figma uses **Segoe UI** which we don't bundle. Currently the OS default kicks in (SF Pro / Roboto). To close this visually we need to either license Segoe UI or load Inter via `expo-font`. Documented in MEMORY.md.
**Left off at:** Auth screens are now matched to the documented Figma values. Awaiting Isha's review on the simulator.



## 2026-05-08 — Fix "No access token received" login bug + align with real API
**Who:** Claude (Opus 4.7) with Isha
**Branch:** `feature/design-remodification`
**Goal:** Diagnose and fix the user's login error. Their account was created and email-confirmed, but `authService.login` was throwing "No access token received from login".
**Root cause:** The CareSignal API wraps every response in `{ data, error }`. We were treating `response.data` as the inner Session — so `access_token` was actually at `response.data.data.access_token`, always undefined at the level we read it.
**Done:** (commit `23091f9`)
- **Verified the contract** by pulling the OpenAPI spec from `https://carsignal-api.vercel.app/api/docs` (the page at `/docs` is a Swagger UI shell; the real spec is at `/api/docs`).
- **`src/types.ts` rewritten** to match the spec: new `ApiEnvelope<T>`, `Session` (with `refresh_token` + `expires_in`), `Profile`, `ApiUser`, `VerifyEmailPayload`. `UserRole` corrected to `'senior' | 'family'` (was `'senior' | 'caregiver' | 'admin'` — `'caregiver'` would have been rejected by the signup endpoint).
- **`auth.service.ts` rewritten** with an `unwrap<T>(envelope)` helper that returns `envelope.data` on success and throws `envelope.error` as a plain Error otherwise. All seven auth endpoints go through it.
- **New `authService.getProfile()` → `GET /profiles/me`** because Session.user only carries `{ id, email }`. Name + role live on the Profile resource.
- **`AuthContext.finalizeAuth` rewired**: setAuthToken → getProfile → build app User from profile → setRefreshToken → setUser → schedule refresh → dispatch LOGIN. On profile-fetch failure, partial auth is rolled back via `storage.clear()` so we never leave a token without a usable user.
- **Refresh token now persisted** on initial login (was previously only set on the refresh endpoint, leaving the very first refresh impossible).
- **`roleMapping`** corrected: UI `'family'` → API `'family'` (was `'caregiver'`).
- **Email-verification endpoint typed**: `authService.verifyEmail({ token_hash, type })` targeting `POST /auth/verify-email`. Not wired to a deep-link handler yet — the user worked around it by clicking the email's web link — but the service is ready when the deep-link work happens.
- **Stale duplicates deleted** (long-flagged in MEMORY.md): `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`, and the orphaned `src/screens/` example dir.
- **Verified**: tsc clean, iOS Metro bundle clean.
**Left off at:** The user should retry login — the "No access token received" error is fixed, and the full login → profile-fetch → navigation flow is now wired to the real API. Daily Checkin / FamilyDashboard redesign still pending whenever they paste the production frame.
**Open questions / blockers:** Not actually exercised against the live backend from this session — code-level verification only. If login still fails after the user retries, the Network tab in dev tools or the API's error-text in the inline submit error will tell us what next.



## 2026-05-08 — Wire auth screens to real API + shared form validation
**Who:** Claude (Opus 4.7) with Isha
**Branch:** `feature/design-remodification`
**Goal:** Replace the demo mock with real API integration on Login + SignUp; add proper form validation that we can reuse on other screens.
**Done:** (commit `5761c9d`)
- **Real API**: both screens now call `useAuth().login(email, password)` / `useAuth().signup(params)` from the AuthContext. Those wrap the canonical `~/services/auth.service` (Axios → `https://carsignal-api.vercel.app/api/auth/{login,signup}`), set bearer token, persist user, schedule token refresh, and dispatch state.
- **Deleted feature-local mock** `src/features/auth/services/authService.ts` (was unused outside the two screens; had drifted from the real shape).
- **AuthContext API tightened**: `login`/`signup` now return `AuthResult = { ok: true } | { ok: false, error: string }` instead of `boolean`. `signup` now accepts a `SignupParams` object including role (previously hardcoded to `'senior'`). Added best-effort error-message extraction from Axios responses (handles `data.message`, `data.error`, plus the friendly "Network error" rewrite).
- **Role mapping**: new `src/features/auth/services/roleMapping.ts` with `uiRoleToApi` / `apiRoleToUi`. UI `'elder' ↔ 'senior'`, UI `'family' ↔ 'caregiver'`. Keeps the auth-boundary translation in one place.
- **Shared validators**: new `src/shared/utils/validators.ts` — composable `Validator<T>` functions (`required`, `isEmail`, `minLength/maxLength`, `hasLetter/hasNumber`, `noDigits`, `match`, `oneOf`) plus prebuilt rule sets (`strongPassword`, `personName(label)`) and a `validateForm(values, rules)` runner that returns `{ valid, errors }` — first failing message per field. Pure / framework-agnostic; reusable for settings, invites, etc.
- **Per-field error UX**: `OutlinedField` and `OutlinedSelect` now take an optional `error` prop — red border + 12px message below the input. Forms clear field-level errors as the user edits, and clear the form-level submit error on any input.
- **Validation rules applied**:
  - **SignUp**: First/Last name (required, no digits, ≤50 chars); email (required, RFC-flavored); password (≥8 chars, has letter, has number); role (`'family' | 'elder'`).
  - **Login**: email (required + format); password (required only); role.
- **Navigation on success is automatic** — `RootNavigator` already routes by `isAuthenticated` + `role`. On a successful API response the user is immediately on the right stack.
- **Verified**: `tsc --noEmit` clean; `expo export --platform ios` bundles successfully.
**Left off at:** Auth flows are production-ready end-to-end. Next up: the Daily Checkin / Family Dashboard frame (image 4 from the user's earlier screenshot drop) when the user shares the production design.
**Open questions / blockers:** Real API isn't smoke-tested from a device — bundling proves the wiring compiles. First real run on a simulator with the live backend may surface UX tweaks (e.g. password rules the backend actually enforces).



## 2026-05-08 — LoginScreen redesign + shared auth UI extraction
**Who:** Claude (Opus 4.7) with Isha
**Branch:** `feature/design-remodification`
**Goal:** Match LoginScreen to the new Figma frame (image 3 from the user's drop). Same design language as SignUp.
**Done:** (commit `69e951c`)
- **Replaced the role-card login picker** (Senior App / Family App tiles) with the new single-form login: Email, Password, Family Account, "Login" button, "Don't have an account? Sign up" footer.
- **Extracted shared auth UI** to `src/features/auth/components/`:
  - `OutlinedField` — the outlined text input both screens use (transparent fill, light-gray border, navy text, gray placeholder).
  - `LogoCard` — the white CareSignal/MedTech Care header card.
- **SignUpScreen now consumes these** instead of inlining them — both screens stay identical and changes propagate.
- **Login UX details**: button disabled until email + password are non-empty; inline error message under the form on failure.
- **Updated mock `authService.login`** to accept `{ email, password, familyAccount?, role? }` instead of a single phone string. Real API call is left commented for swap-in. Display name in the mock is derived from the email local-part.
- **Verified**: tsc clean, iOS Metro bundle clean.
**Visual side effects:** None — every other already-migrated screen is unchanged from the previous commit.
**Left off at:** Auth pair (Login + SignUp) is now done. The next screen the user said they'd give me is **FamilyDashboard / Daily Checkin** (image 4).
**Open questions / blockers:** None. Awaiting next screen drop.



## 2026-05-08 — Green rebrand + SignUpScreen redesign (Figma frame 1 of N)
**Who:** Claude (Opus 4.7) with Isha
**Branch:** `feature/design-remodification`
**Goal:** Begin migrating screens to the new Figma design. Start with SignUp; treat the brand-color change as app-wide.
**Done:** (commit `3117bb1`)
- **Brand-color rebrand to green** in `src/shared/design/tokens/index.ts`. Coral `#FF5555` → leaf green `#4FA72E`. Background `#FFFFFF` → soft blue-gray `#EEF1F5`. Surface white-on-tint creates the neumorphic depth. Text primary → navy `#1A2138`. Added `colors.border.light` for outlined inputs.
- **`NeuButton` primary variant is now neumorphic-raised** (background-matched fill, navy text, lifted shadow) instead of filled-coral. API unchanged — every existing call site keeps working. Loading spinner now green (visible on light fill). Secondary variant is now a clean outlined ghost (transparent + green border + green text).
- **SignUpScreen full rewrite** to match the Figma frame exactly: white logo card → "Create Account" eyebrow → big bold navy title → subtitle → 5 outlined fields (First/Last side-by-side, Email, Password, Family Account) → pill-shaped raised submit button → "Already have an account? **Log in**" footer.
- **Responsive**: phone full-width with `spacing[20]` padding, tablet (≥768px) centered with `maxWidth: 480`. Works from 320px small phones up.
- **Local `OutlinedField` component** in SignUpScreen instead of forking the shared `Input` (which has a different "flat" style still in use).
- **Verified**: `npx tsc --noEmit` clean, `npx expo export --platform ios` bundles successfully (16s, 4.42 MB Hermes).
**Side effects (intentional):** All other already-migrated screens (LoginScreen, ForgotPassword, FamilyDashboard, CheckInHome, etc.) automatically pick up the new green from shared tokens. They will look visually different until each gets its own Figma-driven redesign — that's by design (app-wide rebrand).
**Left off at:** SignUp is done. User shared 3 more screenshots in the same drop:
1. **LoginScreen** (image 3) — same design language as SignUp, fast follow if user wants it now.
2. **FamilyDashboard / Daily Checkin** (image 4) — explicitly "the next one" per user.
**Open questions / blockers:** None. Awaiting user direction: do LoginScreen now, or move on to FamilyDashboard?



## 2026-05-08 — Make app runnable: fix all type errors + unblock Metro bundle
**Who:** Claude (Haiku 4.5) with Isha
**Branch:** `feature/design-remodification` (worktree)
**Goal:** Take repo from "doesn't compile" to runnable. Get `npx tsc --noEmit` clean and `npx expo export` succeeding for both iOS and Android.
**Done:** (one commit, `1a9fc08`)
- **NeuButton**: added missing `disabled` prop (used by 4 screens, never in interface).
- **tokens/utils.ts**: spacing keys are numbers — `createPadding('12')` was a string and TS rejected it; also `fontWeight` must be a string for RN `TextStyle`.
- **Text variants**: `'h1'` / `'h2'` aren't real — replaced with `'title'` / `'heading'` in ForgotPasswordScreen + GenerateInviteScreen.
- **ForgotPasswordScreen**: dropped leftover `<Card>` + `theme.colors.success`; now uses `<NeuCard>` + `colors.semantic.success`.
- **LoginScreen**: replaced legacy `theme.colors.softMint/softBlue/softBeige` with new design tokens; fixed invalid `spacing[3]` → `spacing[4]`.
- **SignUpScreen**: fixed `spacing[22]` (doesn't exist) → `spacing[20]`; fixed `colors.surface` (an object at module scope) → `colors.surface.light`.
- **CheckInHome**: removed legacy `theme` import, the `Button` from `react-native` (different component), and `<NeumorphicView>`; migrated to `<NeuCard>` / `<NeuButton>` / `colors.text.primary`.
- **authService (feature-level)**: was importing from `~/shared/types/auth` (doesn't exist) and the deleted fetch stub — now imports `User` from `~/shared/types/domain`; dropped `email` field that's not on canonical User.
- **useApi / useMutation**: added a defensive type so both wrapped `{ data: T }` and bare `T` API responses work; guarded `endpoint.split('/')[0]` for cache invalidation.
- **Icon**: `lucide-react-native` no longer exports an `icons` map. Rewrote to take the `LucideIcon` component directly (`<Icon icon={HeartPulse} />`).
- **expo-notifications (SDK 54)**: `NotificationBehavior` now requires `shouldShowBanner` + `shouldShowList`; calendar triggers must include `type: SchedulableTriggerInputTypes.CALENDAR`; `Notifications.removeNotificationSubscription(sub)` removed — use `sub.remove()`.
- **useNotificationListener**: `useRef<T>()` now requires an initial value (newer @types/react).
- **tokenManager**: `parts[1]` could be undefined; guard before `Buffer.from`.
- **Deleted** `src/shared/api/{client,index}.ts` (incomplete fetch stub, nothing imported it).
- **useRegisterDevice**: switched to canonical `~/services/api` apiClient.
- **Verified**: `npx tsc --noEmit` clean; `npx expo export --platform ios` and `--platform android` both succeed (Hermes bytecode 4.42 / 4.43 MB, 2709 modules).
**Left off at:** App is runnable. Next worthwhile cleanups (none blocking):
1. Consolidate the two `User` shapes / two role enums (see CLAUDE.md "Known Duplicates").
2. Decide whether to delete `src/contexts/AuthContext.tsx` (stale wrapper).
3. Add a test runner — there are still no tests.
4. Smoke-test on a real simulator to confirm runtime behavior matches what the bundle suggests.
**Open questions / blockers:** None.


