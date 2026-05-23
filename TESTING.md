# CareSignal — Manual Test Checklist

| Field         | Value |
| ------------- | ----- |
| Date          |       |
| Tester        |       |
| Build / SHA   |       |
| Device(s)     |       |

> **Legend:** write `P` (Pass), `F` (Fail), or `-` (Skipped) in the **Result** column.

---

## 1. Authentication

|  #   | Test Case                                       | Expected Result                                     | Result | Notes |
| :--: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 1.1  | Sign up as FAMILY (valid email + password)      | Lands on Family dashboard; session persists         |        |       |
| 1.2  | Sign up as SENIOR (valid email + password)      | Lands on CheckInHome; session persists              |        |       |
| 1.3  | Sign up with already-existing email             | Inline error; no crash                              |        |       |
| 1.4  | Sign up with weak password                      | Validation error; no API call                       |        |       |
| 1.5  | Sign up with malformed email                    | Validation error                                    |        |       |
| 1.6  | Sign up while offline                           | Friendly error; no stuck spinner                    |        |       |
| 1.7  | Sign up returns `access_token: null`            | NO CRASH (regression: split-of-null fix)            |        |       |
| 1.8  | Log in with valid credentials                   | Lands on correct dashboard for role                 |        |       |
| 1.9  | Log in with wrong password                      | Inline error; stays on login                        |        |       |
| 1.10 | Log in with unknown email                       | Inline error                                        |        |       |
| 1.11 | Log in offline                                  | Friendly error                                      |        |       |
| 1.12 | Background app on auth screen, then foreground  | No crash; state preserved                           |        |       |
| 1.13 | Tap email link with valid `token_hash`          | Auto-verifies; lands in app                         |        |       |
| 1.14 | Tap expired / invalid email link                | Error screen with "request new link" CTA            |        |       |
| 1.15 | Deep link opens app when already logged in      | Sensible fallback                                   |        |       |
| 1.16 | Forgot password: valid email                    | Confirmation message                                |        |       |
| 1.17 | Forgot password: unknown email                  | Generic message (no enumeration)                    |        |       |
| 1.18 | Open reset link → submit new password           | Can log in with new password                        |        |       |
| 1.19 | Submit reset with weak password                 | Inline validation error                             |        |       |
| 1.20 | Logout from senior screen                       | Returns to login; storage cleared                   |        |       |
| 1.21 | Logout from family screen                       | Returns to login; storage cleared                   |        |       |
| 1.22 | Logout with no network                          | Local state still clears                            |        |       |
| 1.23 | API call after token near expiry                | Refresh fires; original call succeeds               |        |       |
| 1.24 | Refresh token revoked (401 → refresh 401)       | Logout dispatched; routed to login                  |        |       |
| 1.25 | Resume from background after token expiry       | Auto-refresh on next API call                       |        |       |

---

## 2. Senior (Elder) — Check-In Home

|  #   | Test Case                                       | Expected Result                                     | Result | Notes |
| :--: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 2.1  | First load of the day                           | Greeting voice + 3 status buttons visible           |        |       |
| 2.2  | Tap "I'm OK"                                    | POST succeeds; flips to "already checked in"        |        |       |
| 2.3  | Tap "I Need Help"                               | POST succeeds; voice plays; status set              |        |       |
| 2.4  | Tap "Urgent Help" (autoCall ON)                 | Voice + auto-call message; alert to family          |        |       |
| 2.5  | Tap "Urgent Help" (autoCall OFF)                | Voice without auto-call language                    |        |       |
| 2.6  | Reload after submitting                         | GET /today returns record; UI consistent            |        |       |
| 2.7  | Submit while offline                            | Inline error; button not stuck                      |        |       |
| 2.8  | Voice toggle ON ↔ OFF                           | Label reflects state; actions speak or not          |        |       |
| 2.9  | Switch voice Warm ↔ Clarity                     | "Test Voice" uses selected voice                    |        |       |
| 2.10 | Save Blood Sugar (valid positive number)        | API succeeds; "Saved at HH:MM" shown                |        |       |
| 2.11 | Save Blood Pressure (valid number)              | Success                                             |        |       |
| 2.12 | Save vital with empty value                     | Inline error "Enter a reading"                      |        |       |
| 2.13 | Save vital with non-numeric / negative / 0      | Inline error "Enter a valid positive number"        |        |       |
| 2.14 | Switch input method Camera ↔ Manual             | Selection persists in payload                       |        |       |
| 2.15 | Save vital while offline                        | Error surfaced; button not stuck                    |        |       |

---

## 3. Senior — Pairing (Generate Invite)

|  #  | Test Case                                       | Expected Result                                     | Result | Notes |
| :-: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 3.1 | Generate invite code                            | Code displayed, copyable, expires correctly         |        |       |
| 3.2 | Generate invite while family already linked     | Shows existing link / appropriate state             |        |       |
| 3.3 | Revoke an active link                           | Link removed; family no longer sees senior          |        |       |

---

## 4. Family — Dashboard

|  #  | Test Case                                       | Expected Result                                     | Result | Notes |
| :-: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 4.1 | First load with no linked senior                | Empty state with "Get linked" CTA                   |        |       |
| 4.2 | Load with linked senior(s)                      | Each card shows latest check-in + timestamp         |        |       |
| 4.3 | Pull-to-refresh                                 | Re-fetches; loading indicator shown                 |        |       |
| 4.4 | Senior has no check-in today yet                | "Not checked in" state visible                      |        |       |
| 4.5 | Senior status = needs_help / urgent             | Visually distinct (color / icon)                    |        |       |
| 4.6 | Profile fallback (`/profiles/me` 500s)          | No crash; lands on dashboard                        |        |       |

---

## 5. Family — Pairing (Accept Invite)

|  #  | Test Case                                       | Expected Result                                     | Result | Notes |
| :-: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 5.1 | Enter valid invite code                         | Link created; senior appears on dashboard           |        |       |
| 5.2 | Enter invalid / expired code                    | Inline error                                        |        |       |
| 5.3 | Enter code already used                         | Inline error                                        |        |       |
| 5.4 | Accept while offline                            | Error message                                       |        |       |

---

## 6. Family — Alerts

|  #  | Test Case                                       | Expected Result                                     | Result | Notes |
| :-: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 6.1 | Load alerts (Plus plan)                         | History list rendered                               |        |       |
| 6.2 | Load alerts (free plan)                         | Plan-required upsell shown                          |        |       |
| 6.3 | Dismiss an alert                                | Removed; persists across reload                     |        |       |
| 6.4 | Receive push for new alert                      | Notification arrives; tap deep-links                |        |       |

---

## 7. Family — Alert Settings

|  #  | Test Case                                       | Expected Result                                     | Result | Notes |
| :-: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 7.1 | Load current alert settings                     | UI matches stored values                            |        |       |
| 7.2 | Toggle a setting and save (PUT)                 | Persists across reload                              |        |       |
| 7.3 | Save while offline                              | Error; values revert or hold pending                |        |       |

---

## 8. Notifications & Push

|  #  | Test Case                                       | Expected Result                                     | Result | Notes |
| :-: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 8.1 | First-launch push permission prompt             | Native iOS prompt shown once                        |        |       |
| 8.2 | Decline permission                              | App still works; no notifications                   |        |       |
| 8.3 | Senior urgent → family receives push            | Arrives within a few seconds                        |        |       |
| 8.4 | Logout fires `/devices/unregister`              | No more pushes for that device                      |        |       |
| 8.5 | Tap push while app killed                       | App opens to relevant screen (deep link)            |        |       |
| 8.6 | Tap push while app foregrounded                 | In-app toast/banner instead of OS banner            |        |       |

---

## 9. Cross-Cutting / System

|  #  | Test Case                                       | Expected Result                                     | Result | Notes |
| :-: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 9.1 | Reload app while logged in                      | INIT restores user + token from storage             |        |       |
| 9.2 | Force-quit and relaunch                         | Same as 9.1                                         |        |       |
| 9.3 | Corrupted/missing token but user present        | Falls back to logged-out cleanly                    |        |       |
| 9.4 | Network drops mid-request                       | Axios error surfaces; no unhandled rejection        |        |       |
| 9.5 | 401 from any authed endpoint                    | Refresh attempted; retry; logout on failure         |        |       |
| 9.6 | Rotate device / orientation (iPad)              | Layout stays usable (breakpoint 768)                |        |       |
| 9.7 | Dynamic Type / large accessibility text         | No clipping on buttons/cards                        |        |       |
| 9.8 | Dark / light theme                              | Both render correctly via `useColors()`             |        |       |
| 9.9 | Slow 3G simulation                              | Spinners shown; no UI freezes                       |        |       |

---

## 10. Regression — Recently Changed

|  #   | Test Case                                       | Expected Result                                     | Result | Notes |
| :--: | :---------------------------------------------- | :-------------------------------------------------- | :----: | :---- |
| 10.1 | Signup that previously crashed                  | No crash; account creation completes                |        |       |
| 10.2 | `setupTokenRefreshTimer(null)` guard            | Warns + returns null; doesn't throw                 |        |       |
| 10.3 | `decodeToken(null / undefined / "")`            | Returns null cleanly                                |        |       |
| 10.4 | All three check-in APIs end-to-end              | POST → GET /today → GET / all work                  |        |       |

---

## Summary

| Metric          | Count |
| :-------------- | :---: |
| Total tests     | 70    |
| Passed (P)      |       |
| Failed (F)      |       |
| Skipped (-)     |       |

### Blocker bugs found

|  # | Bug | Test ref |
| :- | :-- | :------- |
| 1  |     |          |
| 2  |     |          |
| 3  |     |          |

### Sign-off

| Tester | Date |
| :----- | :--- |
|        |      |
