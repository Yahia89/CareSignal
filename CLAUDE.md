# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CareSignal** — Expo / React Native (RN 0.81, Expo 54, React 19) app for senior daily check-ins with family alert routing. Two role-based UIs share one codebase: **elder** (check-in flow) and **family** (dashboard). Backend at `https://carsignal-api.vercel.app/api`.

Path alias: `~/*` → `src/*` (configured in both [tsconfig.json](tsconfig.json) and [babel.config.js](babel.config.js) via `babel-plugin-module-resolver`). Use `~/shared/...`, not relative `../../../`.

## Commands

```bash
npm start              # Expo dev server (interactive)
npm run ios            # iOS simulator (expo run:ios — native build, not Expo Go)
npm run android        # Android emulator
npm run web            # Web (some native APIs unavailable)
npx tsc --noEmit       # Type-check
npx eslint src         # Lint (CI-strict — see below)
npx prettier --write src
```

**No test runner is configured.** Don't claim tests pass without setting one up.

**ESLint is strict** ([.eslintrc.js](.eslintrc.js)): `react-hooks/exhaustive-deps: error` and `@typescript-eslint/no-explicit-any: error` will fail the build. Don't reach for `any` to silence type errors — fix the type or use `unknown`.

## Bootstrap & Provider Order

[App.tsx](App.tsx) wraps everything in this order (outer → inner):

```
ErrorBoundary → ThemeProvider → AuthProvider → HouseholdProvider → SettingsProvider → RootNavigator
```

Defined in [src/app/Providers.tsx](src/app/Providers.tsx). When adding global state, decide carefully which layer owns it — Auth must wrap anything that reads the user.

`registerRootComponent(App)` is called in [index.ts](index.ts) (not src/index.ts).

## Navigation (role-based)

[src/navigation/RootNavigator.tsx](src/navigation/RootNavigator.tsx) picks one of three stacks at runtime:

- **Auth** (unauthenticated): `Login`, `SignUp`, `OTP({ phoneNumber })`
- **Elder** (`user.role === 'elder'`): `CheckInHome({ slot? })`, `CheckInSuccess`
- **Family** (other): `FamilyDashboard`, `FamilySettings`

Param types in [src/navigation/types.ts](src/navigation/types.ts). Deep links in [src/navigation/linking.ts](src/navigation/linking.ts): `/checkin/:slot`, `/dashboard`, `/login`. Push notification taps route into `Elder.CheckInHome` with `slot` ([useNotificationListener](src/shared/notifications/hooks/useNotificationListener.ts)).

## ⚠️ Known Duplicates / Pitfalls

This codebase has **multiple competing implementations** from prior iterations. Before adding code, confirm you're using the canonical version:

### 1. Two AuthContexts
- ✅ **Canonical**: [src/shared/contexts/AuthContext.tsx](src/shared/contexts/AuthContext.tsx) — reducer-based, used by `Providers.tsx`, integrates `tokenManager`. Action types: `LOGIN`, `LOGOUT`, `SET_LOADING`, `SET_ERROR`, `INIT`.
- ❌ **Stale**: [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) — thin wrapper around the standalone hook. Don't import from here.

### 2. Two API clients
- ✅ **Canonical**: [src/services/api.ts](src/services/api.ts) — Axios, base URL `https://carsignal-api.vercel.app/api`, 10s timeout, auto Bearer token, 401 → `storage.clear()`. All real services use this.
- ❌ **Stale stub**: [src/shared/api/client.ts](src/shared/api/client.ts) — fetch-based, no auth injection, incomplete.

### 3. Two design / component systems (active migration)
Both work side-by-side. Most screens *mix* them.

| Concern | Old (legacy) | New (neumorphic) |
|---|---|---|
| Tokens | [src/shared/theme/index.ts](src/shared/theme/index.ts) | [src/shared/design/tokens/](src/shared/design/tokens/) |
| Theme ctx | [src/shared/contexts/ThemeContext.tsx](src/shared/contexts/ThemeContext.tsx) | [src/shared/design/theme/ThemeContext.tsx](src/shared/design/theme/ThemeContext.tsx) |
| Hook | `useTheme()` → `theme.colors.X` | `useColors()`, `useTokens()`, `useShadows()` |
| Components | `Button`, `Card`, `NeumorphicView`, `Text`, `Screen`, `Input`, `Select`, `Spacer`, `Icon`, `StatusBadge` (in [src/shared/components/](src/shared/components/)) | `NeuButton`, `NeuCard` (in [src/shared/design/components/](src/shared/design/components/)) |

For new screens use the new system (`NeuButton` / `NeuCard` + `useColors()`) but pull `Screen`, `Text`, `Spacer`, `Input`, `Select` from `~/shared/components` — they haven't been ported yet.

[src/features/checkIn/screens/CheckInHome.tsx](src/features/checkIn/screens/CheckInHome.tsx) still imports the legacy `theme` object directly (`import { theme } from '~/shared/theme'`) and renders `<NeumorphicView>` — this works but won't react to theme switching.

### 4. Two `User` shapes / two role enums
- [src/types.ts](src/types.ts): `UserRole = 'senior' | 'caregiver' | 'admin'`, fields `first_name`, `last_name`, `email` (matches API).
- [src/shared/types/domain.ts](src/shared/types/domain.ts): `Role = 'elder' | 'family'`, fields `name`, `phoneNumber` (used by navigation/UI).

`AuthContext` maps `'senior' → 'elder'` when storing the user. Navigation routes on `'elder' | 'family'`. Be deliberate about which type you import.

### 5. `useColors()` shadowing gotcha
[src/shared/design/tokens/useTokens.ts:35-44](src/shared/design/tokens/useTokens.ts) spreads `tokens.colors` then **overrides** `background` and `surface` with resolved strings:

```typescript
// Returns:
{
  accent: { primary, light, dark, lighter },
  neutral: { 50..900 },
  semantic: { success, warning, error, info },
  text: { primary, secondary, disabled, inverse },
  background: string,   // ← resolved string, NOT { light, dark }
  surface: string,      // ← resolved string
}
```

Use `colors.background` (not `colors.background.light`). If you need the raw nested values, use `useTokens().colors.background.light`.

### 6. Two hook directories
- [src/hooks/](src/hooks/) — business hooks: `useAuth`, `useApi`, `useMutation`, `useForgotPassword`, `useGenerateInvite`. Note: `useAuth` here is a *standalone* hook that calls services directly; the **context-based** `useAuth` from `~/shared/contexts/AuthContext` is what most screens use. Don't conflate them.
- [src/shared/hooks/](src/shared/hooks/) — primitives: `useAsyncState`, `useDebouncedValue`, `useInterval`, `useStableCallback`, `useVoiceAssistant`, `useOnlineStatus` (currently hardcoded `true` — not real connectivity).

## Storage strategy

[src/utils/storage.ts](src/utils/storage.ts):
- **SecureStore (encrypted)**: `caresignal_auth_token`, `caresignal_refresh_token`
- **AsyncStorage (plain)**: `@caresignal_user`

Token refresh ([src/utils/tokenManager.ts](src/utils/tokenManager.ts)) decodes the JWT client-side, schedules a refresh **5 minutes before `exp`** via `setTimeout`, and updates SecureStore. Don't store tokens in AsyncStorage and don't add a second source of truth.

There's a separate, lighter wrapper at [src/shared/storage/](src/shared/storage/) (`cache.ts` / `secureStorage.ts`) that's not currently wired into auth — prefer `~/utils/storage` for token/user, `~/shared/storage` only for unrelated cached data.

## API patterns

Service files (one per domain) call `apiClient` directly:

```typescript
// src/services/auth.service.ts
import { apiClient } from './api';
export const authService = {
  signup, login, logout, getCurrentUser,
  forgotPassword, resetPassword, refreshToken,
};
```

Screens consume services either via:
- **Context** for auth (`useAuth().login(...)` from `~/shared/contexts/AuthContext`)
- **Feature hooks** for one-shot flows ([useForgotPassword](src/hooks/useForgotPassword.ts), [useGenerateInvite](src/hooks/useGenerateInvite.ts))
- **Generic [useApi](src/hooks/useApi.ts) / useMutation** for CRUD with caching + auto-invalidation

[src/services/template.service.ts](src/services/template.service.ts) is a comment-only reference file, not a real service.

## Notifications

[src/shared/notifications/services/pushService.ts](src/shared/notifications/services/pushService.ts) handles permission + Expo push token. Android channel is created with `MAX` importance. [scheduleService.ts](src/shared/notifications/services/scheduleService.ts) schedules daily check-in reminders carrying `{ slot }` in `data`. The hooks index at [src/shared/notifications/hooks/index.ts](src/shared/notifications/hooks/index.ts) is **empty** — import the hooks by full path.

## Domain types ([src/shared/types/domain.ts](src/shared/types/domain.ts))

```typescript
Role = 'elder' | 'family'
Slot = 'morning' | 'afternoon' | 'evening'
CheckInStatus = 'ok' | 'help' | 'urgent' | 'late' | 'missed'
Alert.type = 'missed_checkin' | 'help_requested' | 'urgent_help'
```

`Schedule.slots: Slot[]` drives notification scheduling. `CheckIn.timestamp` is ISO 8601.

## Build / app config

- Bundle id: `com.anonymous.CareSignal` ([app.json](app.json))
- Plugins: `expo-secure-store`, `@sentry/react-native` (Sentry wired but no DSN/init verified)
- `newArchEnabled: false` — don't enable casually; some libs may not be ready
- iOS portrait-only, Android edge-to-edge enabled
- EAS profiles ([eas.json](eas.json)): `development` (dev client + internal), `preview` (internal), `production`

## Conventions

- Feature module shape: `src/features/<name>/{screens, services, hooks, components, api, index.ts}` — most submodules are placeholder `index.ts` files; only fill them when you have real code.
- Screens are PascalCase (`LoginScreen.tsx`); services are `<domain>.service.ts` or `<domain>Service.ts` (both exist — match the directory).
- Prettier: 100 col, single quotes, semis, ES5 trailing commas, parens always around arrow params.
- Don't introduce a third design system, third API client, or third User type. Migrate within the existing two when you can.

## Working notes

- [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) (root) is an older standalone reference — its directory structure section is stale (predates the `features/` reorg). Trust this CLAUDE.md over it.
- The previous CLAUDE.md described the project as "API foundation, screens pending" — that's outdated; screens exist and the design-system migration is the current active work.
