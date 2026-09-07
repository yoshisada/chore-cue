# Tasks: ChoreCue Luxury Editorial Redesign

**Input**: Design documents from `/specs/002-luxury-editorial-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not included — no test tasks were explicitly requested in the feature specification. Existing Phase 1 tests must not regress (verified in Polish phase).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Tamagui config: `src/tamagui/`
- Interface components: `src/interface/`
- Feature screens: `src/features/`
- App routes: `app/`
- Root CSS: `app/root.css`

## Phase 1: Setup (Package Installation)

**Purpose**: Install font dependencies and create new file scaffolding.

- [X] T001 Install `@expo-google-fonts/inter` and `@expo-google-fonts/playfair-display` packages via `bun add`
- [X] T002 [P] Create the `src/tamagui/themes/` directory and empty `luxuryEditorial.ts` file

---

## Phase 2: Foundational (Design Token Infrastructure)

**Purpose**: Build the complete design token layer (palette, fonts, radius, animation timing) that ALL user stories depend on. No visual changes are applied to screens yet — this phase only creates the configuration.

- [X] T003 Define the luxury editorial light and dark theme palette objects with the warm monochromatic color scale (`color1`-`color12`), semantic keys (`background`, `color`, `borderColor`, `shadowColor`, `placeholderColor`), and gold accent sub-theme in `src/tamagui/themes/luxuryEditorial.ts`
- [X] T004 [P] Register Playfair Display as the heading font family and Inter as the body font family with per-weight mappings using `createFont` in `src/tamagui/fonts.ts`
- [X] T005 [P] Add the Google Fonts `@import` for Playfair Display and Inter (regular, italic, medium weights) to `app/root.css`
- [X] T006 [P] Create native font loading hook using `useFonts()` from expo-google-fonts with splash screen hold in `src/features/fonts/useFonts.native.ts`
- [X] T007 [P] Create web font loading stub that returns `{ fontsLoaded: true }` in `src/features/fonts/useFonts.ts`
- [X] T008 [P] Add luxury animation timing presets (`luxurySlow` at 500ms, `luxuryMedium` at 700ms, `luxuryCinematic` at 1500ms) to the CSS animation config in `src/tamagui/animationsRoot.ts`
- [X] T009 [P] Add luxury animation timing presets to the Reanimated animation config in `src/tamagui/animationsRoot.native.ts`
- [X] T010 Wire the luxury editorial themes into the Tamagui config, override radius tokens to zero for all commonly used tiers, and register the new font families in `src/tamagui/tamagui.config.ts`

**Checkpoint**: Design token infrastructure complete — user story visual work can now begin.

---

## Phase 3: User Story 1 - Refined Visual Identity Across All Screens (Priority: P1)

**Goal**: Apply the luxury editorial palette, fonts, zero radius, and generous spacing globally so every screen reflects the warm monochromatic aesthetic with editorial serif headings.

**Independent Test**: Open the app on both web and mobile. Every screen uses warm alabaster background, charcoal foreground, serif headings, sans-serif body text, and zero rounded corners. No pure black or pure white appears anywhere.

- [X] T011 [US1] Update CSS custom properties (`--font-heading`, `--font-body`, color-scheme) and add luxury editorial color variables to `app/root.css`
- [X] T012 [US1] Update TamaguiRootProvider to apply the luxury editorial theme as the default scheme provider theme in `src/tamagui/TamaguiRootProvider.tsx`
- [X] T013 [P] [US1] Integrate native font loading hook into the root layout so fonts load before first render in `app/_layout.tsx`
- [X] T014 [P] [US1] Update PageLayout background to warm alabaster and remove gradient in `src/interface/pages/PageLayout.tsx`
- [X] T015 [P] [US1] Update GradientBackground to use the luxury monochromatic palette in `src/interface/backgrounds/GradientBackground.tsx`
- [X] T016 [P] [US1] Update PageContainer with generous luxury spacing values (increased horizontal padding and max-width adjustments) in `src/interface/layout/PageContainer.tsx`
- [X] T017 [US1] Update Headings (H1-H6) to use the serif heading font family (`$heading`) with tight line height, and SubHeading/SepHeading to use sans-serif in `src/interface/text/Headings.tsx`
- [X] T018 [US1] Verify dark mode correctly inverts to charcoal background with warm alabaster text while gold accent remains unchanged — adjust theme values if contrast checks fail in `src/tamagui/themes/luxuryEditorial.ts`

**Checkpoint**: User Story 1 delivers the base luxury editorial identity across all screens.

---

## Phase 4: User Story 2 - Luxury Chore Board Experience (Priority: P2)

**Goal**: Transform the chore board from colored theme blocks to an editorial layout with thin borders, uppercase section labels, architectural cards, and generous spacing.

**Independent Test**: Open the chore board with chores in all three due states. Sections use typographic hierarchy and thin borders instead of colored backgrounds. Cards feel spacious and elevated.

- [X] T019 [US2] Remove the colored `<Theme name="red|yellow|green">` wrappers from chore board sections and replace with the base luxury editorial theme in `src/features/chorecue/ChoreHomePage.tsx`
- [X] T020 [US2] Restyle section headers as small uppercase sans-serif labels with wide letter spacing (`letterSpacing` property) and a thin 1px top border separator in `src/features/chorecue/ChoreHomePage.tsx`
- [X] T021 [US2] Restyle chore cards with a thin architectural top border, generous internal padding, and editorial typography hierarchy (serif title, sans-serif metadata) in `src/features/chorecue/ChoreHomePage.tsx`
- [X] T022 [US2] Add a gold accent color to the overdue section label to communicate urgency without colored background blocks in `src/features/chorecue/ChoreHomePage.tsx`
- [X] T023 [US2] Restyle the chore composer (create form) and editor (edit form) with luxury editorial layout: underline-only inputs, generous spacing, uppercase form labels in `src/features/chorecue/ChoreHomePage.tsx`
- [X] T024 [P] [US2] Restyle PhotoInput with the luxury editorial palette (monochromatic buttons, warm grey labels) in `src/features/chorecue/components/PhotoInput.tsx`
- [X] T025 [US2] Add an editorial empty state message using the serif font with generous spacing when the chore board has no items in `src/features/chorecue/ChoreHomePage.tsx`

**Checkpoint**: The chore board fully embodies the luxury editorial aesthetic.

---

## Phase 5: User Story 3 - Deliberate Interactive States and Motion (Priority: P3)

**Goal**: Make all interactions feel slow, deliberate, and expensive with gold sliding button reveals, underline-only input focus, and cinematic shadow evolution.

**Independent Test**: Interact with primary buttons, inputs, and chore cards. Primary buttons show a gold reveal on interaction. Inputs show bottom-border-only that turns gold on focus. All transitions take at least 500ms.

- [X] T026 [US3] Restyle the Button component with luxury variants (primary: dark bg with gold slide overlay, secondary: transparent with border fill, link: text only), zero radius, uppercase text with wide tracking, and minimum 48pt height in `src/interface/buttons/Button.tsx`
- [X] T027 [US3] Implement the gold sliding reveal animation for the primary button variant using platform-appropriate techniques (CSS absolute overlay with `translateX` on web, Reanimated `withTiming` on native) in `src/interface/buttons/Button.tsx`
- [X] T028 [US3] Restyle Input with bottom-border-only (no surrounding box), transparent background, gold border color on focus, italic serif placeholder text, and 500ms focus transition in `src/interface/forms/Input.tsx`
- [X] T029 [US3] Add subtle shadow evolution on hover/press to chore cards (shadow deepens on interaction, returns on release) using the luxury timing presets in `src/features/chorecue/ChoreHomePage.tsx`
- [X] T030 [P] [US3] Update Pressable with luxury timing for press transitions and gold accent feedback in `src/interface/buttons/Pressable.tsx`
- [X] T031 [US3] Add reduced-motion support that respects `prefers-reduced-motion` on web and `AccessibilityInfo.isReduceMotionEnabled()` on native, preserving color changes while removing transform animations in `src/interface/buttons/Button.tsx`

**Checkpoint**: All interactions feel cinematic and deliberate with gold accent reveals.

---

## Phase 6: User Story 4 - Editorial Typography Hierarchy (Priority: P4)

**Goal**: Refine the dramatic two-font system with extreme type scale contrast, uppercase section labels, mixed italic headline styling, and tiny metadata text.

**Independent Test**: Review all text across the app. Headings use serif, body uses sans-serif, section labels are uppercase with wide tracking, at least one headline has mixed italic styling with gold.

- [X] T032 [US4] Implement a mixed italic headline with gold accent on at least one word in the main chore board heading (e.g., "Your *Household*") using the serif font in `src/features/chorecue/ChoreHomePage.tsx`
- [X] T033 [P] [US4] Style metadata text (due labels, completion timestamps, bump counts) with very small sans-serif in warm grey (`$color8` or muted foreground) across chore cards in `src/features/chorecue/ChoreHomePage.tsx`
- [X] T034 [US4] Ensure button text across the app uses uppercase sans-serif with wide letter spacing (`letterSpacing` at 2-3px) in `src/interface/buttons/Button.tsx`

**Checkpoint**: Typography creates the dramatic editorial contrast between massive headings and tiny labels.

---

## Phase 7: User Story 5 - Luxury Component Library (Priority: P5)

**Goal**: Restyle all remaining reusable components (dialogs, avatars, navigation, auth screens, settings) to match the luxury editorial system.

**Independent Test**: Navigate through all app screens. Every component uses rectangular styling, monochromatic palette, gold accents only for focus/interaction, and maintains 48pt minimum touch targets.

- [X] T035 [P] [US5] Restyle Dialog with rectangular edges (zero radius), warm alabaster background, charcoal text, and luxury button styling in `src/interface/dialogs/Dialog.tsx`
- [X] T036 [P] [US5] Restyle Avatar with rectangular shape (zero radius), removing circular styling, and updating border color to the monochromatic palette in `src/interface/avatars/Avatar.tsx`
- [X] T037 [US5] Restyle MainHeader with the monochromatic palette (warm alabaster background, charcoal text) and updated logo styling in `src/features/app/MainHeader.tsx`
- [X] T038 [US5] Restyle NavigationTabs with gold accent on the active tab indicator, monochromatic inactive state, and sans-serif labels with luxury timing transitions in `src/features/app/NavigationTabs.tsx`
- [X] T039 [P] [US5] Restyle ScrollHeader with the monochromatic palette and updated blur/shadow values in `src/interface/headers/ScrollHeader.tsx`
- [X] T040 [P] [US5] Restyle ThemeSwitch with luxury palette colors and gold accent on hover in `src/interface/theme/ThemeSwitch.tsx`
- [X] T041 [P] [US5] Restyle Toast components with luxury palette and zero radius in `src/interface/toast/Toast.tsx` and `src/interface/toast/Toast.native.tsx`
- [X] T042 [P] [US5] Restyle LoginButton with luxury editorial button styling (dark background, uppercase, wide tracking) in `src/features/auth/ui/LoginButton.tsx`
- [X] T043 [P] [US5] Restyle auth login and signup screens with luxury palette, underline inputs, and editorial typography in `app/(app)/auth/login.tsx` and `app/(app)/auth/login/password.tsx`
- [X] T044 [US5] Restyle settings screen and edit-profile screen with luxury palette, serif headings, and editorial layout in `app/(app)/home/settings/index.tsx` and `app/(app)/home/settings/edit-profile.tsx`

**Checkpoint**: All screens and components present a consistent luxury editorial identity.

---

## Phase 8: Polish & Verification

**Purpose**: Confirm that the redesign preserves all existing functionality and test coverage.

- [X] T045 Run the existing unit test suite (`bun run test:unit`) and fix any style-dependent assertion failures caused by the visual changes
- [X] T046 Run unit coverage (`bun run test:unit:coverage`) and verify the measured threshold remains at or above 80% on lines, functions, statements, and branches
- [ ] T047 Run quickstart verification: confirm all create, complete, bump, edit, and archive flows work identically on both web and iOS simulator against `specs/002-luxury-editorial-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion — applies base tokens globally.
- **User Stories 2-5 (Phases 4-7)**: Depend on User Story 1 completion (base palette, fonts, and radius must be active).
  - User Stories 2, 3, 4, and 5 can then proceed **in parallel** since they target different files.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational (Phase 2) — defines the MVP visual identity.
- **User Story 2 (P2)**: Starts after US1 — relies on base palette and fonts being applied globally.
- **User Story 3 (P3)**: Starts after US1 — relies on base tokens and animation presets. Can run in parallel with US2.
- **User Story 4 (P4)**: Starts after US1 — relies on serif font being loaded. Can run in parallel with US2 and US3.
- **User Story 5 (P5)**: Starts after US1 — relies on base palette being active. Can run in parallel with US2, US3, and US4.

### Within Each User Story

- Theme and font configuration must land before component restyling.
- Shared interface components should be restyled before feature-specific screens that use them.
- The chore board (US2) changes are concentrated in a single file (`ChoreHomePage.tsx`) and should be done sequentially within that story.

### Parallel Opportunities

- T004-T009 are all foundational tasks targeting separate files and can run in parallel.
- After US1 completes, US2 through US5 can all proceed in parallel across different files.
- Within US5, T035-T043 target separate interface component files and can all run in parallel.
- Within US3, T026-T028 are sequential (same Button.tsx and Input.tsx files), but T030 is parallel (different file).

---

## Parallel Example: Foundational Phase

```text
Task: "T004 [P] Register Playfair Display and Inter font families in src/tamagui/fonts.ts"
Task: "T005 [P] Add Google Fonts @import to app/root.css"
Task: "T006 [P] Create native font loading hook in src/features/fonts/useFonts.native.ts"
Task: "T007 [P] Create web font loading stub in src/features/fonts/useFonts.ts"
Task: "T008 [P] Add luxury animation timing presets to src/tamagui/animationsRoot.ts"
Task: "T009 [P] Add luxury animation timing presets to src/tamagui/animationsRoot.native.ts"
```

## Parallel Example: User Stories 2-5 After US1

```text
Task: "T019 [US2] Remove colored Theme wrappers from chore board sections in ChoreHomePage.tsx"
Task: "T026 [US3] Restyle Button with luxury variants and gold slide overlay in Button.tsx"
Task: "T032 [US4] Implement mixed italic headline with gold accent in ChoreHomePage.tsx"
Task: "T035 [P] [US5] Restyle Dialog with rectangular edges in Dialog.tsx"
Task: "T036 [P] [US5] Restyle Avatar with rectangular shape in Avatar.tsx"
```

Note: US2 and US4 share `ChoreHomePage.tsx` — if run in parallel, coordinate to avoid file conflicts. US3 and US5 target different interface component files and can fully parallelize.

## Parallel Example: Component Library (US5)

```text
Task: "T035 [P] [US5] Restyle Dialog in src/interface/dialogs/Dialog.tsx"
Task: "T036 [P] [US5] Restyle Avatar in src/interface/avatars/Avatar.tsx"
Task: "T039 [P] [US5] Restyle ScrollHeader in src/interface/headers/ScrollHeader.tsx"
Task: "T040 [P] [US5] Restyle ThemeSwitch in src/interface/theme/ThemeSwitch.tsx"
Task: "T041 [P] [US5] Restyle Toast in src/interface/toast/Toast.tsx"
Task: "T042 [P] [US5] Restyle LoginButton in src/features/auth/ui/LoginButton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational token infrastructure.
3. Complete Phase 3 for User Story 1.
4. Validate the base luxury identity is visible across all screens.

### Incremental Delivery

1. Deliver US1 for the foundational luxury identity (palette, fonts, radius).
2. Add US2 to transform the primary chore board experience.
3. Add US3 to bring cinematic motion and gold accent interactions.
4. Add US4 to refine editorial typography with mixed italic headings and extreme type scale.
5. Add US5 to complete the luxury feel across all remaining components and screens.
6. Run Phase 8 polish to verify no functional regressions.

### Parallel Team Strategy

1. One stream completes Setup + Foundational + US1 as the base layer.
2. After US1, up to four streams can work in parallel:
   - Stream A: US2 (Chore Board)
   - Stream B: US3 (Motion & Interactions)
   - Stream C: US4 (Typography) — coordinate with Stream A on `ChoreHomePage.tsx`
   - Stream D: US5 (Component Library)
3. Polish runs after all stories merge.

## Notes

- Tasks follow the required checkbox, ID, optional parallel marker, optional story label, and exact path format.
- The suggested MVP scope is Phase 3 (User Story 1) for the base luxury editorial identity.
- US2 and US4 share `ChoreHomePage.tsx` — coordinate if parallelizing to avoid conflicts.
- Total tasks: 47
