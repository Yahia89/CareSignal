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


