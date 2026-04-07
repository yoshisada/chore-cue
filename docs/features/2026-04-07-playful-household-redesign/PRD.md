# Feature PRD: Playful Household Redesign

## Parent Product

[ChoreCue Product PRD](../../PRD.md) — lightweight shared household chore tracker for couples and roommates.

## Feature Overview

Replace the luxury editorial design system with a "playful household" theme that prioritizes scannability, personality, and rewarding interactions. The app should feel warm, approachable, and fast to use — designed for the 5-second daily check-in, not for reading. Member identity becomes a first-class visual element, chore states are instantly distinguishable by color, and completing a chore feels satisfying through micro-interactions.

## Problem / Motivation

The current luxury editorial theme (Playfair Display serif headings, monochromatic palette, rectangular elements, gold accents) is visually polished but creates friction for ChoreCue's actual use case:

- **Serif headings slow scanning.** Users open the app for seconds at a time to check what's due. Playfair Display is elegant but harder to parse at small sizes than a clean sans-serif.
- **Monochromatic palette hides chore state.** Overdue, due soon, done, and upcoming chores all look similar. Users have to read text to understand status instead of seeing it at a glance.
- **Editorial aesthetic feels impersonal.** ChoreCue is inherently social (2-6 people sharing a home). The magazine-style layout doesn't reflect who lives there or make the experience feel shared.
- **No reward feedback.** Completing a chore is the most frequent user action, but the current UI treats it as a silent state change. There's no moment of satisfaction that reinforces the habit.

This redesign exists because the product's UX principles (from the product PRD) explicitly call for "fast to understand," "low friction," "polite by design," and "slightly playful" — the current editorial theme optimizes for aesthetics over these principles.

## Goals

- Make chore status visible at a glance through a functional color system.
- Center member identity in the UI with prominent avatars and per-person color coding.
- Create satisfying micro-interactions for chore completion that reinforce daily habits.
- Use a single sans-serif typeface (Inter) for maximum readability at all sizes.
- Adopt rounded, softer shapes that feel approachable rather than formal.
- Maintain full feature parity — every screen, flow, and interaction works identically.
- Preserve cross-platform consistency (web + iOS).

## Non-Goals

- Adding new screens, features, or user flows.
- Changing the data model, database schema, or sync behavior.
- Modifying auth flows or backend logic.
- Building a design system configurator or theme switcher (dark mode toggle is preserved, not expanded).
- Adding illustration, custom iconography, or branded assets beyond what ships with the icon library.
- Performance optimization (unless required for animation smoothness).

## Target Users

Same as the parent product: couples and small households using ChoreCue. This redesign changes how the app looks and feels, not what it does.

## Core User Stories

1. **As a user**, I want to open the app and instantly see which chores are overdue, due soon, and done — without reading text — so I can decide what to do in seconds.
2. **As a user**, I want to see my partner's avatar next to the chores they're responsible for so I know at a glance who should handle what.
3. **As a user**, I want completing a chore to feel satisfying (a brief animation, a visual change) so I'm motivated to keep the habit going.
4. **As a user**, I want the app to feel warm and casual — not like a magazine or a corporate tool — so using it doesn't feel like work.

## Functional Requirements

### Theme & Visual Language

- **FR-001**: Replace the luxury editorial theme (`src/tamagui/themes/luxuryEditorial.ts`) with a new playful household theme. The new theme defines all Tamagui design tokens: colors, spacing, radii, shadows, and typography.
- **FR-002**: Use Inter as the sole typeface across all UI — headings, body, labels, buttons. Remove Playfair Display from the font stack entirely.
- **FR-003**: Apply rounded corners (8-12px border-radius) to all interactive elements: cards, buttons, inputs, modals, avatars. No sharp rectangular edges.
- **FR-004**: Define a warm, light base palette: soft white background (not pure white), warm gray for secondary surfaces, charcoal for primary text. Dark mode variant uses deep warm grays (not pure black).
- **FR-005**: Preserve the existing dark mode toggle behavior. The new theme must define both light and dark variants.

### Color-Coded Chore States

- **FR-006**: Define a functional color system for chore states: muted red/coral for overdue, warm amber/yellow for due soon (within 24 hours), soft green for completed, neutral gray for upcoming/not yet due.
- **FR-007**: Apply chore state colors to chore cards as a visible indicator (left border, background tint, or badge) so state is perceivable without reading text.
- **FR-008**: Ensure chore state colors meet WCAG 2.1 AA contrast requirements against both light and dark theme backgrounds.

### Member Identity

- **FR-009**: Display member avatars prominently on chore cards next to the assigned person. Avatars should be at least 32px and use the existing `Avatar` component from `src/interface/avatars/Avatar.tsx`.
- **FR-010**: Assign each household member a distinct accent color (from a curated palette of 6 harmonious colors). This color appears as a subtle tint or ring on their avatar and optionally on chores assigned to them.
- **FR-011**: Show member avatars in the header/navigation area so the household feels present throughout the app.

### Micro-Interactions

- **FR-012**: Add a completion animation when a user marks a chore as done. The animation should be brief (300-500ms), satisfying (e.g., checkmark scale + fade, card shrink, confetti burst), and non-blocking (the user can continue interacting immediately).
- **FR-013**: Use CSS animations on web (`@tamagui/animations-css`) and Reanimated on native (`@tamagui/animations-reanimated`) for all micro-interactions, matching the existing platform-specific animation strategy.
- **FR-014**: Add a subtle press/tap feedback animation to all interactive elements (buttons, chore cards, navigation tabs) — a brief scale-down or opacity change on press.

### Component Restyling

- **FR-015**: Restyle all components in `src/interface/` (Button, Input, Avatar, ThemeSwitch, StepPageLayout, and any others) to match the playful household theme: rounded shapes, Inter typography, warm palette.
- **FR-016**: Restyle the main header (`src/features/app/MainHeader.tsx`) and navigation tabs (`src/features/app/NavigationTabs.tsx`) with the new theme. Navigation should feel tab-bar-like with rounded active indicators rather than editorial underlines.
- **FR-017**: Restyle the chore board (`src/features/chorecue/ChoreHomePage.tsx`) — chore cards should be rounded, show state color, display assignee avatar, and have the completion micro-interaction.
- **FR-018**: Restyle the members page (`src/features/members/MembersPage.tsx`) with larger avatar presence and member accent colors.
- **FR-019**: Restyle auth flows (login, signup) to match the playful theme — welcoming, simple, rounded inputs and buttons.

### Platform Parity

- **FR-020**: All visual changes must render correctly on both web (Chromium, Safari) and iOS (Expo/React Native).
- **FR-021**: Font loading must work on both platforms — Inter via `useFonts.native.ts` on native and CSS `@font-face` on web.
- **FR-022**: Animations must use the correct platform-specific engine (CSS on web, Reanimated on native) via existing Tamagui animation driver configuration.

## Absolute Musts

1. **Full feature parity** — every screen, flow, and interaction works identically after the redesign. This is a reskin, not a rebuild.
2. **Cross-platform** — web and iOS must both render the new theme correctly.
3. **Accessible colors** — chore state colors must meet WCAG 2.1 AA contrast minimums.
4. **No data changes** — zero modifications to database schema, migrations, Zero sync, or server actions.

## Tech Stack

Inherited from product PRD — no additions or overrides:

- TypeScript 5.9 (strict mode), React 19 with React Compiler
- Tamagui 2.0.0-rc.17, One (vxrn 1.9.9), Expo
- React Native Reanimated 4.1.6, @tamagui/animations-css (web), @tamagui/animations-reanimated (native)
- PostgreSQL 16 + Rocicorp Zero + Drizzle ORM
- Better Auth
- Bun 1.2.22

No new dependencies required. The existing Tamagui theming system and animation drivers support everything in this PRD.

## Impact on Existing Features

- **Chore board**: Cards restyled with state colors, assignee avatars, completion animation. Same data, same interactions.
- **Members page**: Larger avatars, member accent colors. Same data.
- **Settings**: Theme switch preserved, settings layout restyled. Same functionality.
- **Auth flows**: Login/signup restyled. Same auth behavior.
- **Header & navigation**: Restyled with rounded indicators. Same routing.
- **Dark mode**: Preserved with new dark palette variant.

**Breaking changes**: None user-facing. Developer-facing: `luxuryEditorial.ts` is replaced with a new theme file. Components in `src/interface/` receive updated styling props.

## Success Criteria

1. All existing unit tests pass with 80%+ coverage maintained.
2. All existing Playwright integration tests pass.
3. `bun dev` starts and all screens render on web with the new theme applied.
4. `bun run ios` builds and runs on iOS simulator with the new theme.
5. Chore state (overdue, due soon, done, upcoming) is visually distinguishable without reading text — verified by screenshot comparison.
6. Chore completion triggers a visible animation on both web and iOS.
7. Member avatars are visible on chore cards and in the header.
8. All interactive elements have rounded corners (no sharp rectangles).
9. Inter is the only rendered typeface — no Playfair Display anywhere in the UI.

## Risks / Unknowns

- **Tamagui theme token migration**: Changing the full token set may surface components that hardcode specific token values rather than using semantic tokens. These need to be found and updated.
- **Animation performance on low-end devices**: Completion animations should be tested on older iOS devices to ensure they don't cause jank.
- **Member color assignment**: With 6 accent colors and potentially 2-6 members, the color assignment algorithm needs to handle edge cases (single user, max users, same initials).
- **Dark mode contrast**: The functional color system (red, amber, green) needs to work in both light and dark modes without losing contrast or meaning.

## Assumptions

- The existing Tamagui theming system supports the full scope of visual changes without requiring framework-level modifications.
- Inter is already loaded on both platforms (it is — confirmed in current codebase).
- The existing `Avatar` component can accept an accent color prop or be extended minimally.
- Completion animations can be implemented within the existing animation driver setup (CSS on web, Reanimated on native) without new dependencies.
- 6 curated accent colors are sufficient for the maximum household size.

## Open Questions

- Should the completion animation be configurable (e.g., user can choose between checkmark, confetti, or simple fade)?
- Should member accent colors be user-selectable or auto-assigned?
- Should the bump action also have a micro-interaction (e.g., a gentle nudge animation on the recipient's chore card)?
