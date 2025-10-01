# Project Tracker

_Last sync: 2025-10-01T11:52:13Z • Branch: main • Head: 87cf2b9_

## Now / Next / Later (Kanban)

### NOW (P0-P1)
- [ ] Wire provider home screen to store + navigation (ID: t-001) — Owner: TBA • Area: provider • Status: planned
  - Why: Screen currently renders without store bindings so toggles and invite actions throw at runtime.
  - Acceptance:
    - `/(provider)/home` consumes `useProviderState` to hydrate profile, invites, and active job; toggling `tid.provider.toggle` updates `toggleOnline` in `lib/provider/store.ts`.
    - Tapping `prov.invite.card-<id>` or `prov.invite.view-<id>` navigates through `router.push('/(provider)/invite/<id>')`; `handleActiveJob` routes to `/(provider)/job/<activeId>`.
    - Empty state guards render without crashes when store values are null while continuing to call `utils/time.getTimeRemaining` for countdowns.

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
- `/(provider)/home`: `prov.home.toggle`, `prov.invite.card-<id>`, `prov.invite.view-<id>`, `countdown-<id>`
- `/(provider)/invite/[id]`: `prov.invite.accept`, `prov.invite.decline`, `prov.invite.expired`, `countdown-<id>`
- `/(provider)/job/[id]`: `prov.job.startDrive`, `prov.job.startWork`, `prov.job.complete`
- `/(provider)/complete/[id]`: `prov.complete.cash`, `prov.complete.finish`, `customer-rating-<n>`
- `/(provider)/earnings`: _No testIDs yet — add `prov.earnings.continue` in t-004_
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
