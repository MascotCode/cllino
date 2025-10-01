# Decisions (ADR-lite)

- 2025-09-26 — Provider shell uses FlatTabBar tabs over stack-only nav. Why: persistent Home/Earnings/Profile access for providers. Impact: rely on `components/nav/FlatTabBar.tsx` and tab testIDs (`prov.tabs.*`).
- 2025-09-26 — Completion flow blocks finish until cash toggle confirmed. Why: enforce cash-only MVP guardrail. Impact: `prov.complete.finish` stays disabled until `prov.complete.cash` toggled true.

- 2025-10-01 — Introduce `CashNotice` primitive for cash-only reminders. Why: unify copy/spacing/iconography and avoid drift. Impact: reused across provider home/earnings.
- 2025-10-01 — Add analytics skeleton via `utils/analytics.ts`. Why: capture primary CTA taps without vendor lock-in. Impact: `prov.home.toggle` and `prov.complete.finish` call `logInteraction`.

- 2025-10-01 — Backend deferred to Phase 2 (Supabase). Why: keep Provider MVP frontend investor-ready first. Impact: tasks t-020…t-028 define the plan; all live calls are feature-flagged and default to mock.
