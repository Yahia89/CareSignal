# MEMORY.md

Durable project knowledge that doesn't belong in code or CLAUDE.md: decisions made, why-we-did-X, gotchas the team has hit, conventions agreed in conversation. **Append-mostly** — only edit existing entries when they're outright wrong.

Keep entries short and dated. If something becomes a permanent codebase rule, also reflect it in [CLAUDE.md](CLAUDE.md).

---

## Decisions

### 2026-05-07 — Neumorphic design system is the target style
- All new screens must use `~/shared/design` (`NeuButton`, `NeuCard`, `useColors()`, `spacing`, `borderRadius`).
- The legacy `~/shared/components/{Button,Card,NeumorphicView}` and `~/shared/theme` are deprecated but not removed — they back-stop screens we haven't migrated.
- `Screen`, `Text`, `Spacer`, `Input`, `Select` from `~/shared/components` are still canonical (no neumorphic equivalents yet). Don't try to "modernize" these without a replacement.

### 2026-05-07 — Don't introduce a third anything
We already have two AuthContexts, two API clients, two User types, two hook directories. When you find a problem, fix it in the canonical version (see CLAUDE.md "Known Duplicates"). No third copy.

---

## Gotchas (things that cost us time)

### `spacing` keys are NOT a continuous range
`spacing` only includes: `0, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64`. There's no `spacing[3]`, `spacing[10]`, `spacing[14]`, `spacing[22]`, etc. TypeScript will reject these at compile time. Pick an adjacent value.

### `Text` doesn't have `h1`/`h2` variants
The variant union is `'display' | 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'small'`. If you're porting HTML-style code, map `h1 → title`, `h2 → heading`.

### Module-scope `StyleSheet` sees the *static* `colors`, not the hook's
At module scope, `colors` is the imported tokens object: `colors.background = { light, dark }` and `colors.surface = { light, dark }`. Inside a component, `useColors()` shadows it and returns resolved strings. So:
- In a component body: `colors.background` ✅ (string)
- In a `StyleSheet.create({...})` block at module scope: `colors.background.light` ✅ (string), `colors.background` ❌ (object — RN's `backgroundColor` will reject it)

### `lucide-react-native` no longer exports `icons`
Old code did `import { icons } from 'lucide-react-native'; icons[name]`. The map is gone. Pass icon components directly: `import { HeartPulse } from 'lucide-react-native'; <HeartPulse size={24} />` or use our `<Icon icon={HeartPulse} />` wrapper.

### `expo-notifications` SDK 54 breakages
- `NotificationBehavior` now requires `shouldShowBanner` and `shouldShowList` in addition to `shouldShowAlert`.
- Calendar triggers must include `type: Notifications.SchedulableTriggerInputTypes.CALENDAR`.
- `Notifications.removeNotificationSubscription(sub)` is gone — call `sub.remove()`.

### `useRef<T>()` (no arg) won't compile under newer `@types/react`
You'll get "Expected 1 arguments, but got 0". Pass an initial value (typically `null`) and widen the type: `useRef<T | null>(null)`.

### `CheckInHome.tsx` had a `Button` from react-native
There's a `Button` primitive in `react-native` that's nothing like our `NeuButton`. If you see `<Button title=... />` and the import is from `'react-native'`, that's the primitive. Replace with `NeuButton` from `~/shared/design`.



### `useColors().background` is a string, not an object
The hook spreads `tokens.colors` then overwrites `background` and `surface` with the mode-resolved string. So:
- `colors.background` → `'#FFFFFF'` ✅ (use this)
- `colors.background.light` → `undefined` 💥 (was a real bug on 2026-05-07)

If you need both light and dark literals, go through `useTokens().colors.background.{light,dark}`.

### `borderRadius.2xl` is a syntax error
JS property access doesn't allow numeric-leading identifiers. Use bracket notation: `borderRadius['2xl']`. Same for `['3xl']`.

### `useAuth` exists in TWO places and they're different
- `~/shared/contexts/AuthContext` — context-based, returns `{ state, dispatch, login, signup, logout }`. **Most screens use this.**
- `~/hooks/useAuth` — standalone hook calling services directly, doesn't share state with the context. Don't import this in screens unless you specifically know why.

### Legacy `theme` object vs `useColors()`
`import { theme } from '~/shared/theme'` returns a static object — it ignores theme mode. If a screen pulls colors from `theme.colors.X`, it won't react when dark mode lands. CheckInHome currently has this problem.

### Role enum mismatch at the auth boundary
API returns `'senior' | 'caregiver' | 'admin'`. UI/navigation uses `'elder' | 'family'`. `AuthContext` does the mapping (`senior → elder`) when storing the user. If you add a new role, update both ends.

### `useOnlineStatus()` is a stub
It always returns `true`. Don't rely on it for offline UX. If you need real connectivity, wire up `@react-native-community/netinfo`.

### `~/shared/notifications/hooks/index.ts` is empty
Import the notification hooks by full path (`~/shared/notifications/hooks/useRegisterDevice`), not from the index.

---

## Conventions

### Path imports
Always use `~/...` (configured in tsconfig + babel). Avoid `../../../` once you cross a feature boundary.

### Service file naming
Mixed in the repo: `auth.service.ts` (in `src/services/`) and `authService.ts` (in `src/features/auth/services/`). **Match the directory's existing convention** — don't unify yet.

### Token storage
- Tokens (auth, refresh) → SecureStore via `~/utils/storage`.
- User profile → AsyncStorage via `~/utils/storage`.
- Don't add a parallel storage key for either.

### Comments
Default to none. Only write a comment when *why* is non-obvious (a workaround, a constraint, a subtle invariant). Identifier names should carry the *what*.

---

## Active migrations / tech debt

- [x] ~~CheckInHome.tsx legacy imports~~ — fixed 2026-05-08 (commit `1a9fc08`)
- [x] ~~Two API clients~~ — deleted `src/shared/api/` 2026-05-08 (was an unused fetch stub)
- [ ] **SignUpScreen.tsx line 20**: still imports `colors` from `~/shared/design` and shadows it with `useColors()` on line 26. The static `colors` *is* used by the module-scope StyleSheet, so this is intentional now — but the dual usage is fragile. Consider splitting into `staticColors` + `colors`.
- [ ] **Two `AuthContext` files**: delete `src/contexts/AuthContext.tsx` once nothing imports it.
- [ ] **Two User/Role types**: long-term, pick one. Short-term, the mapping in `AuthContext` (`'senior' → 'elder'`) is the contract.
- [ ] **No tests**: pick a runner (Jest is the obvious default for RN/Expo) before the codebase grows further.
- [ ] **Smoke-test on a simulator**: bundle compiles, but no one has actually run the app since the design-system migration. Worth a 5-minute sanity check.

---

## Working agreements with Claude (the assistant)

- Claude can edit files freely in this worktree, run lint/type-check, and commit. Pushing or opening PRs requires explicit ask.
- When Claude finishes a meaningful chunk of work, it should append a SESSION.md entry.
- When Claude discovers a non-obvious gotcha, it should add a MEMORY.md entry.
- If a "fix" reveals a deeper architectural issue (e.g., the duplicates list), Claude should flag it here rather than silently widening the change.

---

## Contacts / external resources

- API: `https://carsignal-api.vercel.app/api` (docs at `/docs`)
- Figma file: [Med-Tech-Care](https://www.figma.com/design/Mwpl0ZrMdAts95EaHmzrjh/Med-Tech-Care)
- Linear / Jira / Slack: *(not configured — fill in when you have them)*

## Tooling: Figma Remote MCP

The repo is configured to use Figma's **remote** MCP server (see [.mcp.json](.mcp.json)). It runs on Figma's cloud at `https://mcp.figma.com/mcp` — free, no Dev/Full seat required.

Setup on a new machine:

1. **Restart Claude Code** in this repo after pulling. On first connect, Claude Code will prompt OAuth — sign in to Figma in the browser tab it opens, then approve the connection.
2. **In Figma**, open the file you want to work with and **select the frame/node** you want me to query. The MCP works on the currently selected frame.
3. Once connected, the tools `mcp__figma__*` will be available.

Notes:
- The local Dev Mode MCP (`http://127.0.0.1:3845`) is **not** what we use — that one requires a paid Dev/Full seat. The remote one is free.
- If OAuth fails, sign in to figma.com in your default browser first, then reconnect.
