# Tasks: Playful Household Redesign

**Input**: Design documents from `specs/playful-household-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/interfaces.md

**Tests**: Existing tests must continue passing. No new test tasks generated — this is a visual reskin with no logic changes. Coverage is maintained via SC-001.

**Organization**: Tasks are grouped by user story AND split between two implementers by file ownership:
- **impl-theme**: Theme tokens, fonts, palette, radii, animation presets (FR-001 to FR-005)
- **impl-components**: State colors, avatars, animations, component restyling, feature pages (FR-006 to FR-022)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify current state and confirm test baseline before making changes

- [X] T001 Run `bun run test:unit` and `bun run test:unit:coverage` to establish passing baseline
- [X] T002 [P] Run `bun run test:integration` to establish passing integration test baseline

---

## Phase 2: Foundational — Theme Tokens (impl-theme) (BLOCKING)

**Purpose**: Create the new theme foundation that ALL component restyling depends on. MUST complete before impl-components begins.

**Owner**: impl-theme

- [X] T003 Create `src/tamagui/themes/playfulHousehold.ts` — define warm palette constants, 12-step light/dark color scales, all semantic tokens (background, color, border, shadow, accent, placeholder) for both light and dark variants, plus `choreStateColors` and `memberAccentColors` exports per `contracts/interfaces.md` Contract 6 and Contract 7
- [X] T004 Update `src/tamagui/fonts.ts` — change heading font `family` from Playfair Display to Inter, update `face` map from PlayfairDisplay weights to Inter weights, change `weight[3]` from `'400'` to `'300'` per Contract 3
- [X] T005 [P] Update `src/features/fonts/useFonts.native.ts` — remove all `@expo-google-fonts/playfair-display` imports, keep all Inter imports, rename `useLuxuryFonts` to `usePlayfulFonts`
- [X] T006 [P] Update `src/tamagui/animationsRoot.ts` (CSS) — replace `luxurySlow`, `luxuryMedium`, `luxuryCinematic` with `playfulBounce`, `playfulMedium`, `playfulQuick` per Contract 4 timing values
- [X] T007 [P] Update `src/tamagui/animationsRoot.native.ts` (Reanimated) — replace luxury presets with playful presets per Contract 4 Reanimated values
- [X] T008 Update `src/tamagui/tamagui.config.ts` — import `playfulHouseholdThemes` from new theme file (replacing `luxuryEditorialThemes`), restore radius tokens to rounded values per Contract 2 (0 through 12 and true)
- [X] T009 Grep for `useLuxuryFonts` across the codebase and update all call sites to `usePlayfulFonts`
- [X] T010 Grep for `luxurySlow`, `luxuryMedium`, `luxuryCinematic` across all source files and confirm zero remaining references (should be caught by T006/T007 but verify)
- [X] T011 Grep for `Playfair`, `playfair`, `PlayfairDisplay` across all source files and confirm zero remaining references
- [X] T012 Remove `@expo-google-fonts/playfair-display` from `package.json` dependencies and run `bun install`
- [X] T013 Regenerate `src/tamagui/tamagui.generated.css` by running `bun dev` and capturing the updated CSS output

**Checkpoint**: Theme foundation ready — all tokens, fonts, radii, and animation presets in place. impl-components can begin.

---

## Phase 3: User Story 4 — Warm, Approachable Visual Language (Priority: P2, but foundational for other stories)

**Goal**: All interactive elements use Inter, have rounded corners, and use the warm palette. This is sequenced before P1 stories because component restyling is a prerequisite for state colors and animations.

**Independent Test**: Open the app in light and dark mode. Verify Inter is the sole typeface, all elements have rounded corners, palette uses warm tones.

**Owner**: impl-components

### Implementation for User Story 4

- [ ] T014 [US4] Update `src/interface/text/Headings.tsx` — since `$heading` font is now Inter (same as `$body`), no functional change needed but verify all H1-H6 render correctly with new font
- [ ] T015 [P] [US4] Restyle `src/interface/buttons/Button.tsx` — remove `textTransform: 'uppercase'` and `letterSpacing: 2`, update `transition` from `'luxurySlow'` to `'playfulQuick'`, add `borderRadius: '$4'` (8px), add pressStyle with `scale: 0.97` for tap feedback (FR-014)
- [ ] T016 [P] [US4] Restyle `src/interface/buttons/Pressable.tsx` — update `transition` from `'luxurySlow'` to `'playfulQuick'`, add `pressStyle: { scale: 0.97, opacity: 0.85 }` for tap feedback
- [ ] T017 [P] [US4] Restyle `src/interface/forms/Input.tsx` — replace underline-only style with rounded bordered input: add `borderWidth: 1`, `borderColor: '$color6'`, `borderRadius: '$3'` (6px), `bg: '$color2'`, update `transition` to `'playfulQuick'`, update focus styles to use full border instead of bottom-only
- [ ] T018 [P] [US4] Update `src/interface/theme/ThemeSwitch.tsx` — update `transition` references from `'luxurySlow'` to `'playfulQuick'`
- [ ] T019 [P] [US4] Update `src/interface/pages/StepPageLayout.native.tsx` — verify heading font renders as Inter, no functional changes expected
- [ ] T020 [P] [US4] Update `src/interface/dialogs/Dialog.tsx` — verify heading font renders as Inter, update any hardcoded `$heading` fontFamily references if needed

**Checkpoint**: All shared UI components restyled with rounded shapes, Inter typography, warm palette, and press feedback.

---

## Phase 4: User Story 1 — Glanceable Chore Status (Priority: P1)

**Goal**: Chore cards display color-coded state indicators (overdue=coral, due soon=amber, done=green, upcoming=gray) that are visible without reading text.

**Independent Test**: View the chore board with chores in all four states. Each card shows a distinct color indicator matching its state.

**Owner**: impl-components

### Implementation for User Story 1

- [ ] T021 [US1] Restyle chore cards in `src/features/chorecue/ChoreHomePage.tsx` — add a 4px left border to each chore card colored by `dueBucket` value using `choreStateColors` from the theme file. Import `choreStateColors` from `src/tamagui/themes/playfulHousehold.ts`. Use `useThemeName()` from tamagui to select light/dark variant. Add subtle background tint (10% opacity of state color) to each card.
- [ ] T022 [P] [US1] Add rounded corners (`borderRadius: '$4'`) to all chore cards in `src/features/chorecue/ChoreHomePage.tsx` — cards should feel like rounded tiles, not rectangular rows
- [ ] T023 [US1] Verify WCAG 2.1 AA contrast for all four state colors against both light and dark backgrounds — check the hex values from research.md against the theme background tokens

**Checkpoint**: Chore state is visually distinguishable by color. All four states render correctly in light and dark mode.

---

## Phase 5: User Story 2 — Satisfying Chore Completion (Priority: P1)

**Goal**: A visible, non-blocking animation plays when a chore is completed.

**Independent Test**: Complete a chore and observe animation. Tap another element immediately to confirm non-blocking.

**Owner**: impl-components

### Implementation for User Story 2

- [ ] T024 [US2] Add completion animation to chore cards in `src/features/chorecue/ChoreHomePage.tsx` — when the complete button is pressed: (1) show a checkmark icon that scales from 0 to 1.2x then settles to 1x using `playfulBounce` animation, (2) briefly flash the card background with the "done" green tint, (3) total duration ~400ms, (4) animation must be fire-and-forget (non-blocking). Use Tamagui's `animation` prop with `playfulBounce` preset. Manage animation state with a local `useState` flag per card.
- [ ] T025 [US2] Verify completion animation works on both web (CSS) and native (Reanimated) — the `playfulBounce` preset should automatically use the correct platform driver via Tamagui's animation configuration

**Checkpoint**: Completing a chore produces a satisfying visual confirmation that does not block interaction.

---

## Phase 6: User Story 3 — Member Identity on Chore Cards (Priority: P2)

**Goal**: Member avatars are prominent on chore cards and in the header. Each member has a distinct accent color.

**Independent Test**: View chore board with chores assigned to different members. Each card shows the assignee's avatar with a distinct accent color ring.

**Owner**: impl-components

### Implementation for User Story 3

- [ ] T026 [US3] Extend `src/interface/avatars/Avatar.tsx` — add optional `accentColor?: string` prop per Contract 5. When provided, display a 2px ring around the avatar in that color. When not provided, fall back to existing `$borderColor`. Ensure avatar has `borderRadius: 9999` (fully rounded).
- [ ] T027 [US3] Add assignee avatars to chore cards in `src/features/chorecue/ChoreHomePage.tsx` — for each card, display the assignee's Avatar (size 'md', at least 32px) with their accent color from `memberAccentColors[memberIndex % 6]`. Import `memberAccentColors` from the theme file.
- [ ] T028 [P] [US3] Add member avatars to `src/features/app/MainHeader.tsx` — in the header bar, display small (size 'sm') avatars for household members with their accent colors. This makes the household feel present on every screen.
- [ ] T029 [US3] Restyle `src/features/members/MembersPage.tsx` — increase avatar size to 'lg' (48px), add member accent color ring to each avatar, remove serif font references (e.g., `fontFamily: '$heading'` and `fontStyle: 'italic'` on the "Members" title and empty state text)

**Checkpoint**: Member identity is visually prominent with distinct accent colors throughout the app.

---

## Phase 7: User Story 5 — Press Feedback on Interactive Elements (Priority: P3)

**Goal**: All interactive elements have subtle press/tap feedback animation.

**Independent Test**: Tap buttons, chore cards, and navigation tabs. Each shows a brief visual response on press.

**Owner**: impl-components

### Implementation for User Story 5

- [ ] T030 [US5] Update `src/features/app/NavigationTabs.tsx` — replace `borderBottomWidth`/`borderBottomColor` active indicator with a rounded pill background (`bg: '$color3'`, `borderRadius: '$3'`). Add `pressStyle: { scale: 0.95, opacity: 0.85 }` to each tab. Update icon active color from `$accentColor` to `$color12` or new accent.
- [ ] T031 [P] [US5] Verify press feedback on chore cards in `src/features/chorecue/ChoreHomePage.tsx` — ensure chore card press/hover styles include `scale: 0.98` and a brief opacity change

**Checkpoint**: All interactive elements respond to touch with visual feedback.

---

## Phase 8: User Story 6 — Consistent Cross-Platform Experience (Priority: P1)

**Goal**: Web and iOS render the same visual theme consistently.

**Independent Test**: Open the same screen on web and iOS. Verify colors, typography, shapes, and animations match.

**Owner**: impl-components

### Implementation for User Story 6

- [ ] T032 [US6] Restyle `app/(app)/auth/login.tsx` — update to use rounded inputs, rounded buttons, warm palette. Remove any serif font references. Ensure welcoming, simple layout.
- [ ] T033 [P] [US6] Restyle `app/(app)/auth/signup/[method].tsx` — same playful restyling as login: rounded inputs/buttons, warm palette, Inter typography
- [ ] T034 [US6] Run `bun dev` and visually verify all screens on web — chore board, members, settings, auth flows. Confirm: Inter only, rounded corners everywhere, warm palette, state colors visible, avatars present.
- [ ] T035 [US6] Run `bun run ios` and visually verify all screens on iOS simulator — same checks as T034. Confirm: font loading works, animations use Reanimated, state colors render correctly.

**Checkpoint**: Both web and iOS render the playful household theme consistently across all screens.

---

## Phase 9: Polish and Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and grep-based validation

- [ ] T036 Run `bun run test:unit` and `bun run test:unit:coverage` — confirm all tests pass with 80%+ coverage
- [ ] T037 [P] Run `bun run test:integration` — confirm all Playwright tests pass
- [ ] T038 Grep for remaining luxury editorial references: `luxuryEditorial`, `luxury`, `Playfair`, `GOLD_LIGHT`, `GOLD_DARK`, `ALABASTER`, `CHARCOAL` (as hex `#1A1A1A` or constant name) — update or remove any remaining references
- [ ] T039 Grep for `fontFamily: '\$heading'` in feature files (not Headings.tsx) — these may reference the old serif font intent. Verify they render correctly or change to `$body`.
- [ ] T040 Final dark mode verification — toggle dark mode on both web and iOS, confirm: warm dark background (not pure black), state colors meet contrast, accent colors visible, animations work

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational/impl-theme)**: Depends on Phase 1 — BLOCKS all impl-components work
- **Phase 3 (US4/Visual Language)**: Depends on Phase 2 — foundational component restyling
- **Phase 4 (US1/State Colors)**: Depends on Phase 3 — needs restyled cards
- **Phase 5 (US2/Completion Animation)**: Depends on Phase 4 — needs state-colored cards
- **Phase 6 (US3/Member Identity)**: Depends on Phase 3 — can run parallel with Phase 4/5
- **Phase 7 (US5/Press Feedback)**: Depends on Phase 3 — can run parallel with Phase 4/5/6
- **Phase 8 (US6/Platform Parity)**: Depends on Phase 4, 5, 6, 7 — final integration verification
- **Phase 9 (Polish)**: Depends on all previous phases

### Implementer Assignment

| Phase | Owner | Depends On |
|-------|-------|------------|
| Phase 1 | Either | — |
| Phase 2 (T003-T013) | impl-theme | Phase 1 |
| Phase 3 (T014-T020) | impl-components | Phase 2 |
| Phase 4 (T021-T023) | impl-components | Phase 3 |
| Phase 5 (T024-T025) | impl-components | Phase 4 |
| Phase 6 (T026-T029) | impl-components | Phase 3 |
| Phase 7 (T030-T031) | impl-components | Phase 3 |
| Phase 8 (T032-T035) | impl-components | Phases 4-7 |
| Phase 9 (T036-T040) | Either | Phase 8 |

### Parallel Opportunities

After Phase 2 (impl-theme) completes:
- Phase 4 (US1) and Phase 6 (US3) can start in parallel (different files)
- Phase 7 (US5) can start in parallel with Phase 4 and 6 (different files)
- Phase 5 (US2) depends on Phase 4 (same file — ChoreHomePage)

Within Phase 2 (impl-theme):
- T005, T006, T007 can all run in parallel (different files)

---

## Implementation Strategy

### MVP First (impl-theme + US4 + US1)

1. Complete Phase 1: Setup (baseline tests)
2. Complete Phase 2: Theme foundation (impl-theme)
3. Complete Phase 3: Visual language (US4) — all components restyled
4. Complete Phase 4: State colors (US1) — chore status glanceable
5. **SELF-VALIDATE**: Run tests, verify on web. This is the minimum viable reskin.

### Full Delivery

6. Complete Phase 5: Completion animation (US2)
7. Complete Phase 6: Member identity (US3)
8. Complete Phase 7: Press feedback (US5)
9. Complete Phase 8: Platform parity (US6)
10. Complete Phase 9: Polish and verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- impl-theme must complete Phase 2 before impl-components begins Phase 3
- All existing tests must pass after every phase — this is a reskin, not a rebuild
- The `tamagui.generated.css` file is auto-generated and must be regenerated after theme changes
- No new npm dependencies should be added (except removing `@expo-google-fonts/playfair-display`)
