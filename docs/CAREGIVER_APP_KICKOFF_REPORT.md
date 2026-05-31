# Caregiver Mobile App — Pre-Kickoff Report

**Status:** Not yet started — discovery / scoping phase
**Audience:** Project sponsor + customer-facing decision-maker
**Sibling project:** CareSignal (different app, same customer)
**Date:** mid-May 2026

---

## 1. Scope at a glance

A **field-execution mobile app for caregivers** delivering home-care visits. Unlike CareSignal (consumer-facing, family↔senior), this is a **workforce tool**: caregivers see only their assigned visits and capture EVV (Electronic Visit Verification) data during each shift.

### Core features

| Module | What it does |
|---|---|
| Today's Visits | Caregiver's day list — assigned visits with time, address, client name |
| Client Detail | Care plan, allergies, special instructions, contacts (read-only on mobile) |
| Clock In/Out | Captures EVV: GPS coordinates + timestamp + caregiver identity |
| Tasks | Per-visit task checklist (ADLs, meds, vitals if applicable) |
| Notes | Free-text per-visit notes |
| Incident Flag | Quick-report mechanism for falls, refusals, hazards |
| Sync Status | Visibility into pending offline records + last sync time |

### Out of scope (explicitly excluded)

- Billing, payroll, scheduling-by-caregiver — those live in the agency's back office
- Cross-client browsing — caregivers can only see their own assigned visits
- Admin reports, supervisor dashboards — separate web/agency app
- Editing locked/submitted visits — once synced, immutable

---

## 2. The headline architectural requirement: offline-first

This is the **biggest single decision** in the project and shapes every other choice.

### Why offline-first is non-negotiable

Caregivers work in:
- Homes with no Wi-Fi
- Rural areas with spotty cellular
- Basements / interior rooms with poor signal
- Apartment buildings that block GPS

**If the app requires connectivity to clock in, the agency loses billable visits and the caregiver is locked out of their job.** EVV must capture locally and sync when network returns.

### What "offline-first" actually means in code

Standard tactic in 2026 React Native:

| Concern | Tool | Why |
|---|---|---|
| Local DB | **WatermelonDB** or **SQLite (`expo-sqlite`)** with **Drizzle ORM** | Reactive, fast, mature in RN |
| Sync engine | **PowerSync** or roll-our-own queue with conflict resolution | PowerSync is becoming the default; built atop Postgres-LSN |
| GPS | `expo-location` with background permission | Required for EVV |
| Time | Device clock + server-validated timestamp on sync | EVV regulations require both |
| Offline queue | Persistent action queue (clock-ins, notes, task completions, incidents) | Survives app kill, force-restart |
| Conflict handling | Last-write-wins for notes; immutable-after-sync for clock events | Industry pattern |

**Recommendation:** WatermelonDB + custom sync queue talking to a Postgres backend, OR PowerSync if customer wants managed sync infra. PowerSync adds ~$200-1000/mo depending on usage but saves weeks of dev work.

---

## 3. EVV compliance — the regulatory landmine

If this app is for **US Medicaid-funded home care**, EVV is federally mandated by the 21st Century Cures Act (Section 12006). This dramatically affects scope.

### What we need to know from the customer up front

| Question | Why it matters |
|---|---|
| **Which US states will this operate in?** | EVV requirements vary by state. ~30 states use Sandata/HHAeXchange/Tellus aggregators. Others have built their own. |
| **Is the agency using an EVV aggregator (Sandata, HHAeXchange, Tellus, AuthentiCare)?** | If yes, our app must export EVV data in that aggregator's format. This is a major integration. |
| **Are visits funded by Medicaid, private pay, LTC insurance, or VA?** | Only Medicaid Personal Care Services + Home Health Services are EVV-mandated federally. Private pay is optional. |
| **What's the agency's NPI + Provider ID?** | Required in EVV submissions |
| **Will the app submit EVV directly, or will the back-office system aggregate and submit?** | Two completely different architectures |
| **Country other than US?** | If not US, no EVV regs apply, but agency may still want GPS/time capture for QA |

### EVV technical requirements (when applicable)

EVV records must capture **six required data points** per visit:
1. Type of service performed
2. Individual receiving the service (client ID)
3. Date of the service
4. Location of the service (GPS coords)
5. Individual providing the service (caregiver ID)
6. Time the service begins and ends

Plus optional: telephony fallback (caregiver calls a 1-800 # if no smartphone signal), supervisor override, GPS spoofing detection.

### HIPAA — independent of EVV

Even outside Medicaid, this app handles **PHI (Protected Health Information)** — client name + address + care needs + visit notes is all PHI.

Implications:
- BAA (Business Associate Agreement) required with cloud providers
- Encryption at rest + in transit (standard now, but auditors will ask)
- Audit log of who accessed what record
- 7-year retention requirement for healthcare records
- Breach notification procedures

---

## 4. What we need from the customer (action items)

### 📄 Documents / decisions (blocking)

| # | Item | Why | When needed |
|---|---|---|---|
| 1 | Complete requirements doc (the snippet you shared is one row of a table) | Need full functional spec, not just module names | Before any wireframes |
| 2 | List of states where the app will operate | EVV regulations vary by state; some are not Medicaid-EVV at all | Before architecture |
| 3 | Confirm Medicaid vs. private-pay model | Determines if EVV compliance is mandatory | Before architecture |
| 4 | EVV aggregator (Sandata? HHAeXchange? Tellus? Direct-to-state?) | Determines integration scope | Before architecture |
| 5 | Existing back-office system (Axxess? AlayaCare? ClearCare? in-house?) | Determines API surface to integrate with | Before architecture |
| 6 | Are caregivers W-2 employees or 1099 contractors? | Affects payroll integration scope (out of scope here but adjacent) | Before scoping |
| 7 | User base size estimate (# of caregivers, # of clients, # of visits/day) | Capacity planning, pricing tier of services | Before architecture |
| 8 | Target devices — agency-issued phones, BYOD, both? | Affects MDM, OS version support, hardware constraints | Before development |
| 9 | Languages required (English only? Spanish? Multi-locale?) | Caregiver workforce often non-English-native | Before UI work |
| 10 | Visit cancellation / no-show flow | What does the caregiver do when client doesn't answer the door? | Phase 1 design |
| 11 | Supervisor-override flow | Who can edit/correct a synced visit? | Phase 1 design |
| 12 | Telephony fallback requirement? | Some states require IVR backup for caregivers without smartphones | Affects backend scope significantly |

### 🔑 Access / credentials needed

| # | Item | Owner | Notes |
|---|---|---|---|
| 1 | Sample dataset (10 anonymized visits, 5 clients, 2 caregivers) | Customer | Drives all early development |
| 2 | API credentials for existing back-office system | Customer | If we're integrating, not replacing |
| 3 | EVV aggregator sandbox credentials (Sandata Dev Center / HHAeXchange UAT / etc.) | Customer or aggregator | For dev/test environment |
| 4 | Test client + caregiver records in production-shaped data | Customer | For end-to-end QA |
| 5 | Apple Developer Program enrollment ($99/yr) | Customer | Field workers will need TestFlight + App Store distro |
| 6 | Google Play Console ($25 one-time) | Customer | Same |
| 7 | Apple MDM enrollment token (if agency-issued iOS) | Customer | For supervised devices |
| 8 | Android Enterprise / Managed Google Play (if agency-issued Android) | Customer | Same |
| 9 | Firebase project for FCM (Android push for visit alerts) | Customer + us | Same gotchas as CareSignal — org policies can block |
| 10 | Backend hosting decision (Vercel? AWS? same Supabase as CareSignal?) | Customer | Determines deployment model |
| 11 | HIPAA-compliant cloud accounts (AWS BAA-eligible, Google Cloud BAA, etc.) | Customer | If US Medicaid: mandatory |
| 12 | Sentry org access | Customer | Error monitoring |
| 13 | App store listing materials | Customer | Icon, screenshots, description, privacy policy, support email |

### 🏥 Compliance / legal

| # | Item | Why |
|---|---|---|
| 1 | BAA with cloud provider(s) | HIPAA — mandatory if handling PHI |
| 2 | BAA between agency and us (the dev team) | We become a "Business Associate" by touching PHI |
| 3 | Privacy Policy + Terms of Service for the app | Required by app stores + HIPAA + state laws |
| 4 | EVV submission contract with state / aggregator | If we're directly submitting, we need credentials and signed agreements |
| 5 | Data retention policy | Typically 7 years for healthcare; affects DB design |
| 6 | Breach notification procedure | Required by HITECH Act |
| 7 | SOC 2 plans? | Some agencies will require this from vendors within 12 months |

---

## 5. Recommended tech stack

Sharing a baseline so the customer can react / push back. **Final decisions after the questions in §4 are answered.**

### Mobile

| Layer | Choice | Why |
|---|---|---|
| Framework | **React Native + Expo SDK 54** (same as CareSignal) | Reuse team knowledge; share component library |
| Local DB | **WatermelonDB** (or PowerSync if managed sync wanted) | Offline-first DB built for RN |
| Network | **TanStack Query + custom mutation queue** | Standard for offline-aware UIs |
| GPS | **`expo-location`** with foreground + background permissions | EVV requires GPS at clock-in/out |
| Auth | **JWT + biometric unlock** (Face ID / fingerprint) | Caregivers re-enter app many times/day |
| Crash reporting | **Sentry** | Same as CareSignal |
| Push | **Expo Push → FCM/APNs** | Same plumbing as CareSignal |
| State | **Zustand or React Context** | Keep it small; caregiver app is screen-flow heavy |

### Backend

| Layer | Choice | Why |
|---|---|---|
| API | **Node/TypeScript on Vercel** or **Python/FastAPI** | Pick whatever team is already strong in. Same stack as CareSignal recommended for consistency. |
| DB | **Postgres (Supabase, RDS, or Neon)** | Need ACID + JSONB for visit data; HIPAA-eligible variants exist |
| Auth | **Supabase Auth** or **Auth0** | Both have BAA options |
| Sync infra | **PowerSync** (managed) or **custom Postgres-LSN replication** | The biggest scaling challenge in this app |
| Background jobs | **Inngest** / **Temporal** / cron | For visit reminders, geofence validation, EVV submission |
| File storage | **S3 / Supabase Storage** with KMS encryption | For optional photo capture (incident photos, signature) |

### DevOps

- **EAS Build + EAS Submit** (Expo's CI for native apps)
- **GitHub Actions** for backend + tests
- **Sentry** for monitoring
- **Datadog or Grafana Cloud** for backend metrics (HIPAA-compliant tiers available)

---

## 6. Suggested phasing — what to build first

A logical breakdown into 5 phases, ~10-14 weeks total for a tight MVP.

### Phase 0 — Discovery (1-2 weeks)
- Customer answers §4 questions
- Pick EVV aggregator (if applicable)
- Wireframes for the 7 modules
- Confirm tech stack
- Sign BAAs

### Phase 1 — Auth + visit list + client detail (2 weeks)
- Login / biometric unlock
- Today's Visits list with assignment
- Client Detail read-only screen
- Skeleton offline DB + sync of read-only data

### Phase 2 — Clock in/out + EVV capture (3 weeks) ⭐ riskiest
- GPS permission flow
- Offline clock-in/out with local persistence
- Sync queue with retry/backoff
- Server-side EVV record validation
- Integration with aggregator (if any) — usually a multi-week effort on its own

### Phase 3 — Tasks + Notes + Incidents (2 weeks)
- Per-visit task checklist with offline state
- Free-text note capture
- Incident flag with structured form
- Optional photo attachment (encrypted-at-rest)

### Phase 4 — Sync UI + edge cases (1-2 weeks)
- "X items pending sync" indicator
- Failed-sync recovery flow
- Locked-after-submission UI
- Time-zone handling for multi-state caregivers
- Visit start outside geofence warning

### Phase 5 — Hardening + QA (2 weeks)
- Field testing with real caregivers
- HIPAA audit log
- Crash + performance tuning
- App store submission

---

## 7. Comparison with CareSignal — what we learned that applies here

Key takeaways from the CareSignal build that should inform Caregiver app decisions:

| CareSignal pitfall | Caregiver app preemption |
|---|---|
| Used the Expo default `com.anonymous.*` package — had to rename later | Choose final `com.medtechcare.caregiver` (or similar) on day 1 |
| Two different `User` shapes (`senior/caregiver/admin` vs `elder/family`) emerged in different parts of the codebase | Define the canonical `Caregiver`, `Client`, `Visit` types in one place before writing any feature code |
| Backend bugs (`/profiles/me` 500, `/senior/status` 404) blocked client testing | Insist backend has a sample-data sandbox before client team starts |
| FCM blocked by org policy (`iam.disableServiceAccountKeyCreation`) at zaybuconsulting.com | Resolve Firebase access policy with org admin **during Phase 0** |
| `expo-device` was added but native module wasn't rebuilt; runtime crash | Plan a "native dependencies frozen" checkpoint per phase — anything added after triggers a rebuild |
| Two parallel design systems lived in the codebase (legacy + new) | Greenfield app — commit to **one** design system from the start |
| Notification hooks defined but never mounted in the navigator tree | Wire push notifications into `RootNavigator` from the first auth-state commit |
| Mismatch between API doc (5-char invite code) and reality (10-char hex) | Have backend serve OpenAPI/Swagger, generate types client-side, eliminate drift |
| Daily reminders were initially client-scheduled (unreliable) | Visit reminders must be server-driven cron jobs from day 1 |

---

## 8. Critical risks to flag with the customer

| Risk | Severity | Mitigation |
|---|---|---|
| EVV regulations require state-by-state integration; underestimating scope | 🔴 Very high | Confirm state list + aggregator before any code |
| Offline sync corner cases (concurrent edits, clock skew, partial sync) | 🔴 High | Use battle-tested library (PowerSync/WatermelonDB), not custom |
| HIPAA non-compliance (PHI in unencrypted DB, no BAA, no audit log) | 🔴 High | Resolve in Phase 0, not retroactively |
| Battery drain from continuous GPS | 🟡 Medium | Only request GPS at clock events, not throughout visit |
| App Store rejection for healthcare-data handling | 🟡 Medium | Pre-review compliance with reviewers (App Store has med-specific guidelines) |
| Caregiver smartphone fragmentation (Android 8+ phones still in use) | 🟡 Medium | Confirm minimum OS version with customer based on caregiver workforce |
| Language/literacy barriers in caregiver workforce | 🟡 Medium | i18n from day 1; large tap targets; minimal text |
| Lost / stolen device exposes PHI | 🟡 Medium | Remote wipe via MDM; biometric unlock; short session timeout |
| Caregivers gaming GPS (mock locations) | 🟡 Medium | Mock-location detection at clock events |
| State EVV systems have outages → can't submit on time | 🟢 Low (we don't control it) | Document retry policy; agency back office handles late submissions |

---

## 9. Cost estimates (very rough — refine after Phase 0)

### One-time

| Item | Estimate |
|---|---|
| App development (10-14 wk, 1-2 engineers) | $40k-$120k depending on team |
| EVV aggregator integration (one) | $10k-$25k |
| HIPAA security review / pen test | $5k-$15k |
| App store assets + listing | $2k-$5k |
| **Total one-time** | **~$60k-$165k** |

### Recurring (monthly)

| Item | Cost |
|---|---|
| Expo / EAS team plan | $99/mo |
| PowerSync (if used) | $0-$1k/mo depending on scale |
| Hosting (Vercel + DB) | $40-$400/mo at MVP scale |
| Sentry + observability | $50-$200/mo |
| HIPAA-compliant cloud BAA upgrades | varies |
| App store fees | $99/yr (Apple) + $25 once (Google) |
| EVV aggregator API fees | varies — sometimes per-visit |
| **Total monthly** | **~$200-$1500/mo at MVP scale** |

These can be tightened drastically after the customer answers §4.

---

## 10. Recommended immediate next steps

1. **Send the §4 questions to the customer as a checklist.** Nothing happens until those answers come back.
2. **Schedule a 60-90 min discovery call** with the customer's clinical operations lead + IT lead. Walk through:
   - State coverage
   - EVV obligations
   - Existing back-office system
   - Workforce size & device strategy
3. **Decide BAA scope** — figure out who's the BA and who's the CE. (Agency = Covered Entity; we and our cloud providers = Business Associates.)
4. **Stand up a sandbox repo** mirroring CareSignal's setup so we can hit the ground running once Phase 0 closes.
5. **Reuse CareSignal's design system + shared components** — saves 2-3 weeks of design work on this app.

---

## 11. Open questions for internal team

- Will this share a codebase / monorepo with CareSignal? Or separate?
- Will it share the same backend (`carsignal-api.vercel.app`) under different routes, or be a separate service?
- Do we have a clinical advisor / SME who can review caregiver workflows? (We've all built software; few of us have done a home-care shift.)
- Do we want to commit to PowerSync (managed) or invest in custom sync infra? Strong recommendation: **PowerSync if budget allows**.

---

## Summary one-liner for the customer

> **The Caregiver app is a different beast than CareSignal — offline-first, EVV-regulated, HIPAA-strict. Before we write any code, we need answers to ~12 scoping questions and ~13 access/credential items, plus signed BAAs. Once those land, we estimate 10-14 weeks to a tight MVP at $60k-$165k development cost.**

---

*Living document — update as Phase 0 answers come in.*
