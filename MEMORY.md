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

- [ ] **CheckInHome.tsx**: still uses legacy `theme` import, `<NeumorphicView>`, and has a stray `Button` import from `react-native` (the React Native primitive, not our component). Migrate fully.
- [ ] **SignUpScreen.tsx line 20**: imports `colors` from `~/shared/design` and then shadows it with `useColors()` on line 26. Drop the package-level import.
- [ ] **Two `AuthContext` files**: delete `src/contexts/AuthContext.tsx` once nothing imports it.
- [ ] **Two API clients**: delete `src/shared/api/client.ts` (incomplete fetch stub) once we're sure nothing imports it.
- [ ] **Two User/Role types**: long-term, pick one. Short-term, the mapping in `AuthContext` is the contract.
- [ ] **No tests**: pick a runner (Jest is the obvious default for RN/Expo) before the codebase grows further.

---

## Working agreements with Claude (the assistant)

- Claude can edit files freely in this worktree, run lint/type-check, and commit. Pushing or opening PRs requires explicit ask.
- When Claude finishes a meaningful chunk of work, it should append a SESSION.md entry.
- When Claude discovers a non-obvious gotcha, it should add a MEMORY.md entry.
- If a "fix" reveals a deeper architectural issue (e.g., the duplicates list), Claude should flag it here rather than silently widening the change.

---

## Contacts / external resources

- API: `https://carsignal-api.vercel.app/api` (docs at `/docs`)
- Linear / Jira / Slack: *(not configured — fill in when you have them)*
