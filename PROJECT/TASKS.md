# Project Tracker

_Last sync: 2025-10-01T17:43:52Z • Branch: main • Head: 5bee973_

## Now / Next / Later (Kanban)

### NOW (P0-P1)
- [ ] Wire provider home screen to store + navigation (ID: t-001) — Owner: TBA • Area: provider • Status: planned
  - Why: Screen currently renders without store bindings so toggles and invite actions throw at runtime.
  - Acceptance:
    - `/(provider)/home` consumes `useProviderState` to hydrate profile, invites, and active job; toggling `tid.provider.toggle` updates `toggleOnline` in `lib/provider/store.ts`.
    - Tapping `prov.invite.card-<id>` or `prov.invite.view-<id>` navigates through `router.push('/(provider)/invite/<id>')`; `handleActiveJob` routes to `/(provider)/job/<activeId>`.
    - Empty state guards render without crashes when store values are null while continuing to call `utils/time.getTimeRemaining` for countdowns.

- [ ] Cash notice primitive + adoption (ID: t-011) — Owner: TBA • Area: ui • Status: in-progress
  - Why: Cash-only messaging is duplicated and inconsistent across provider screens.
  - Acceptance:
    - `components/ui/CashNotice.tsx` centralizes the copy + icon with 16px padding, 8–12px gaps, and exposes the `cash-notice.learn` affordance.
    - `/(provider)/home` and `/(provider)/earnings` render the primitive; completion keeps its NoticeBanner.
    - Provider CTAs stay ≥44dp and surface testIDs `prov.home.cashNotice`, `prov.earnings.cashNotice`, and `prov.earnings.continue`.

- [ ] InviteCard UX V2 (chips cluster + stars under name) (ID: t-015)
  — Owner: @anouar.alh • Area: provider • Status: in-progress
  - ETA pill placed next to countdown in a right-aligned cluster
  - Stars row tightened and moved under client name
  - CTA remains full-width at bottom
  - Files: components/provider/InviteCard.tsx
  - Acceptance:
    - Chips render side-by-side; do not wrap at typical widths
    - Stars have compact spacing with numeric rating
    - All info (name, price, countdown, ETA, rating, address) visible without scrolling

- [ ] Active Job timeline refactor (ID: t-017) - Owner: @anouar.alh - Area: provider - Status: in-progress
  - Replace step list with vertical timeline component (`components/provider/JobTimeline.tsx`)
  - Keep a single header status chip; remove duplicate status chips inside the list
  - New per-step testIDs: `prov.job.step-assigned`, `prov.job.step-onTheWay`, `prov.job.step-working`, `prov.job.step-completed`
  - Files: `app/(provider)/job/[id].tsx`, `components/provider/JobTimeline.tsx`
  - Acceptance:
    - Timeline shows 4 steps with correct state styling (completed/current/pending)
    - No duplicate status chips on the page; header chip only
    - Footer CTA unaffected; safe-area respected


- [ ] Public order progress polish (timeline + provider card) (ID: t-030) — Owner: @anouar.alh • Area: public • Status: in-progress
  - Replace repeated chips with vertical timeline (PublicJobTimeline)
  - New ProviderInfoCard with tight stars, ETA pill, vehicle + plate, cash notice
  - Footer CTA unchanged; safe-area respected
  - TestIDs: pub.order.provider.name|rating|eta|vehicle|plate|cashNotice, pub.order.step-*, pub.order.markComplete
  - Files: components/public/PublicJobTimeline.tsx, components/public/ProviderInfoCard.tsx, app/(public)/confirm.tsx
  - Acceptance:
    - Only one status chip on header
    - Timeline reflects current step & styles (completed/current/pending)
    - Provider card shows ETA, rating (tight), vehicle, plate, cash notice

### NEXT
- [ ] Persist provider profile + availability to storage (ID: t-002) — Owner: TBA • Area: core • Status: planned
  - Why: In-memory mock store drops profile/online state on reload so providers lose access after app restarts.
  - Acceptance:
    - `useProviderProfile` hydrates from AsyncStorage at launch and writes on every `tid.provider.profile.toggle` or profile edit.
    - `app/index.tsx` rehydrates `loading-screen` path to land on `/(provider)/home` when a saved provider exists.
    - Adding a provider updates `tid.provider.profile.name` and `tid.provider.profile.phone` consistently across relaunches.
- [ ] Add provider store tests for invites + completion guards (ID: t-003) — Owner: TBA • Area: testing • Status: planned
  - Why: Core invite/earnings reducers lack regression tests; only the button component has coverage.
  - Acceptance:
    - Jest suite (`__tests__/providerStore.spec.ts`) covers `acceptInvite` returning null when an active job exists and matches the `prov.invite.accept` guardrails.
    - TTL expiry flow asserts `getRemainingTTL` drops expired invites and mirrors `countdown-<id>` behaviour.
    - Completing a job via `prov.job.complete` + `prov.complete.finish` pushes earnings and resets `useActiveJob` state.

- [ ] Supabase project bootstrap (ID: t-020) — Owner: TBA • Area: backend • Status: planned
  - Acceptance:
    - Supabase project created; anon/service keys stored in `.env` and `.env.example` with comments
    - SDK installed and client factory added at `lib/supabase/client.ts`
    - Minimal health check screen flag (dev-only) reports connected project (no secrets logged)
  - Files: `lib/supabase/client.ts`, `.env.example`, `app/_dev/health.tsx`

- [ ] Auth (Supabase) — email OTP + session (ID: t-021) — Owner: TBA • Area: auth • Status: planned
  - Acceptance:
    - Sign in/up UI behind feature flag; testIDs: `auth.email.input`, `auth.signin.button`, `auth.signout.button`
    - Session persisted; app restores session on cold start; fallback to provider onboarding when signed-in and profile incomplete
    - Renders current user email on Profile screen (`prov.profile.email`)
  - Files: `lib/supabase/client.ts`, `app/(auth)/*`, `app/(provider)/profile.tsx`

- [ ] Schema: providers, jobs, earnings (ID: t-022) — Owner: TBA • Area: db • Status: planned
  - Acceptance:
    - SQL migration checked in under `supabase/migrations/*` creating tables: `providers`, `jobs`, `earnings`
    - Columns cover cash-only MVP (price, status, timestamps); DB constraints align with single active job
    - Seed script for demo data; README snippet on applying migrations locally
  - Files: `supabase/migrations/*`, `supabase/seed.sql`, `README.md`

- [ ] RLS policies (cash-only + privacy) (ID: t-023) — Owner: TBA • Area: security • Status: planned
  - Acceptance:
    - RLS enabled on `jobs`, `earnings`; policies restrict rows to provider’s user_id
    - Approx address readable pre-accept; exact address only after accept (policy or view)
    - Policy unit tests via `supabase-tests` SQL or notes in README on manual verification
  - Files: `supabase/policies/*.sql`, `README.md#rls`

- [ ] Realtime invites stream (ID: t-024) — Owner: TBA • Area: backend • Status: planned
  - Acceptance:
    - Client subscribes to `invites` channel; TTL handled client-side for now
    - Fallback to mock when env missing; feature flag toggles between mock ↔ live
    - TestIDs unchanged on UI (e.g., `countdown-<id>`)
  - Files: `lib/provider/store.ts`, `lib/supabase/realtime.ts`

### LATER
- [ ] Design QA + instrumentation for provider earnings CTA (ID: t-004) — Owner: TBA • Area: ui • Status: planned
  - Why: Earnings screen lacks CTA testIDs and spacing guidance, making QA + automation brittle.
  - Acceptance:
    - `app/(provider)/earnings.tsx` exposes a `prov.earnings.continue` testID on the primary CTA and aligns card paddings to `spacing.component`/`spacing.section` tokens.
    - Documented spacing tokens appear in a short comment or story for `MetricTile` and earnings cards to ensure consistent 16/24/32pt rhythm.
    - Empty state card includes tappable targets >=44dp with explicit text contrast checks.
- [ ] Analytics skeleton for provider flows (ID: t-005) — Owner: TBA • Area: core • Status: planned
  - Why: No event logging exists; we need a lightweight hook to record interactions by testID.
  - Acceptance:
    - Introduce `utils/analytics.ts` (or similar) exporting `logInteraction({ elementId, route })` and stub transport.
    - Home, Invite, Job, Complete screens call `logInteraction` on `prov.home.toggle`, `prov.invite.accept`, `prov.job.startWork`, `prov.complete.finish` actions.
    - Analytics hook is safe to no-op in tests and documented in `PROJECT/DECISIONS.md`.
    - 2025-10-01 / 5bee973: logInteraction wired for `prov.home.toggle` and `prov.complete.finish`.

- [ ] Cash completion write-back (ID: t-025) — Owner: TBA • Area: backend • Status: planned
  - Acceptance:
    - Toggling `prov.complete.cash` + `prov.complete.finish` persists job completion + inserts earning
    - Failure states surface non-blocking toast; retry allowed
  - Files: `app/(provider)/complete/[id].tsx`, `lib/supabase/jobs.ts`

- [ ] Edge function: idle auto-assign log (ID: t-026) — Owner: TBA • Area: backend • Status: planned
  - Acceptance:
    - Edge function endpoint records “idle ≥60s with pending invite” events
    - Client calls endpoint on condition; no auto-assign action yet (MVP log only)
  - Files: `supabase/functions/idle-log/*`, `lib/telemetry/idle.ts`

- [ ] Analytics transport swap (ID: t-027) — Owner: TBA • Area: analytics • Status: planned
  - Acceptance:
    - `utils/analytics.ts` can batch+flush to Supabase table or Edge function
    - Dev mode remains console; tests mock transport
  - Files: `utils/analytics.ts`, `lib/supabase/analytics.ts`

- [ ] CI env + secrets hygiene (ID: t-028) — Owner: TBA • Area: release • Status: planned
  - Acceptance:
    - `.env.example` documented; Git ignored secrets audited
    - EAS/CI variables documented; redaction policy in PR template
  - Files: `.env.example`, `.github/PULL_REQUEST_TEMPLATE.md`, `README.md#env`

---

## Completed (most recent first)
- [x] Provider onboarding form with keyboard avoidance (ID: t-010) — Done: 2025-09-26 — Commit(s): b08f6b8
  - Outcome: Onboarding captures name/phone with validation and avoids keyboard overlap on both platforms.
  - Evidence: `app/(provider)/onboarding.tsx` testIDs: `prov.onb.name`, `prov.onb.phone`, `prov.onb.submit`
- [x] Cash confirmation gating on completion (ID: t-009) — Done: 2025-09-26 — Commit(s): b08f6b8
  - Outcome: Finish button stays disabled until cash received is confirmed and earnings are refreshed post-completion.
  - Evidence: `app/(provider)/complete/[id].tsx` `lib/provider/mock.ts` testIDs: `prov.complete.cash`, `prov.complete.finish`
- [x] Single active job guard + exact address reveal (ID: t-008) — Done: 2025-09-26 — Commit(s): b08f6b8
  - Outcome: Accepting multiple invites is blocked while an active job is running and addresses stay coarse until acceptance.
  - Evidence: `lib/provider/mock.ts` `app/(provider)/invite/[id].tsx` testIDs: `prov.invite.accept`, `prov.invite.expired`
- [x] Invite TTL with countdown + expiry UX (ID: t-007) — Done: 2025-09-26 — Commit(s): b08f6b8
  - Outcome: Countdown badge mirrors TTL, expired invites auto-remove, and detail screen shows an expiry state.
  - Evidence: `components/ui/Countdown.tsx` `app/(provider)/invite/[id].tsx` testIDs: `countdown-<id>`, `prov.invite.expired`
- [x] Provider tab shell (Home/Earnings/Profile) (ID: t-006) — Done: 2025-09-26 — Commit(s): b08f6b8
  - Outcome: Custom flat tab bar keeps provider tabs persistent with focus styling and safe-area padding.
  - Evidence: `app/(provider)/_layout.tsx` `components/nav/FlatTabBar.tsx` testIDs: `prov.tabs.home`, `prov.tabs.earnings`, `prov.tabs.profile`

---

## Milestones
| Milestone | Target | Scope (IDs) | Status |
|---|---|---|---|
| M1: Provider MVP | TBA | t-001, t-002, t-003, t-006, t-007, t-008, t-009 | in-progress |

---

## Open Risks & Questions
- RISK: Provider profile state lives only in memory, so reloads drop availability. Mitigation: deliver AsyncStorage hydration in t-002. Owner: TBA
- Q: Should provider invites persist across cold starts for QA demos? Next step: Product to clarify retention requirement before t-002 rollout (Owner: TBA)

---

## Test Map (by screen → testIDs)
- `/(provider)/home`: `prov.home.toggle`, `prov.invite.card-<id>`, `prov.invite.view-<id>`, `prov.invite.price-<id>`, `prov.invite.eta-<id>`, `countdown-<id>`, `prov.home.cashNotice`
- `/(provider)/invite/[id]`: `prov.invite.accept`, `prov.invite.decline`, `prov.invite.expired`, `countdown-<id>`
- `/(provider)/job/[id]`: `prov.job.startDrive`, `prov.job.startWork`, `prov.job.complete`
- `/(provider)/complete/[id]`: `prov.complete.cash`, `prov.complete.finish`, `customer-rating-<n>`
- `/(provider)/earnings`: `prov.earnings.cashNotice`, `prov.earnings.continue`
- `/(provider)/profile`: `prov.profile.name`, `prov.profile.phone`, `prov.profile.toggle`, `prov.profile.signout`
- `/(provider)/onboarding`: `prov.onb.name`, `prov.onb.phone`, `prov.onb.submit`

---

## Conventions

**Status**: `planned | in-progress | blocked | done | dropped`  
**Priority**: `P0 blocker | P1 critical | P2 normal | P3 nice-to-have`  
**Area**: `provider | public | core | ui | design | testing | release`  
**Task ID**: `t-###` (stable, never reuse)  
**Linking**: Use backticks for paths, short SHAs for commits, and literal testIDs.

---

## Update rules (for any LLM)
1. Never delete an ID; move tasks to “Completed” when done.
2. Keep `PROJECT/TASKS.md` and `PROJECT/tasks.json` in sync (IDs, status, fields).
3. If acceptance criteria change, add a bullet under the task with date + SHA.
4. Reference **testIDs** and **routes** in acceptance criteria.

- [ ] Review Order polish (public checkout) (ID: t-031) — Owner: @anouar.alh • Area: public • Status: in-progress
  - Add primitives: ReviewSection, PriceRow, TotalPill
  - Rewire screen: Service, Add-ons chips, Details (address/time/notes), Payment (cash)
  - Footer shows Total pill + Confirm CTA
  - TestIDs: pub.review.* (see list)
  - Acceptance:
    - Prices right-aligned with MAD unit
    - Add-ons show chips or “No add-ons selected”
    - Footer pill: “Total: X MAD · Y mins”; Confirm visible and ≥44dp
