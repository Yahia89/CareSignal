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


