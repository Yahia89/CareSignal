# MEMORY.md

Durable project knowledge for shared work. **This is the handoff doc** — a fresh Claude session (or a new colleague) should be able to pick up work after reading this + [CLAUDE.md](CLAUDE.md) + [API.md](API.md) without re-discovering anything.

Append-mostly. Edit existing entries only when they're outright wrong. Date entries when adding decisions.

---

## Quick orientation

- **Repo**: React Native + Expo SDK 54 (RN 0.81.5, React 19.1, Hermes). Dev workflow uses `npx expo run:android` / `:ios` (NOT Expo Go — there's an `android/` folder).
- **Path alias**: `~/...` → `src/...` (configured in `tsconfig.json` + `babel.config.js`). Always use it.
- **Default branch for current work**: `feature/design-remodification` (worktree at repo root, not in `.claude/worktrees/...`).
- **API**: `https://carsignal-api.vercel.app/api`. Spec mirrored in [API.md](API.md). OpenAPI JSON at `/api/docs`.
- **Tooling**:
  - Figma: remote MCP at `https://mcp.figma.com/mcp` (see `.mcp.json`). OAuth on first connect.
  - No test runner. Don't claim tests pass without setting one up.
  - Type-check: `npx tsc --noEmit` (strict mode + `exactOptionalPropertyTypes`).
  - Bundle verification: `npx expo export --platform android --output-dir /tmp/x` then `rm -rf /tmp/x`.

---

## What's done vs pending (high-level)

**Done:**
- Build is runnable (was broken at session start with ~30 type errors).
- Auth screens (Login + SignUp) redesigned to Figma + wired to real API + full validation.
- `CheckInHome` (Daily Checkin) redesigned to Figma — header, greeting, voice row, status buttons, vital section.
- All screens use Inter font via `@expo-google-fonts/inter` (loaded in `App.tsx` with splash gate).
- Logo asset pipeline: PNG materialized to disk on first render → loaded via `file://` (bypasses asset registry / data-URI bugs).
- App icons + splash regenerated from logo (`assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`).
- API integration: auth (signup/login/logout/forgot/reset/refresh/verify-email), profile (GET + PATCH), all 4 links endpoints — service layer wired, see [API.md](API.md) status table.
- 401 → silent refresh + retry interceptor wired in `services/api.ts`.

**Pending UI work** (services exist, just need bindings):
- Profile edit screen (PATCH `/profiles/me`)
- Senior: generate-invite UI button-to-API wiring
- Family: accept-invite flow
- Family dashboard live data (GET `/senior/status`)
- Vital capture POST + history GET
- Check-in POST (the I'm OK / I Need Help / Urgent Help buttons currently only `speak()`)
- Alert settings get/put
- Alerts list + dismiss
- Email-verification deep link handler

**Pending design work:**
- ForgotPasswordScreen — old design, hasn't been redesigned to match the new auth aesthetic.
- FamilyDashboardScreen — old design from before this session's overhaul.
- SettingsScreen, GenerateInviteScreen, DashboardScreen — same.

---

## Architecture map

```
src/
├── app/Providers.tsx        ─ Theme, Auth, Household, Settings providers (this order)
├── navigation/
│   └── RootNavigator.tsx    ─ Auth | Elder | Family stacks; routes by isAuthenticated + role
├── services/
│   ├── api.ts               ─ Axios client, 401 interceptor, refresh callback registry
│   ├── auth.service.ts      ─ All /auth/*, /profiles/me; envelope unwrap helper
│   └── links.service.ts     ─ All /links/*; same unwrap helper
├── shared/
│   ├── contexts/AuthContext.tsx   ─ THE auth context (login, signup, logout, finalizeAuth)
│   ├── design/                    ─ Tokens, hooks, NeuButton/NeuCard, ThemeContext
│   ├── components/                ─ Legacy components (Screen, Text, Spacer, Input — still used)
│   ├── utils/validators.ts        ─ Composable form validators + validateForm()
│   └── notifications/             ─ Push registration + scheduled check-in reminders
├── features/
│   ├── auth/
│   │   ├── components/            ─ LogoCard, OutlinedField, OutlinedSelect (cross-feature reusable)
│   │   ├── screens/               ─ LoginScreen, SignUpScreen, ForgotPasswordScreen
│   │   └── services/roleMapping.ts ─ UI 'elder/family' ↔ API 'senior/family'
│   ├── checkIn/screens/CheckInHome.tsx  ─ The redesigned daily-checkin screen
│   ├── dashboard/                       ─ Family + senior dashboards (pre-redesign)
│   ├── invites/                         ─ Generate invite (pre-redesign)
│   └── settings/                        ─ Settings (pre-redesign)
├── utils/
│   ├── storage.ts            ─ SecureStore for tokens, AsyncStorage for user
│   └── tokenManager.ts       ─ JWT decode, proactive refresh timer, registers refresh cb with api
└── types.ts                  ─ ApiEnvelope<T>, Session, Profile, Link, payloads, etc.
```

---

## API integration — patterns and contract

### Envelope (every endpoint)
```ts
{ data: <payload> | null, error: <string> | null }
```
Both auth and links services have an `unwrap<T>(envelope)` helper. **Never read `response.data.X` directly** — go through `unwrap()`.

For paginated lists, the response also has `meta: Pagination`.

### `Session` from login/signup/refresh/verify-email
```ts
{ access_token, refresh_token, expires_in, user: { id, email } }
```
**`Session.user` only carries `id` + `email`.** Name and role come from a separate `GET /profiles/me`. `AuthContext.finalizeAuth` orchestrates: setAuthToken → getProfile → buildUser → storage.setUser → setupRefreshTimer → dispatch LOGIN. **Reuse it, don't reinvent.**

### Token strategy
- Tokens (access + refresh) → SecureStore (encrypted), keys `caresignal_auth_token` / `caresignal_refresh_token`.
- User profile → AsyncStorage (key `@caresignal_user`).
- Access token TTL: 1 hour (JWT `exp`).
- **Two refresh paths**:
  1. **Proactive timer** (`tokenManager.setupTokenRefreshTimer`) — fires 5min before exp.
  2. **Reactive 401-retry-with-refresh** (axios response interceptor in `services/api.ts`) — kicks in when the proactive path missed (e.g. app was killed). Calls the refresh callback registered by `tokenManager`, retries the original request once with the new bearer.
- Supabase **rotates** the refresh_token on every refresh — always store the new one (already handled).

### How `services/api.ts` knows about refresh / logout (without circular imports)
- `api.ts` exposes `setRefreshCallback(fn)` and `setLogoutCallback(fn)`.
- `tokenManager.ts` calls `setRefreshCallback(refreshAccessToken)` at module load (side effect).
- `AuthContext.tsx` calls `setLogoutCallback(...)` in `useEffect` after `initAuth()`.
- The 401 interceptor uses these — never imports tokenManager directly. **Don't change this without understanding the cycle**: `api → tokenManager → authService → api`.

### Error extraction
The 401 interceptor propagates the original axios error untouched. To extract the API's `error` string in screens / hooks:
```ts
const data = err?.response?.data;
if (typeof data === 'string') return data;
if (data?.error && typeof data.error === 'string') return data.error;
if (data?.message) return data.message;
if (err?.message === 'Network Error') return 'Network error — check your connection.';
return err?.message || fallback;
```
There's a copy of this in `useForgotPassword` and `AuthContext.extractErrorMessage`. Eventually consolidate into `~/shared/utils/extractApiError.ts` — for now, copy is fine.

### Role mapping
Always use `~/features/auth/services/roleMapping`:
- `uiRoleToApi('elder')` → `'senior'`
- `uiRoleToApi('family')` → `'family'`
- `apiRoleToUi('senior')` → `'elder'`, anything else → `'family'`

UI uses `'family' | 'elder'` (matches navigation stacks). API uses `'senior' | 'family'` (per OpenAPI spec). **Never inline the mapping in screens.**

### `AuthContext.login` / `signup` return shape
```ts
type AuthResult = { ok: true } | { ok: false; error: string }
```
Check `result.ok`; render `result.error` locally with `useState`. **Don't** subscribe to `state.error` from a screen — that creates stale-error glitches when navigating away and back.

---

## Design system

### Authoritative Figma values (Med-Tech-Care file, 2026-05-08)

**Colors** (tokens in `src/shared/design/tokens/index.ts`):
| Role | Hex | Token |
|---|---|---|
| Brand green | `#4FA72E` | `colors.accent.primary` |
| Title / body navy | `#36597D` | `colors.text.primary` |
| Eyebrow / subtitle text | `#333333` | inline (not a token) |
| Placeholder gray | `#A6B1C3` | `colors.text.placeholder` |
| Input border | `#8D98A7` | `colors.border.light` |
| Input fill | `#F1F5F9` | `colors.inputFill.light` |
| Page background | `#EEF1F5` | `colors.background.light` |
| Surface / white card | `#FFFFFF` | `colors.surface.light` |
| Soft drop-shadow | `#C9D9E8` | (used in `LogoCard` shadow strips) |
| Filled-button navy | `#36597D` | hardcoded `FILLED_BG` in `NeuButton` |
| Success (OK pill) | `#27AE60` | `colors.semantic.success` |

**Typography:**
- Font family: **Inter** (loaded via `@expo-google-fonts/inter` in `App.tsx`). Originally Figma used Segoe UI — Inter is a free open substitute, ~95% visual match.
- Use `interFamilyForWeight(weight: number)` from `~/shared/design/tokens/utils` to get the right family name. **RN does not synthesize bold for custom fonts** — `fontFamily: 'Inter_400Regular' + fontWeight: '700'` would render as Regular. Always set `fontFamily` explicitly.
- Common weights wired: 400, 500, 600, 700, 800, 900.
- Title (Sign up / Login / Daily Checkin): 23/700/#36597D, lh ~26.
- Greeting (Good Morning, X): 30/800/#36597D, lh 34, letter-spacing -0.2.
- Eyebrow ("Create Account") + subtitle ("Family-Side access..."): **14/400/#333333, lh 16.6**.
- Field placeholder + value: 15/400, placeholder #A6B1C3, value #36597D.

**Layout:**
- Phone screen padding: 24px left/right.
- Tablet (`width >= 768`): everything caps at `FORM_MAX_WIDTH = 480px`, centered.
- Heading-block gap (eyebrow → title → subtitle): 8px (`Spacer y="sm"`, NOT `xs` which is 4px).
- Spacing keys: `0, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64`. **Not continuous** — TS rejects e.g. `spacing[3]`.

**Inputs (`OutlinedField` / `OutlinedSelect`):**
- Height **41px**.
- Border radius **8** (`borderRadius.sm`).
- 1px border `#8D98A7`, fill `#F1F5F9`, padding 16 horizontal.
- Both have an `error?: string | undefined` prop for red-border + 12px message below.

**Buttons (`NeuButton` variants):**
- `primary` (default): light raised pill, navy text — most CTAs.
- `secondary`: outlined ghost (transparent + green border + green text).
- `filled`: solid navy `#36597D` + white text — active toggle states (used for "Voice ON" in CheckInHome).
- New: `icon?: LucideIcon` prop — renders the icon component before the title with 8px gap.

**LogoCard** (used at top of auth screens + CheckInHome header):
- Renders the CareSignal PNG (1467×403) at display size 167×46.
- The PNG is materialized to disk on first render (see "Logo pipeline" below).
- Has a soft bottom-fade separator (4 stacked thin Views in `#C9D9E8` at decreasing opacity) — `showSeparator?: boolean` prop, default true. Pass `false` when nesting in a container that already provides its own boundary.

---

## Logo pipeline (the long story)

The CareSignal logo PNG lives at `assets/caresignal-logo.png` (1467×403 RGBA, 41KB). The base64 of it is also inlined as a string in `src/features/auth/components/logoData.ts`.

**Why the inline data URI**: `require('../assets/...')` failed on the user's existing dev APK because the native asset registry was compiled before the file existed. Clearing Metro cache didn't help (registry is in the native build, not JS).

**Why we don't `<Image source={{ uri: dataUri }}>` directly**: failed silently in core RN `<Image>`; failed loudly in `expo-image` with `"Cannot load SVG from stream"` (its cache decoder misclassifies long base64 PNG as SVG).

**Current solution** (in `LogoCard.useLogoFileUri`):
1. On mount: decode the base64 → write to `Paths.cache/caresignal-logo-${SESSION_ID}.png` via legacy `expo-file-system/legacy.writeAsStringAsync(path, b64, { encoding: 'base64' })`.
2. Use the resulting `file://` URI as `<Image source={{ uri }}>`.
3. The session ID in the filename is unique per app launch — bypasses Glide's bitmap-pool poisoning (see "Glide gotcha" below).
4. Old `caresignal-logo-*.png` files in cache get cleaned up on each launch (best-effort).

**To regenerate the inline base64 after updating the PNG:**
```bash
python3 -c 'import base64; print(base64.b64encode(open("assets/caresignal-logo.png","rb").read()).decode())'
```
Paste the result into `logoData.ts`'s `CARESIGNAL_LOGO_DATA_URI` value.

**App-icon variants** (`icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`) were generated with a one-off Pillow script that crops the heart-glyph portion (left 403×403), trims transparent space, pads ~16% for Android adaptive-icon safe zone, then resizes. Re-run by adapting that script if the source logo changes.

---

## Gotchas (every one of these cost real time)

### General

**`spacing[3]` etc don't exist.** Keys are sparse. See the design-system layout section for the full list.

**`borderRadius['2xl']` not `borderRadius.2xl`.** JS doesn't allow numeric-leading identifiers without bracket notation. Same for `'3xl'`.

**`useColors().background` is a string, not an object.** The hook spreads tokens then **overwrites** `background` and `surface` with the mode-resolved string. So inside a component `colors.background` is `'#EEF1F5'`, but at module scope (StyleSheet) the imported `colors.background` is `{ light, dark }`. To get both light and dark literals, go through `useTokens().colors.background.{light,dark}`.

**`useRef<T>()` (no arg) doesn't compile.** Newer `@types/react` requires an initial value. `useRef<T | null>(null)`.

**Module-scope StyleSheet sees the static `colors` object, not the hook's resolved string.** When in a component body, prefer `useColors()`. When in `StyleSheet.create({...})`, use `staticColors.background.light` (named import alias) to be explicit. SignUpScreen does this on purpose — the dual import is intentional.

**Inline JSX comments leak whitespace as text children.** This pattern caused a runtime crash:
```jsx
<View>...</View> {/* comment */}
<Spacer /> {/* gap */}
```
The whitespace+comment between two elements gets parsed as a literal text-string child of the parent, and RN throws `Text strings must be rendered within a <Text> component`. Babel's error frame points at the wrong file (the parent that received bad children). **Move comments to their own line or above the element**, never trailing.

**`exactOptionalPropertyTypes: true` rejects `undefined` for optional props.** Pattern that fails: `<Field error={errors.email}>` where `errors.email` could be `string | undefined` and `error?: string`. Two fixes:
- Declare `error?: string | undefined` in the prop type (allows undefined assignment).
- Or conditionally spread: `{...(errors.email ? { error: errors.email } : {})}`.

### React Native + Hermes + SDK 54 specifics

**`expo-notifications` SDK 54 broke**:
- `NotificationBehavior` now requires `shouldShowBanner` and `shouldShowList`.
- Calendar triggers must include `type: Notifications.SchedulableTriggerInputTypes.CALENDAR`.
- `Notifications.removeNotificationSubscription(sub)` is gone — call `sub.remove()`.

**Image assets and bundle gotchas (recap)**:
- `require('../assets/...png')` won't see files added after the dev APK was built. Either rebuild (`expo run:android`) or use the materialize-to-disk pattern.
- `<Image source={{ uri: 'data:image/png;base64,...' }}>` silently fails on Android in some configs.
- `expo-image` with the same data URI throws `Cannot load SVG from stream` (its cache decoder misclassifies).
- `boxShadow` on Android works in some configs and not others — depends on parent ScrollView clipping and bg opacity. Don't rely on it for critical styling.

**Glide bitmap-pool poisoning** (Android Image error: `"Problem decoding into existing bitmap"`): Glide caches decoded bitmaps keyed by URI. If a previous load failed (e.g. you wrote bad bytes once), the pool entry is corrupt and subsequent loads of the *same URI* keep failing even after the file is fixed. Workaround: use a unique filename per session so Glide can never reuse a stale entry.

**`expo-file-system` SDK 54 `File.write(string, { encoding: 'base64' })` writes the base64 *text* to disk, not the decoded bytes.** Use the legacy API (`expo-file-system/legacy.writeAsStringAsync`) for base64 file writes, or decode to `Uint8Array` in JS first via `atob`.

### Forms / validation

Use `~/shared/utils/validators` — see the section below. Field-level errors clear on edit; submit errors clear on any input change.

```ts
const { valid, errors } = validateForm(values, {
  email: [required(), isEmail()],
  password: strongPassword,           // prebuilt: ≥8, letter, digit
  firstName: personName('First name'), // prebuilt: required, no digits, ≤50
  role: oneOf(['family', 'elder']),
});
if (!valid) return setErrors(errors);
```

### Lucide icons

`lucide-react-native` no longer exports an `icons` map. Pass icon components directly: `import { HeartPulse } from 'lucide-react-native'; <HeartPulse size={24} />` or use our `<Icon icon={HeartPulse} />` wrapper.

### Other

**`useAuth` exists in two places.** Always import from `~/shared/contexts/AuthContext` (canonical). The `~/hooks/useAuth.ts` file was deleted, but if it ever comes back, don't use it.

**`useOnlineStatus()` is a stub** — always returns `true`. Don't rely on it.

**`~/shared/notifications/hooks/index.ts` is empty.** Import notification hooks by full path (`~/shared/notifications/hooks/useRegisterDevice`).

---

## Conventions

**Path imports**: always `~/...`. Avoid `../../../` once you cross a feature boundary.

**Service file naming**: `auth.service.ts` (canonical, `src/services/`). The feature-local `authService.ts` was deleted. Match canonical pattern for new domain services (`vitals.service.ts`, `checkins.service.ts`, etc.).

**Comments**: default to none. Only when *why* is non-obvious (workaround, constraint, subtle invariant). Identifier names carry the *what*.

**Token storage**:
- Tokens (auth, refresh) → SecureStore via `~/utils/storage`.
- User profile → AsyncStorage via `~/utils/storage`.
- Don't add a parallel storage key.

**No third anything**: the codebase has had recurring duplicates (two AuthContexts, two API clients, two User types). All deleted. **Don't introduce a third.** Extend the canonical version.

**Cross-feature imports**: tolerated. `CheckInHome` imports `OutlinedField` / `OutlinedSelect` / `LogoCard` from `~/features/auth/components`. Promote to `~/shared/components` when a third feature needs them — for now, the auth feature owns them.

---

## Working agreements with Claude

- Free to: edit, type-check, bundle-test, run lint, commit (when explicitly asked).
- Ask first: pushing, opening PRs, irreversible operations.
- Don't commit unless the user says "commit" or similar — they've explicitly asked for batched commits.
- When finishing a meaningful chunk: append a SESSION.md entry.
- When discovering a non-obvious gotcha: add to MEMORY.md.
- When a fix reveals a deeper architectural issue: flag in MEMORY.md, don't silently widen the change.
- Cannot: save user-pasted images. The Claude Code app shows pasted images visually but doesn't expose them as files. The user has to save manually to `assets/` — this is a real limitation, document and work around it.

---

## Active tech debt

- **`SignUpScreen.tsx`**: dual `colors` import (static + hook). Intentional — module-scope StyleSheet uses static, component body uses hook. Document or split into `staticColors` alias if confusing.
- **`useOnlineStatus()`**: hardcoded `true`. Wire `@react-native-community/netinfo` if offline UX matters.
- **No tests**. Pick Jest before the codebase grows further.
- **`extractApiError`**: copy lives in `useForgotPassword` and `AuthContext.extractErrorMessage`. Consolidate into `~/shared/utils/extractApiError.ts` next time we touch error handling.
- **`ForgotPasswordScreen` design**: still old-style, hasn't been redesigned to match the new auth aesthetic.
- **Email verification deep link**: `authService.verifyEmail()` exists; deep-link handler not wired. Path: `caresignal://auth/confirm?token_hash=xxx&type=signup` → call `verifyEmail({ token_hash, type })` → `finalizeAuth(session)`.
- **Two role enums**: long-term, pick one. Short-term, the mapping in `roleMapping` is the contract.
- **CheckInHome buttons don't POST yet**: the I'm OK / I Need Help / Urgent Help buttons currently only `speak()` — wire to `POST /check-ins` next.
- **Vital save doesn't POST**: same — wire to `POST /vitals`.
- **Family dashboard is mock data**: wire to `GET /senior/status`.
- **No alert settings UI**: wire to `GET/PUT /alert-settings`.
- **No alerts list UI**: wire to `GET/PATCH /alerts` (Plus plan gated).

For the API integration order, see the suggested sequence at the bottom of [API.md](API.md).

---

## Contacts / external

- API base: `https://carsignal-api.vercel.app/api` (docs at `/docs`, OpenAPI JSON at `/api/docs`)
- Figma file: [Med-Tech-Care](https://www.figma.com/design/Mwpl0ZrMdAts95EaHmzrjh/Med-Tech-Care)
- User's Figma seat: View only on a Starter team that doesn't own this file → Figma MCP `get_design_context` returns "could not be accessed". Workflow has been: user pastes Figma element values + screenshots; I apply.
- Linear / Jira / Slack: not configured.

---

## Tooling: Figma Remote MCP

Repo is configured to use Figma's **remote** MCP at `https://mcp.figma.com/mcp` (see `.mcp.json`). Free, no Dev/Full seat required.

Setup on a new machine:
1. Restart Claude Code in this repo. On first connect, Claude Code prompts OAuth — sign in to Figma, approve.
2. In Figma, open the file and select the frame to query. MCP works on the currently-selected frame.
3. `mcp__figma__*` tools become available.

Known limitation: **the `Mwpl0ZrMdAts95EaHmzrjh` (Med-Tech-Care) file isn't accessible via MCP because the user's account isn't on the team that owns the file.** Workflow that's actually proven to work: user opens the Figma frame, uses the Properties panel to copy exact values (font, weight, size, lh, letter-spacing, color), and pastes them in chat. I apply.

---

## Recent session log highlights (newest first)

For full session history see [SESSION.md](SESSION.md). Quick recap of major milestones:

- **2026-05-08** — Profile (PATCH) + Links service + 401-retry-with-refresh interceptor wired. Forgot/reset password fixed to spec shape.
- **2026-05-08** — Inter font wired via `@expo-google-fonts/inter` + `interFamilyForWeight()` helper.
- **2026-05-08** — CheckInHome redesigned to Figma. NeuButton extended with `icon` + `filled` variant.
- **2026-05-08** — Logo pipeline: PNG materialized to disk, file:// URI loaded by Glide. Got past Glide's bitmap-pool poisoning by using unique filename per launch.
- **2026-05-08** — App icons + splash regenerated from logo.
- **2026-05-08** — Auth screens (Login + SignUp) redesigned to Figma; `OutlinedField`/`OutlinedSelect`/`LogoCard` extracted; full validation via `validateForm`.
- **2026-05-08** — API envelope unwrap pattern; `Session.user` doesn't carry name/role (use `getProfile()`); roles fixed to `'senior' | 'family'` (was incorrectly `'caregiver'`).
- **2026-05-08** — Build was broken at session start; fixed all type errors + Metro bundle.
