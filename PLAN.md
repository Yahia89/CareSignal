# PLAN.md

Phased delivery roadmap for the remaining work. Each phase is **self-contained**: API + UI + acceptance criteria together, can be reviewed and shipped before moving on. Phases are ordered by dependency (later phases assume earlier phases done) and user-impact.

> **Status legend**: `⏳ pending`  ·  `🚧 in progress`  ·  `✅ done`  ·  `🚫 blocked`

> **How to use**: pick a phase, ping me with "let's do Phase N", I implement it end-to-end, mark this doc done, append a SESSION.md entry. Don't try to do parts of multiple phases in one go — leads to half-finished states.

---

## Phase 1 — Senior daily flow lights up `✅`

**Why first:** The senior screen is already redesigned but the buttons currently only `speak()` — nothing hits the API. This is the most visible "the app doesn't actually work yet" gap. Smallest deltas, biggest visible impact.

### Tasks
1. **Wire `POST /check-ins`** — I'm OK / I Need Help / Urgent Help buttons in `CheckInHome.tsx` post the corresponding `status: 'ok' | 'needs_help' | 'urgent'`. Show optimistic-success toast or update local state on resolve.
2. **Wire `GET /check-ins/today`** on screen load — if there's already a check-in for today, render the recorded status (pill or banner) so the user doesn't double-submit.
3. **Wire `POST /vitals`** — the **Save Reading** button posts `{ vital_type, value, unit, input_method }`. Validate value is a number > 0 before sending. Surface API errors inline.
4. **Disable status buttons after submit** for the day (until next day), driven by the `today` query.

### API endpoints
- `POST /api/check-ins` (senior only, 5/min)
- `GET /api/check-ins/today` (senior only)
- `POST /api/vitals` (senior only, 20/min)

### Files affected
- `src/features/checkIn/screens/CheckInHome.tsx`
- New: `src/services/checkins.service.ts`
- New: `src/services/vitals.service.ts`
- `src/types.ts` — add payloads if not already present
- `API.md` — flip statuses

### Acceptance
- [x] Tapping "I'm OK" creates a check-in row server-side; the page subsequently shows "Already checked in today" or similar.
- [x] Tapping "Save Reading" with a non-empty numeric value creates a vitals row.
- [x] Network failure shows inline error, not a crash.
- [x] Type-check + Android bundle clean.
- [x] SESSION.md entry.

### Estimated complexity: **S** (one screen, three endpoints, no new UI)

---

## Phase 2 — Family dashboard goes live `✅`

**Why second:** Once seniors can check in, families need to actually see it. Currently `FamilyDashboardScreen` renders mock strings.

### Tasks
1. **Redesign `FamilyDashboardScreen`** to match the new Figma frame (image 4 from earlier — full screen with linked senior name, status pills, alert routing, etc.). User to share Figma values per element when we get to it.
2. **Wire `GET /senior/status`** — render `senior` profile + `check_in` + `care_status` fields.
3. **Empty states**: "No active link" message + CTA → take user to the Accept Invite flow (Phase 3).
4. **Pull-to-refresh** on the dashboard.
5. **Use the new design tokens** + `LogoCard` + Inter font (matches auth/checkin aesthetic).

### API endpoints
- `GET /api/senior/status` (family only)

### Files affected
- `src/features/dashboard/screens/FamilyDashboardScreen.tsx` (full rewrite)
- New: `src/services/senior.service.ts`
- `src/types.ts` — add `SeniorStatusResult` type
- `API.md` — flip status

### Dependencies
- **Phase 3 partial** if family hasn't accepted an invite yet (no link → 403 from this endpoint). Empty-state UX should handle this gracefully and link to Phase 3 flow.

### Acceptance
- [x] Family user with active link sees senior's name + today's care status.
- [x] Family user without an active link sees "Get linked" empty state. (CTA wires up in Phase 3)
- [x] Pull-to-refresh re-fetches.
- [x] Type-check + bundle clean.
- [x] Figma redesign of FamilyDashboardScreen.

### Estimated complexity: **M** (full screen redesign + one endpoint + empty state)

---

## Phase 3 — Pairing flow (Senior ↔ Family) `✅`

**Why third:** Phase 2 has a graceful empty state, but the actual link flow needs UI. This is two new screens (or one with state) that close the loop.

### Tasks
1. **Senior side** — somewhere in the senior flow (likely on first launch, or in Settings):
   - Show current link status via `GET /api/links` (`pending` / `active` / no-link)
   - "Generate Invite Code" button → `POST /api/links/generate-invite` → display the 5-char code clearly + tap-to-copy
   - "Revoke Link" option (with confirm) → `DELETE /api/links/{id}`
2. **Family side** — somewhere in the family flow (first launch or empty-state CTA from Phase 2):
   - "Enter invite code" input (5 chars) → `POST /api/links/accept` → success → bounce to dashboard
   - Error handling: invalid code, already-used code, wrong role
3. **Where to surface**: probably a "Pairing" or "Connection" screen that's always reachable from settings. For first-launch, navigate the user there if no link exists.

### API endpoints
- `POST /api/links/generate-invite` (senior only)
- `GET /api/links`
- `POST /api/links/accept` (family only)
- `DELETE /api/links/{id}`

(All service methods already exist in `links.service.ts` — just need UI bindings.)

### Files affected
- New: `src/features/links/screens/PairingScreen.tsx` (one screen, role-aware)
- `src/navigation/RootNavigator.tsx` — add `Pairing` to both Elder and Family stacks
- Existing: `src/features/invites/screens/GenerateInviteScreen.tsx` — likely retire (replaced by PairingScreen)
- `API.md` — flip statuses

### Acceptance
- [x] Senior can generate an invite code; the code is large/copyable on screen (`expo-clipboard`).
- [x] Family can paste/enter the invite code and link.
- [x] After family accepts, both sides see `status: 'active'`.
- [x] Senior can revoke; family side reflects the change on next dashboard load (PairingScreen pull-to-refresh + Alert-confirm Revoke).
- [x] Type-check + bundle clean.

### Estimated complexity: **M** (one screen with two role-conditional views, four endpoints)

---

## Phase 4 — Email verification deep link `✅`

**Why fourth:** Less urgent (users can still log in after manual web confirmation), but it's a UX papercut and the service method already exists.

### Tasks
1. Configure `app.json` deep linking for the `caresignal://` scheme (some of this is already in `linking.ts`).
2. Add a handler that catches `caresignal://auth/confirm?token_hash=xxx&type=signup|email|recovery`.
3. On `signup`/`email` type → call `authService.verifyEmail({ token_hash, type })` → `finalizeAuth(session)`.
4. On `recovery` type → navigate to a Reset Password screen → on submit call `authService.resetPassword({ token_hash, type: 'recovery', password })`.
5. Add a Reset Password screen if missing (the existing ForgotPasswordScreen has both states; might just need to confirm the deep-link wiring).
6. Test on Android with `adb shell am start -W -a android.intent.action.VIEW -d "caresignal://auth/confirm?token_hash=test&type=signup"`.

### API endpoints
- `POST /api/auth/verify-email`
- `POST /api/auth/reset-password`

(Both service methods exist.)

### Files affected
- `app.json` — verify the `scheme` is registered
- `src/navigation/linking.ts` — extend
- New or modified: `src/features/auth/screens/ConfirmDeepLinkScreen.tsx` (interstitial that calls the API and redirects)
- `API.md` — flip status of `/auth/verify-email`

### Acceptance
- [x] Tapping the email-confirmation link in the email opens the app and signs the user in. (`auth/confirm?type=signup|email` → ConfirmDeepLinkScreen → `verifyEmail()` → `finalizeAuth()` → RootNavigator flips stacks)
- [x] Tapping the password-reset link opens a reset password screen prefilled with the token. (`auth/confirm?type=recovery` → ResetPasswordScreen with `token_hash` route param)
- [x] Type-check + bundle clean.

### Test
```sh
adb shell am start -W -a android.intent.action.VIEW \
  -d "caresignal://auth/confirm?token_hash=test&type=signup" com.anonymous.CareSignal
```

### Estimated complexity: **M** (deep-link configuration is fiddly per platform; wiring is small)

---

## Phase 5 — Family settings (alert routing) `✅`

**Why fifth:** Family users need to control how alerts route. Current `SettingsScreen` is from before the redesign and uses local state only.

### Tasks
1. **Redesign `SettingsScreen`** to match the new Figma (will need user to share frame values).
2. **Wire `GET /api/alert-settings`** — load on mount, populate toggles.
3. **Wire `PUT /api/alert-settings`** — full-replace on every change (debounced) OR an explicit "Save" button.
4. Toggles for: vital_capture_enabled, needs_help (email/text/phone), urgent_help (email/text/phone), urgent_auto_call_senior.
5. Surface API errors inline.

### API endpoints
- `GET /api/alert-settings` (family only)
- `PUT /api/alert-settings` (family only, 20/min, full replace)

### Files affected
- `src/features/settings/screens/SettingsScreen.tsx` (full rewrite)
- New: `src/services/alertSettings.service.ts`
- `API.md` — flip statuses

### Acceptance
- [x] Family user opens Settings, sees their saved alert preferences.
- [x] Toggling any option persists server-side. (400ms debounce → single PUT after a burst of toggles)
- [x] Network failure shows inline error and reverts the optimistic toggle.
- [x] Type-check + bundle clean.
- [x] Figma redesign of SettingsScreen.

### Estimated complexity: **M** (one screen, two endpoints, debounce/save semantics to settle)

---

## Phase 6 — Alert history (Plus plan) `✅`

**Why sixth:** Lower priority — Plus-plan-only, and most users will be Free initially. But the endpoints exist and the data structure is straightforward.

### Tasks
1. **New screen** `AlertsScreen` — list of past alerts with status (active / dismissed), trigger type, timestamp.
2. **Wire `GET /api/alerts`** — paginated; implement infinite scroll or paginated buttons.
3. **Wire `PATCH /api/alerts/{id}`** — dismiss button on each row.
4. **Plan gating**: If profile.plan is 'free', show upgrade CTA + sample empty state instead of trying to load alerts (server returns 403 anyway). Read `profile.plan` from AuthContext.
5. **Add navigation entry** in the family stack.

### API endpoints
- `GET /api/alerts` (family + Plus only)
- `PATCH /api/alerts/{id}` (family + Plus only)

### Files affected
- New: `src/features/alerts/screens/AlertsScreen.tsx`
- New: `src/services/alerts.service.ts`
- `src/navigation/RootNavigator.tsx` — add `Alerts` to family stack
- Family dashboard or settings: add a "View alert history" link
- `API.md` — flip statuses

### Acceptance
- [x] Plus-plan family user sees paginated alert history. (FlatList infinite scroll + pull-to-refresh)
- [x] Free-plan family user sees upgrade CTA, no 403 leakage. (Client-side `plan` gate before any fetch)
- [x] Dismiss action sets `dismissed_at` and refreshes the list. (PATCH response replaces the row in place)

### Estimated complexity: **M** (paginated list is the main work)

---

## Phase 7 — Profile editing `⏳`

**Why seventh:** Service is already wired (`authService.updateProfile`), just no UI. Small phase, can be folded into Phase 5 (Settings) if convenient.

### Tasks
1. Add an "Edit Profile" entry to Settings (or a separate screen).
2. Form: First name + Last name (only fields the API allows updating per spec).
3. On save → `authService.updateProfile({ first_name, last_name })` → update AuthContext user state from the response.
4. Validation reuses `personName()` from `validators.ts`.

### API endpoints
- `PATCH /api/profiles/me` (already wired in service)

### Files affected
- New: `src/features/settings/screens/ProfileEditScreen.tsx` (or a section in `SettingsScreen.tsx` if Phase 5 is done)
- `AuthContext` — accept a method to update the local user from a fresh profile (so the dashboard reflects the new name immediately)
- `API.md` — flip status

### Acceptance
- [ ] User can edit name; change persists across app restart.
- [ ] Validation matches signup rules (no digits, ≤50 chars, required).

### Estimated complexity: **S** (small form, existing service)

---

## Phase 8 — Polish + tech debt `🟢 mostly done (Jest deferred)`

Cleanup pass, no new features. Do this when the rest is functional.

### Tasks
1. **Redesign `ForgotPasswordScreen`** to match the new auth aesthetic. ✅ Rewritten with white-header + LogoCard pattern; reset step removed (handled by deep-link `ResetPasswordScreen`).
2. **Consolidate `extractApiError`**. ✅ Single helper at [src/shared/utils/extractApiError.ts](src/shared/utils/extractApiError.ts); 8 call-sites migrated, 3 local copies deleted.
3. **Real online status** — wire `@react-native-community/netinfo`. ✅ `useOnlineStatus` now reactive; new `OfflineBanner` mounted above `RootNavigator` in App.tsx.
4. **Add Jest** — DEFERRED. Needs babel-jest preset + jsdom env + RN mocks; non-trivial. Pull into a focused session when desired.
5. **Promote feature-local components to shared**. ✅ `LogoCard`, `OutlinedField`, `OutlinedSelect`, `logoData` moved to `src/shared/components/`; `auth/components/` directory removed; 7 importers updated.
6. **Resolve dual `colors` import in `SignUpScreen`**. ✅ Already correct (`staticColors` aliases the static export, `colors` from hook).
7. **Expo run on real device** — manual; user task.
8. **Migrate remaining legacy screens**. ✅ `DashboardScreen` (unused) deleted; `GenerateInviteScreen` (superseded by `PairingScreen`) deleted with its `features/invites/` directory.

### Acceptance
- [x] No screen renders with system font (everything Inter).
- [x] No runtime warnings about deprecated APIs.
- [x] `npx tsc --noEmit && npx expo export --platform android` clean.
- [ ] At least one smoke test passes via `npx jest`. *(Jest setup deferred.)*

### Estimated complexity: **L** (lots of small things; takes a session by itself)

---

## Phase mapping summary

| Phase | What | API endpoints lit up | Screens touched | Complexity |
|---|---|---|---|---|
| 1 | Senior daily flow | check-ins POST/GET-today, vitals POST | CheckInHome | S |
| 2 | Family dashboard live | senior/status GET | FamilyDashboard (rewrite) | M |
| 3 | Pairing flow | links generate/get/accept/delete | New PairingScreen | M |
| 4 | Email verify deep link | verify-email, reset-password | Existing screens + linking config | M |
| 5 | Family settings | alert-settings GET/PUT | SettingsScreen (rewrite) | M |
| 6 | Alert history | alerts GET/PATCH | New AlertsScreen | M |
| 7 | Profile editing | profiles PATCH (service exists) | New / settings section | S |
| 8 | Polish + tech debt | — | All remaining legacy + refactors | L |

After all phases: 23/23 endpoints wired, every screen on the new design, fonts/icons/logo consistent, basic test net.

---

## How to interrupt

If something time-critical comes up mid-phase (e.g. a critical bug, a Figma redesign), it's fine to pause. Just say "pause Phase N for X" — I'll update this doc with `🚧` and a "paused at: ..." note.

If a phase reveals new work that doesn't fit the original scope, **don't widen** — file it as a new entry in the right phase or add a Phase 9 cleanup. Keep phases atomic.
