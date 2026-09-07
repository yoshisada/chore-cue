# QA Test Matrix

Generated from: specs/playful-household-redesign/spec.md
Date: 2026-04-07

| # | User Flow | Source | Steps | Expected Result | Priority | Status |
|---|-----------|--------|-------|-----------------|----------|--------|
| 1 | Glanceable chore state colors — all 4 states visible | US-1 / FR-006, FR-007 | View chore board with overdue, due-soon, done, upcoming chores | Each card has distinct color indicator: coral, amber, green, gray | P0 | untested |
| 2 | Chore state color contrast (light mode) | US-1 / FR-008 | Inspect chore state colors against light background | All 4 state colors meet WCAG AA contrast | P1 | untested |
| 3 | Chore state color contrast (dark mode) | US-1 / FR-008 | Toggle to dark mode, inspect state colors against dark background | All 4 state colors meet WCAG AA contrast | P1 | untested |
| 4 | Chore state transition updates color | US-1 / SC-003 | Observe a chore transitioning from due-soon to overdue | Card color updates from amber to coral | P1 | untested |
| 5 | Completion animation plays on web | US-2 / FR-012 | Complete a chore on web | Visible animation plays for 300-500ms | P0 | untested |
| 6 | Completion animation is non-blocking | US-2 / FR-012 | Complete a chore, immediately tap another element | Second interaction is not blocked | P0 | untested |
| 7 | Completion animation uses CSS on web | US-2 / FR-013 | Complete chore on web, inspect animation driver | CSS-based animation (not JS timer) | P1 | untested |
| 8 | Completion animation uses Reanimated on native | US-2 / FR-013 | Complete chore on iOS | Reanimated-driven animation | P1 | blocked:native-only |
| 9 | Member avatar on chore cards (32px+) | US-3 / FR-009, SC-005 | View chore board with assigned chores | Assigned member avatar visible at 32px+ on each card | P0 | untested |
| 10 | Member accent colors — distinct per member | US-3 / FR-010 | View avatars for 2+ household members | Each member has a distinct accent color ring/tint | P0 | untested |
| 11 | Member avatars in header/nav | US-3 / FR-011, SC-005 | View any screen | Member avatars visible in header area | P0 | untested |
| 12 | Inter font — no Playfair Display | US-4 / FR-002, SC-007 | Inspect all text on multiple screens | Inter is sole typeface, no Playfair Display | P0 | untested |
| 13 | Rounded corners on buttons | US-4 / FR-003, SC-006 | Inspect button border-radius | 8-12px rounded corners | P0 | untested |
| 14 | Rounded corners on cards | US-4 / FR-003 | Inspect chore card border-radius | 8-12px rounded corners | P0 | untested |
| 15 | Rounded corners on inputs | US-4 / FR-003 | Inspect form input border-radius | 8-12px rounded corners | P0 | untested |
| 16 | Warm palette — light mode background | US-4 / FR-004 | View app in light mode | Soft white background (not pure #FFFFFF) | P0 | untested |
| 17 | Warm palette — dark mode background | US-4 / FR-004, SC-010 | View app in dark mode | Deep warm gray (not pure #000000) | P0 | untested |
| 18 | Dark mode toggle works | US-4 / FR-005, SC-010 | Toggle dark mode switch | Theme switches between light and dark | P0 | untested |
| 19 | Press feedback on buttons | US-5 / FR-014 | Press any button | Subtle scale-down or opacity change on press | P1 | untested |
| 20 | Press feedback on chore cards | US-5 / FR-014 | Press a chore card | Brief press feedback animation | P1 | untested |
| 21 | Press feedback on navigation tabs | US-5 / FR-014 | Tap a navigation tab | Press animation with rounded active indicator | P1 | untested |
| 22 | Navigation uses rounded pill indicator | FR-016 | View active tab indicator | Rounded pill/highlight, not editorial underline | P0 | untested |
| 23 | Members page — larger avatars + accent colors | FR-018 | Navigate to members page | Avatars displayed prominently with accent colors | P1 | untested |
| 24 | Auth login — rounded styling | FR-019 | Navigate to login page | Rounded inputs, buttons, warm palette | P1 | **blocked:credentials** |
| 25 | Auth signup — rounded styling | FR-019 | Navigate to signup page | Rounded inputs, buttons, warm palette | P1 | **blocked:credentials** |
| 26 | Cross-platform visual parity (web) | US-6 / FR-020 | View app on web | Theme consistent with spec | P0 | untested |
| 27 | Cross-platform font loading (web) | US-6 / FR-021 | Inspect font loading on web | Inter loaded via CSS @font-face | P1 | untested |
| 28 | Cross-platform font loading (native) | US-6 / FR-021 | Inspect font loading on iOS | Inter loaded via useFonts | P1 | blocked:native-only |
| 29 | Cross-platform animation driver (web) | US-6 / FR-022 | Inspect animation driver on web | CSS animation driver used | P1 | untested |
| 30 | Cross-platform animation driver (native) | US-6 / FR-022 | Inspect animation driver on iOS | Reanimated driver used | P1 | blocked:native-only |
| 31 | Single member — accent color assigned | Edge Case | View app with 1 household member | Member gets first accent color from palette | P2 | untested |
| 32 | 6 members — no duplicate accent colors | Edge Case | View app with 6 household members | All 6 colors assigned, no duplicates | P2 | untested |
| 33 | No avatar fallback — UserIcon with accent | Edge Case | View member with no avatar image | UserIcon displayed with accent color bg/ring | P2 | untested |
| 34 | State colors vs accent colors — no conflict | Edge Case | View board with state colors and accent colors | Distinct non-conflicting palettes | P2 | untested |
| 35 | Responsive — tablet viewport | FR-020 | View app at 768x1024 | Layout and theme render correctly | P2 | untested |
| 36 | Responsive — mobile viewport | FR-020 | View app at 375x667 | Layout and theme render correctly | P2 | untested |
| 37 | App starts and renders on web | SC-008 | Run bun dev, open app | All screens render without errors | P0 | untested |
