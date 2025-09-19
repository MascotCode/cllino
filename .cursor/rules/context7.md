# Context7 – Light-First UI Guardrail

Canonical sources (read before coding):
- tailwind.config.js (tokens + color scales)
- .cursor/context/design-profile.json (spacing, radii, shadows, typography)
- app/(public) route structure (expo-router)
- No new dependencies without explicit instruction.

Constraints:
- Light-mode first. White surfaces (surface-0), text-gray-900 for titles, text-gray-600 for body, border-gray-200 separators.
- Buttons: primary uses primary-600/700, rounded-2xl, 16px vertical padding, full width.
- Cards: rounded-xl, bg-white, border border-gray-200, shadow-sm, gap-2 inside.
- Spacing rhythm: 4/8/12/16/24. Page padding x=16.
- Typography: title text-2xl font-semibold; section headers text-base font-semibold; body text-[16].
- Don’t invent APIs, hooks, or server calls. Use inline constants or mock data.
- Preserve navigation: use <Link> or router.push() consistent with existing files.
- Add testIDs to primary CTAs and important elements.
- Keep each file readable (< ~120 LOC), avoid premature abstraction.

Definition of Done:
- Screens visually match the low-fi intent with Uber/Airbnb-like cleanliness.
- All CTAs visible on smaller devices; bottom CTA uses sticky safe-area footer.
- No new packages installed; build runs on current Expo + NativeWind.
