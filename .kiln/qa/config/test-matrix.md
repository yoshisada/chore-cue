# QA Test Matrix

Generated from: specs/kit-migration/spec.md + specs/002-luxury-editorial-redesign/spec.md + specs/001-phase1-chore-loop/spec.md
Date: 2026-04-04

This is a scaffold migration QA pass. The app must behave IDENTICALLY to pre-migration state.
Focus: import cleanup parity (zero @take-out/ refs), visual parity (luxury editorial theme), functional parity (chore CRUD + auth), and animation rendering.

| # | User Flow | Source | Steps | Expected Result | Priority | Status |
|---|-----------|--------|-------|-----------------|----------|--------|
| 1 | App loads with luxury editorial theme | US-001 / FR-001 | 1. Navigate to `/` | Warm off-white background, charcoal text — no pure black or pure white | P0 | untested |
| 2 | All headings use serif typeface | US-001 / FR-002 | 1. Open app, view any screen with a heading | Headings render in high-contrast serif (Playfair Display or fallback system serif) | P0 | untested |
| 3 | Body text uses sans-serif typeface | US-001 / FR-002 | 1. View body text, labels, buttons | Text renders in humanist sans-serif (Inter or fallback) | P0 | untested |
| 4 | Zero border radius on all interactive elements | US-001 / FR-003 | 1. Inspect buttons, inputs, cards, dialogs | All elements have perfectly rectangular edges — no rounded corners | P0 | untested |
| 5 | Chore board renders with editorial layout | US-002 / FR-008 | 1. Log in, navigate to chore board | Sections separated by thin borders and typographic hierarchy; no colored background blocks | P0 | untested |
| 6 | Chore board — overdue section label | US-002 / FR-007 | 1. View overdue section on chore board | "Overdue" label is uppercase with wide letter spacing; gold accent on marker | P0 | untested |
| 7 | Chore board — due section label | US-002 / FR-007 | 1. View due section on chore board | "Due" label is uppercase with wide letter spacing | P0 | untested |
| 8 | Chore board — upcoming section label | US-002 / FR-007 | 1. View upcoming section on chore board | "Upcoming" label is uppercase with wide letter spacing | P0 | untested |
| 9 | Chore card editorial styling | US-002 / FR-016 | 1. View any chore card | Generous padding, thin top border, clear editorial hierarchy for title/assignee/due info | P0 | untested |
| 10 | Create chore flow — happy path | US-001 (Phase1) / FR-001 | 1. Tap create chore, 2. Enter title/assignee/category/recurrence, 3. Save | Chore appears in list with correct due state | P0 | **blocked:credentials** |
| 11 | Complete chore flow | US-002 (Phase1) / FR-010 | 1. Tap complete on a chore | Completion recorded, next due recalculated | P0 | **blocked:credentials** |
| 12 | Chore list due state ordering | US-003 (Phase1) / FR-008 | 1. View chore board with mixed due states | Overdue first, then due, then upcoming | P0 | **blocked:credentials** |
| 13 | Send polite bump | US-004 (Phase1) / FR-013 | 1. Tap bump on an assigned chore | Bump sent with polite wording | P0 | **blocked:credentials** |
| 14 | Bump daily limit enforced | US-004 (Phase1) / FR-014 | 1. Send 5 bumps, 2. Attempt 6th | 6th bump blocked by system | P0 | **blocked:credentials** |
| 15 | Login flow | US-005 / auth | 1. Navigate to `/login`, 2. Enter credentials, 3. Submit | User authenticated, redirected to chore board | P0 | **blocked:credentials** |
| 16 | Signup flow | US-006 / auth | 1. Navigate to `/signup`, 2. Fill form, 3. Submit | New account created, session established | P0 | **blocked:credentials** |
| 17 | Session persistence on reload | US-007 / auth | 1. Log in, 2. Reload page | Session maintained, chore board shown | P0 | **blocked:credentials** |
| 18 | Logout flow | US-008 / auth | 1. Navigate to settings/profile, 2. Tap logout | Session cleared, redirected to login | P1 | **blocked:credentials** |
| 19 | Primary button gold reveal animation | US-003 / FR-005 | 1. Hover/press any primary button | Gold layer slides in from one edge over at least 500ms | P1 | untested |
| 20 | Secondary button dark fill animation | US-003 / spec | 1. Hover/press any secondary button | Background fills dark, text inverts to light over at least 500ms | P1 | untested |
| 21 | Text input underline-only styling | US-003 / FR-006 | 1. View any text input unfocused | Only bottom border visible, no surrounding box | P1 | untested |
| 22 | Text input gold focus state | US-003 / FR-006 | 1. Click/tap a text input | Bottom border transitions to gold on focus | P1 | untested |
| 23 | Chore card hover/press depth effect | US-003 / FR-017 | 1. Hover or press a chore card | Subtle soft shadow increase — no harsh drop shadow | P1 | untested |
| 24 | Dark mode inverted palette | US-001 / FR-011 | 1. Enable dark mode (system or toggle), 2. View app | Dark charcoal background, warm off-white text, same gold accent and typography | P1 | untested |
| 25 | Theme switch (light/dark toggle) | spec | 1. Navigate to settings/theme switch, 2. Toggle mode | UI transitions between light and dark luxury theme | P1 | untested |
| 26 | Reduced motion — instant transitions | US-003 / FR-010 | 1. Enable reduced-motion in OS, 2. Interact with buttons/inputs | Transitions complete instantly or with minimal motion; color changes preserved | P1 | untested |
| 27 | Navigation header luxury styling | US-005 / FR-002 | 1. View any screen with navigation header | Monochromatic palette, sans-serif text, gold accent on active/hovered item only | P1 | untested |
| 28 | User avatar rectangular shape | US-005 / FR-003 | 1. View any screen with a user avatar | Avatar is rectangular, not circular | P1 | untested |
| 29 | Dialog luxury styling | US-005 / spec | 1. Trigger any dialog (confirm action, etc.) | Rectangular edges, warm background, luxury button styling inside dialog | P1 | untested |
| 30 | Member management page | spec | 1. Navigate to members section | Members list renders with luxury editorial styling | P1 | **blocked:credentials** |
| 31 | Settings page | spec | 1. Navigate to settings | Settings screen renders with luxury editorial styling, all elements properly styled | P1 | **blocked:credentials** |
| 32 | Section headings editorial typography | US-004 / FR-002 | 1. View main screen heading | At least one word uses italic serif styling with gold accent | P1 | untested |
| 33 | Metadata text styling | US-004 / spec | 1. View timestamps/counts on chore cards | Small size, sans-serif, warm grey color | P1 | untested |
| 34 | Empty state luxury messaging | edge-case / FR-015 | 1. View app with no chores | Serif typeface empty-state message with generous spacing | P1 | **blocked:credentials** |
| 35 | Long chore title truncation | edge-case / spec | 1. Create chore with very long title | Title truncates with ellipsis, card layout preserved | P2 | **blocked:credentials** |
| 36 | WCAG AA contrast — primary text | US-005 / FR-012 | 1. Measure contrast of primary text against background | At least 4.5:1 contrast ratio | P1 | untested |
| 37 | WCAG AA contrast — secondary text | US-005 / FR-012 | 1. Measure contrast of secondary/metadata text | At least 4.5:1 contrast ratio | P1 | untested |
| 38 | Touch target minimum size | US-005 / FR-013 | 1. Inspect interactive element heights | All touch targets at least 48pt tall | P1 | untested |
| 39 | Chore board — tablet viewport | US-001 / SC-010 | 1. View chore board at 768×1024 | Editorial layout adapts; luxury feel preserved | P2 | untested |
| 40 | Chore board — mobile viewport | US-002 / SC-010 | 1. View chore board at 375×667 | Cards maintain proportional padding, labels remain uppercase with tracking | P2 | untested |
| 41 | Auth screens — mobile viewport | spec | 1. View login/signup at 375×667 | Auth forms display correctly with luxury styling | P2 | **blocked:credentials** |
| 42 | Font loading — web | US-004 / FR-014 | 1. Load app in browser, 2. Check network tab | Playfair Display and Inter fonts load; serif/sans distinction visible immediately | P2 | untested |
| 43 | Font fallback — system serif preserved | edge-case / FR-014 | 1. Block font CDN (devtools), 2. Reload | System serif fallback (Georgia/Times) used for headings; sans-serif body preserved | P2 | untested |
| 44 | Dev server starts cleanly on port 8081 | infra | 1. Run `bun dev`, 2. Navigate to http://localhost:8081 | No errors, app loads at port 8081 | P0 | untested |
| 45 | Edit chore flow | Phase1 / FR-011 | 1. Open existing chore, 2. Edit title, 3. Save | Changes persisted, styled in luxury editorial | P1 | **blocked:credentials** |
| 46 | Archive chore flow | Phase1 / FR-012 | 1. Open chore menu, 2. Archive chore | Chore removed from board | P1 | **blocked:credentials** |
| 47 | CSS animations render on web | FR-009 | 1. Interact with button on web (desktop Chrome) | @tamagui/animations-css transitions fire at luxury timing (>=500ms) | P1 | untested |
| 48 | Reanimated animations on native (iOS) | FR-009 | 1. Interact with button on iOS simulator | Reanimated transitions fire at luxury timing (>=500ms) | P2 | untested |

## Kit Migration — Additional Flows (specs/kit-migration/spec.md)

| # | User Flow | Source | Steps | Expected Result | Priority | Status |
|---|-----------|--------|-------|-----------------|----------|--------|
| 49 | Zero @take-out/ imports remain in codebase | kit/SC-005 / FR-014 | 1. Run grep -r "@take-out/" src/ scripts/ app/ package.json | Zero matches returned | P0 | untested |
| 50 | Zero tko references remain in package.json scripts | kit/SC-006 / FR-004 | 1. Search package.json for "tko" | Zero matches | P0 | untested |
| 51 | bun install resolves no @take-out/* packages | kit/US-002 | 1. Run bun install, 2. Check bun.lock for @take-out/ | Zero @take-out/ entries in lock file | P0 | untested |
| 52 | TypeScript compilation succeeds with kit imports | kit/US-002 | 1. Run tsc --noEmit (or bun check) | No type errors on kit import paths | P0 | untested |
| 53 | bun dev starts cleanly after migration | kit/SC-003 | 1. Run bun dev, 2. Navigate to http://localhost:8081 | App loads, all screens render, no console errors | P0 | untested |
| 54 | bun check executes successfully via kit CLI | kit/US-003 | 1. Run bun check | kit check command executes, exits 0 | P1 | untested |
| 55 | bun migrate:build executes successfully via kit CLI | kit/US-003 | 1. Run bun migrate:build | kit migration build command executes, exits 0 | P1 | untested |
| 56 | Unit tests pass after migration | kit/SC-001 / US-004 | 1. Run bun run test:unit | All unit tests pass | P0 | untested |
| 57 | Unit test coverage meets 80% threshold | kit/SC-001 / FR-015 | 1. Run bun run test:unit:coverage | Coverage >= 80% on all metrics | P0 | untested |
| 58 | Integration tests pass after migration | kit/SC-002 / US-004 | 1. Run bun run test:integration | All Playwright integration tests pass | P0 | untested |
| 59 | Luxury editorial theme preserved on web after migration | kit/SC-008 / US-006 | 1. Run app, view chore board on web | Fonts, colors, spacing, animations identical to 002-luxury-editorial-redesign | P0 | untested |
| 60 | Luxury editorial theme preserved on iOS after migration | kit/SC-008 / US-006 | 1. Run app on iOS simulator, view all screens | Fonts load, Reanimated animations play, colors correct | P2 | untested |
| 61 | Zero sync connects and data flows after migration | kit/US-001 | 1. Run bun backend && bun dev, 2. Create a chore | Chore syncs between client and server via Zero | P1 | **blocked:credentials** |
| 62 | Every kit bug/workaround has a GitHub issue filed | kit/SC-007 / US-005 | 1. Review migration log, 2. Check yoshisada/kit GitHub issues | Every workaround has linked kit issue | P1 | untested |
| 63 | @take-out/hooks removal causes no runtime errors | kit/spec assumptions | 1. Run app after removing @take-out/hooks | No import errors or runtime crashes related to hooks package | P0 | untested |
| 64 | postinstall.ts updated — no takeout-specific patches remain | kit/FR-007 | 1. Review scripts/postinstall.ts for @take-out references, 2. Run bun install | Postinstall runs cleanly with no takeout patches | P1 | untested |
