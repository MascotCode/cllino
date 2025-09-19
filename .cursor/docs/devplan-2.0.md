# Car Wash MVP — Dev Plan 2.0 (Cash-Only)


## Goal
A customer books a mobile car wash in ≤60s; a provider receives and completes the job. Payment is **cash on completion**.


## Golden Path — Customer
1) Home → choose **service** (Basic / Deep / Interior / Exterior / Add‑ons)
2) Set **address** via map pin + confirm geocoded text
3) Choose **time** (Now / Schedule today)
4) See **suggested price** (floor + distance + car‑size); can edit within min/max
5) **Match flow**
- Ping **1–3** nearby providers (rank: ETA + rating + distance)
- If **1** accepts in ≤60s → **auto‑assign**
- If **≥2** accept → show **≤2 cards** (ETA/rating/price) → user picks
6) Confirmation screen shows: assigned provider, ETA, **Cash payment** note
7) Track job → **Rate** after completion → Quick rebook CTA


## Golden Path — Provider
1) Onboard (profile + light KYC) → set availability window
2) Receive **invite** (TTL ≤90s) → **Accept** (capacity check)
3) Navigate → **Complete** → mark **Cash received** → rating prompt


## Product Guardrails
- **No vehicle profiles**; collect **Car Size** only (Compact / Sedan / SUV / Van)
- **Privacy**: exact address shown **after match**; pre‑match is approximate
- **Broadcast cap**: invite max 1–3 providers; responses TTL 60–90s
- **Choice cap**: show ≤2 response cards; auto‑assign if user idle ≥60s
- **Cash‑only** MVP: store `price` and `payment_status` (Pending → CashPaid) for metrics


## Pricing
- Suggested price = **floor(service)** + **distance adj** + **car‑size surcharge**
- User can edit within **[min, max]** bounds; below floor is blocked with explanation


## Failure & Fallback
- If 0 accepts in 90s → expand radius once → show **Schedule** option
- Auto‑release all holds/TTL; providers never keep stale invites


## KPIs
- T1: Time to book ≤60s
- F1: ≥85% matched within 90s
- Q1: Avg rating ≥4.6
- S1: First‑job completion ≥90%


## Risks & Mitigations
- Low provider availability → schedule fallback + radius expansion
- Provider invite fatigue → cap 3 concurrent, short TTL, rank by ETA
- Stale offers → server arbiter expires/auto‑assigns deterministically


## Acceptance Criteria (MVP)
- With exactly 1 provider online → auto‑assign <10s
- With ≥2 online → show ≤2 cards; never allow stale selection
- Clear empty‑state path when no accept in 90s