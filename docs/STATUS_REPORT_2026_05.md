# CareSignal — Detailed Status Report

**Date:** mid-May 2026
**Codebase branch:** `feature/design-remodification`
**Tech stack:** React Native 0.81, Expo SDK 54, React 19, TypeScript (strict), Axios, Supabase (backend), Vercel (API host)

---

## 1. Executive summary

The CareSignal mobile app is **~85% functionally complete on the client side**. All 8 planned phases of front-end work are shipped: auth, family dashboard, pairing, deep links, alert routing, alert history, polish/tech-debt, and full Figma redesign of dashboard + settings.

**The remaining work is split across three external dependencies**:

1. **Backend bug fixes** — two critical endpoints currently return 500/404. The app has workarounds, but a clean fix is needed before production.
2. **Push notification infrastructure** — Expo account is set up; Firebase/FCM credentials are blocked by an organization policy (`zaybuconsulting.com`).
3. **Backend feature work** — push fan-out, device registration, missed-checkin cron, daily reminder cron (all specified, none implemented yet).

---

## 2. What's working (client side)

### Authentication
- Email/password login + signup with role selection (senior / family)
- Email verification via deep link (`caresignal://`)
- Forgot password + reset password flows
- JWT auth with proactive token refresh (5 min before expiry)
- Secure token storage (SecureStore for tokens, AsyncStorage for user)
- Public-endpoint Bearer-strip safeguard (prevents stale-token 401s on signup/login)
- Resilient login fallback when `/profiles/me` 500s — user lands on dashboard with minimal data instead of being locked out

### Senior (Elder) flow
- Daily check-in with status options: OK / I need help / Urgent help
- Voice-on/off + test voice with custom animated SegmentedControl
- Schedule slots: morning / afternoon / evening
- Pairing screen with invite code generation (10-char hex)
- Real-time invite code copy-to-clipboard

### Family flow
- Family dashboard with:
  - Live senior status (OK / Help / Urgent / Late)
  - About card with last check-in time
  - 2×2 stat grid (today's status, recent check-ins, alerts, response rate)
  - Response rating card
  - Current alert routing display
- Alert history (paginated, plus-plan gated)
- Settings screen with per-channel alert routing (push / SMS / email × help / urgent)
- Pairing: accept invite code with tolerant 4-32 char input

### Design system + UX polish
- Full Figma-fidelity redesign of dashboard + settings
- Custom Figma token system: `figmaColor`, `figmaFont`, `figmaRadius` (no hardcoded hex/sizes)
- Centralized animation tokens: `slideTo`, `fadeTo`, `springSnappy`, `easingSwift`
- Blue-tinted neumorphic shadows (replaces dull black)
- Co-located `.styles.ts` pattern across all screens (single StyleSheet.create per module load)
- Password show/hide toggle on all secure inputs
- Moti-style shimmer skeletons on Dashboard, Pairing, Alerts loading states
- Offline banner (NetInfo-backed)
- Error boundary at root

### Push notifications (client wiring complete)
- `expo-notifications` integrated
- Four Android channels created (`default`, `checkin-reminder`, `help`, `urgent` with DND bypass)
- `useRegisterDevice` hook calls `POST /devices/register` after login
- `useNotificationListener` for tap-to-route (elder→CheckInHome, family→Alerts)
- AsyncStorage caching of last-registered token (skip redundant POSTs)
- Logout flow calls `POST /devices/unregister`
- Dev test trigger: 1.5-sec long-press on logo to self-test push delivery
- EAS project `CareSignal` created, projectId `86ec6115-70c1-44a3-bba0-0a5bc64f8783`
- Android package renamed from `com.anonymous.CareSignal` → `com.medtechcare.caresignal`

---

## 3. What's blocked — backend issues

### Critical: two endpoints returning errors

| Endpoint | Status | Impact | Client workaround |
|---|---|---|---|
| `GET /profiles/me` | **500 Internal Server Error** | User profile (name, role, plan) can't load after login | Falls back to email local-part as name, defaults role to 'family'. Senior accounts may land on wrong stack. |
| `GET /senior/status` | **404 "Senior profile not found"** | Family dashboard can't render senior's current status | Friendlier error message; dashboard shows degraded state |

Both look like **missing-row bugs** — `auth.users` exists but no matching row in `profiles` / `senior_status` for newly-confirmed accounts. Likely a trigger that didn't fire or an RLS policy blocking the select.

**To diagnose:** in Supabase SQL editor, run:
```sql
select * from profiles where user_id = '<affected-user-uuid>';
```
If 0 rows → fix the row-creation trigger.

### Mismatch: invite code length

API docs spec invite codes as **5 characters**, production returns **10 characters (hex)**. Client now accepts 4–32 chars to handle both. Backend team should update the spec doc or the implementation — one or the other.

---

## 4. What's blocked — Firebase / Push setup

### Org policy blocking key creation

The Firebase project `caresignal-4f621` is inside the `zaybuconsulting.com` GCP organization, which has the **`iam.disableServiceAccountKeyCreation`** org policy enforced. This blocks downloading the FCM JSON key that Expo needs to deliver Android pushes.

**Two paths forward:**

| Path | Pros | Cons |
|---|---|---|
| **A. Get org admin at zaybuconsulting.com to add an exception** for `caresignal-4f621` | Clean, production-ready, single source of truth | Depends on someone else's timeline |
| **B. Create a parallel Firebase project under personal Google account** | Unblocks immediately, no permissions friction | Push lives under personal account; needs migration before going to org Play Store |

**Recommended:** do **B now** to unblock testing, then migrate to **A** when org admin is ready. Migration is one CLI command (`eas credentials` → upload new JSON).

### To get the org admin to act, send them this

> Hi — for the CareSignal project (`caresignal-4f621`), I need the org policy `iam.disableServiceAccountKeyCreation` lifted at the project level so Expo can deliver Android push notifications via FCM.
>
> Quick fix (~2 min):
> 1. Cloud Console → IAM & Admin → Organization Policies
> 2. Search: `iam.disableServiceAccountKeyCreation`
> 3. **Manage policy** → scope to project `caresignal-4f621` → **Override parent's policy** → Rule: **Off**
> 4. Save
>
> The JSON key will be uploaded only to Expo's secure credential store, not committed to any repo.

---

## 5. What's pending — backend implementation work

These are specified in detail in the project; the backend team hasn't built them yet.

### New endpoints (2)

| Endpoint | Purpose | Complexity |
|---|---|---|
| `POST /devices/register` | Store push token on login. Upsert on `(user_id, token)`. Pull user_id from JWT. | Trivial (~30 lines) |
| `POST /devices/unregister` | Remove token on logout. Single DELETE statement. | Trivial (~25 lines) |

### Modified existing endpoints (1 spot, ~3 lines added)

The existing `POST /checkin` handler (and `POST /alerts` if it exists) needs one extra line: after inserting an `alerts` row, call `sendAlertPush(alert)`.

### New helper (1 file, ~80 lines)

A single `sendAlertPush()` function that:
- Looks up family tokens for a senior
- POSTs to Expo's push API (`https://exp.host/--/api/v2/push/send`)
- Handles dead-token cleanup

### New cron jobs (2)

| Job | Cadence | Purpose |
|---|---|---|
| Daily check-in reminder | Every 15 min | Notify seniors near their slot times if they haven't checked in |
| Missed check-in detection | Every 15 min | Create `missed` alert + push family after 2-hour grace period |

### New DB tables (2)

```sql
push_devices (id, user_id, token, platform, app_version, created_at, last_seen_at)
push_receipts (id, ticket_id, token, alert_id, status, error_code, sent_at, checked_at)
```

### Optional but recommended

- Push receipt polling (cleans up dead tokens — without this, expired devices clog the system)
- Idempotency guard on alert creation (prevents duplicate pushes on double-tap)

---

## 6. What we need from the customer (action items)

### 🚨 Blocking — needed before production

| # | Item | Owner | ETA |
|---|---|---|---|
| 1 | Fix `GET /profiles/me` 500 error | Backend team | ASAP — blocks proper role detection |
| 2 | Fix `GET /senior/status` 404 error | Backend team | ASAP — blocks dashboard data |
| 3 | Confirm invite code length spec (5 vs 10 chars) | Backend team | 1 day |
| 4 | Implement `/devices/register` + `/devices/unregister` | Backend team | 1 day |
| 5 | Implement `sendAlertPush()` helper + wire into existing alert creation | Backend team | 1-2 days |
| 6 | Implement missed-checkin + daily-reminder cron jobs | Backend team | 1-2 days |
| 7 | Lift `iam.disableServiceAccountKeyCreation` org policy on `caresignal-4f621` | GCP org admin at zaybuconsulting.com | 1-3 days |

### 🔑 Credentials / accounts needed

| # | Item | Who provides | Current status |
|---|---|---|---|
| 1 | Expo organization access | Customer's team | ✅ `medtechcare` org created |
| 2 | EAS project | You | ✅ Created (id: `86ec6115-70c1-44a3-bba0-0a5bc64f8783`) |
| 3 | Firebase project + FCM credentials | Customer + you | ⚠️ Blocked by org policy |
| 4 | `EXPO_ACCESS_TOKEN` for backend's Vercel env | You generate, share securely | ⬜ Not yet generated |
| 5 | Apple Developer Program enrollment ($99/yr) | Customer | ⬜ Only needed when iOS launch is scoped |
| 6 | Google Play Console account ($25 one-time) | Customer | ⬜ Needed before Play Store publish |
| 7 | App Store Connect access | Customer | ⬜ For iOS launch |
| 8 | Sentry DSN (currently unset; error monitoring is wired but inactive) | Customer | ⬜ Optional but recommended |
| 9 | Production domain for deep links | Customer | ⬜ Currently `caresignal://` scheme only; needs Universal Links / App Links for HTTPS deep links |

### 📄 Information needed from customer

| # | Item | Why |
|---|---|---|
| 1 | Final Android package name confirmation: `com.medtechcare.caresignal` | This is permanent on Play Store after first publish |
| 2 | Final iOS bundle id: `com.medtechcare.caresignal` | Same — locked on App Store after first publish |
| 3 | App store listing copy (description, screenshots, privacy policy URL) | Required by both stores |
| 4 | Privacy policy URL + Terms of Service URL | Required by stores + GDPR/CCPA |
| 5 | Support email | Required by stores |
| 6 | Brand assets at correct sizes (icon, splash, feature graphic) | Required by stores |
| 7 | Backend production environment URL (currently `carsignal-api.vercel.app`) | Confirm if this is the final URL or if there's a custom domain plan |
| 8 | SMS provider for "SMS" alert routing channel (Twilio? Vonage?) | Currently SMS routing is a setting on/off but no SMS provider is wired |
| 9 | Email provider for "Email" alert routing (SendGrid? Postmark?) | Same as above |

---

## 7. Known limitations / risks

| Risk | Severity | Mitigation |
|---|---|---|
| Backend bugs not fixed before launch | High | Client has fallbacks but UX is degraded |
| Push notifications never tested end-to-end (FCM blocked) | High | Path B above (personal Firebase) unblocks testing today |
| No automated tests | Medium | Jest setup was deferred; manual QA only so far |
| SMS / email alert channels not actually wired | Medium | Settings UI exists; backend has no provider integration |
| Daily reminders are currently client-scheduled (local notifications only) | Medium | If user kills app or device is off at slot time, no reminder fires. Backend cron in §5 fixes this. |
| Sentry DSN unset | Low | Production errors won't be captured. Easy to add. |
| iOS not yet tested | Medium | Code is iOS-compatible but no Apple Developer account has been set up |
| App Store / Play Store assets not prepared | Low | 1-2 day task when ready to publish |

---

## 8. Suggested next-3-weeks plan

### Week 1 — Unblock
- [ ] Backend team fixes `/profiles/me` and `/senior/status` bugs
- [ ] Org admin lifts FCM policy OR you proceed with personal Firebase (path B)
- [ ] Complete `eas credentials` FCM upload → push works end-to-end for testing

### Week 2 — Backend push infrastructure
- [ ] Backend ships `/devices/register` + `/devices/unregister`
- [ ] Backend ships `sendAlertPush()` helper
- [ ] Wire into existing alert creation → live end-to-end push working in staging
- [ ] Cron jobs for daily reminders + missed-checkin detection

### Week 3 — Production readiness
- [ ] Sentry DSN added, real error monitoring live
- [ ] SMS provider (Twilio?) integrated for alert routing
- [ ] Email provider (SendGrid?) integrated for alert routing
- [ ] Privacy policy + Terms of Service URLs hosted
- [ ] App Store / Play Store listings drafted
- [ ] Production APK signed with real keystore (not debug.keystore)
- [ ] Internal QA pass on real Android devices
- [ ] Migrate FCM credentials to org-owned Firebase project (if path B was used)

---

## 9. Cost summary

| Service | Cost | Status |
|---|---|---|
| Expo / EAS (push relay, builds) | $0 (free tier covers push) | ✅ Active |
| Firebase / FCM (Android push delivery) | $0 (free forever, no quota) | ⚠️ Blocked |
| Vercel (backend hosting) | Existing | ✅ Active |
| Supabase (auth + DB) | Existing | ✅ Active |
| Apple Developer Program | $99/yr | ⬜ Not yet purchased |
| Google Play Console | $25 one-time | ⬜ Not yet purchased |
| SMS (Twilio etc.) | ~$0.0075/SMS in India | ⬜ Not selected |
| Email (SendGrid etc.) | $0–$20/mo (free tier ~100/day) | ⬜ Not selected |
| Sentry | $0 (developer tier 5k events/mo) | ⬜ Not active |

---

## 10. Where to find things

| Concern | Location |
|---|---|
| App config | `app.json` |
| EAS project link | `app.json → extra.eas.projectId` |
| Native Android | `android/` (package `com.medtechcare.caresignal`) |
| Native iOS | `ios/` (bundle id `com.medtechcare.caresignal`) |
| Auth flow | `src/shared/contexts/AuthContext.tsx` |
| API client | `src/services/api.ts` (handles Bearer, refresh, 401-retry) |
| Push wiring | `src/shared/notifications/` |
| Design tokens | `src/shared/design/figma.ts`, `src/shared/design/animations.ts` |
| All screens | `src/features/<feature>/screens/` |
| Navigation | `src/navigation/RootNavigator.tsx` |
