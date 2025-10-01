# Decisions (ADR-lite)

- 2025-09-26 — Provider shell uses FlatTabBar tabs over stack-only nav. Why: persistent Home/Earnings/Profile access for providers. Impact: rely on `components/nav/FlatTabBar.tsx` and tab testIDs (`prov.tabs.*`).
- 2025-09-26 — Completion flow blocks finish until cash toggle confirmed. Why: enforce cash-only MVP guardrail. Impact: `prov.complete.finish` stays disabled until `prov.complete.cash` toggled true.
