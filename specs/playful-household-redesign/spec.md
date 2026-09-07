# Feature Specification: Playful Household Redesign

**Feature Branch**: `build/playful-household-redesign-20260407`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: Replace luxury editorial theme with warm, approachable design centered on people and rewarding interactions. 22 FRs covering theme, state colors, member identity, micro-interactions, component restyling, and platform parity.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Glanceable Chore Status (Priority: P1)

A user opens the app for their daily 5-second check-in. Without reading any text, they can instantly see which chores are overdue (coral/red), which are due soon (amber/yellow), which are completed (green), and which are upcoming (gray). The color-coded visual system replaces the need to parse text to understand chore state.

**Why this priority**: The core value proposition of ChoreCue is fast visibility into what needs doing. If chore states are not instantly distinguishable, the redesign fails its primary goal. This is the most impactful change for daily usage.

**Independent Test**: View the chore board with chores in all four states (overdue, due soon, done, upcoming). Each state should be visually distinguishable by color alone without reading text labels.

**Acceptance Scenarios**:

1. **Given** a chore board with chores in all four states, **When** a user views the board, **Then** each chore card displays a visible color indicator (border, tint, or badge) matching its state: coral for overdue, amber for due soon, green for done, gray for upcoming.
2. **Given** both light and dark mode, **When** viewing chore state colors, **Then** all four state colors meet WCAG 2.1 AA contrast requirements against the respective background.
3. **Given** a chore that transitions from "due soon" to "overdue," **When** the board refreshes, **Then** the card's color indicator updates to reflect the new state.

---

### User Story 2 - Satisfying Chore Completion (Priority: P1)

A user taps the complete button on a chore card. A brief, satisfying animation plays (300-500ms) confirming the action. The animation does not block further interaction — the user can immediately tap another chore or navigate away. Completing chores feels rewarding rather than silent.

**Why this priority**: Chore completion is the most frequent user action. Adding a moment of satisfaction directly reinforces the habit loop that ChoreCue depends on. This is the "slightly playful" principle from the product PRD.

**Independent Test**: Complete a chore and observe that a visible animation plays within 500ms. Immediately tap another element to confirm the animation is non-blocking.

**Acceptance Scenarios**:

1. **Given** a chore marked as due, **When** the user completes it, **Then** a completion animation plays for 300-500ms (e.g., checkmark scale, card shrink, or confetti burst).
2. **Given** a completion animation is playing, **When** the user taps another chore or navigates, **Then** the interaction is not blocked by the animation.
3. **Given** the app running on web, **When** completing a chore, **Then** the animation uses CSS-based transitions. **Given** the app running on iOS, **When** completing a chore, **Then** the animation uses Reanimated.

---

### User Story 3 - Member Identity on Chore Cards (Priority: P2)

A user sees their partner's avatar prominently displayed next to chores assigned to them. Each household member has a distinct accent color that appears as a ring or tint on their avatar and optionally on their assigned chores. The household feels present — users know at a glance who should handle what.

**Why this priority**: ChoreCue is inherently social. Making member identity visible transforms the board from a task list into a shared household view. This supports the "polite accountability" principle without adding features.

**Independent Test**: View the chore board with chores assigned to different household members. Each member's avatar is visible on their chore cards, and each member has a distinct accent color.

**Acceptance Scenarios**:

1. **Given** a chore assigned to a household member, **When** viewing the chore card, **Then** the member's avatar (at least 32px) is displayed prominently on the card.
2. **Given** two household members, **When** viewing their avatars anywhere in the app, **Then** each has a distinct accent color from the curated palette of 6 harmonious colors.
3. **Given** the app header/navigation area, **When** viewing any screen, **Then** household member avatars are visible, making the household feel present.

---

### User Story 4 - Warm, Approachable Visual Language (Priority: P2)

A user opens the app and it feels warm, casual, and approachable — not like a magazine or corporate tool. All text uses Inter (a clean sans-serif), interactive elements have rounded corners (8-12px), and the palette uses soft whites and warm grays rather than pure white/black. The dark mode variant uses deep warm grays instead of pure black.

**Why this priority**: The visual language sets the emotional tone for every interaction. While not functionally critical, it directly addresses user feedback that the editorial theme feels impersonal for a household app.

**Independent Test**: Open the app in both light and dark mode. Verify Inter is the sole typeface, all interactive elements have rounded corners, and the palette uses warm tones (no pure white or pure black backgrounds).

**Acceptance Scenarios**:

1. **Given** any screen in the app, **When** inspecting text rendering, **Then** Inter is the only typeface used — no Playfair Display anywhere.
2. **Given** any interactive element (button, card, input, modal), **When** viewing it, **Then** it has rounded corners (8-12px border-radius).
3. **Given** light mode, **When** viewing the app, **Then** the background is a soft white (not pure #FFFFFF) with warm gray secondary surfaces.
4. **Given** dark mode, **When** viewing the app, **Then** the background is a deep warm gray (not pure #000000).

---

### User Story 5 - Press Feedback on Interactive Elements (Priority: P3)

A user taps any interactive element (button, chore card, navigation tab) and receives subtle visual feedback — a brief scale-down or opacity change. This makes the app feel responsive and tactile.

**Why this priority**: Tap feedback is a polish detail that reinforces the "playful" feel. It is lower priority because the app functions without it, but it contributes meaningfully to perceived quality.

**Independent Test**: Tap any button, chore card, or navigation tab and observe that a brief visual response occurs on press.

**Acceptance Scenarios**:

1. **Given** any button in the app, **When** the user presses it, **Then** a subtle scale-down or opacity change is visible during the press state.
2. **Given** a chore card, **When** the user presses it, **Then** a brief press feedback animation plays.
3. **Given** a navigation tab, **When** the user taps it, **Then** it responds with a press animation using a rounded active indicator (not an editorial underline).

---

### User Story 6 - Consistent Cross-Platform Experience (Priority: P1)

A user switches between the web app and the iOS app. Both render the same visual theme — same colors, typography, rounded shapes, and animations. Font loading works on both platforms (CSS @font-face on web, useFonts on native). Animations use the correct platform-specific engine.

**Why this priority**: Cross-platform consistency is a product requirement from the parent PRD. A redesign that breaks one platform undermines the entire effort.

**Independent Test**: Open the same screen on web and iOS side by side. Verify visual consistency in colors, typography, shapes, and animation behavior.

**Acceptance Scenarios**:

1. **Given** the web app and iOS app, **When** viewing any screen, **Then** the visual theme (colors, typography, rounded shapes) is consistent across both platforms.
2. **Given** the web app, **When** text renders, **Then** Inter is loaded via CSS @font-face. **Given** the iOS app, **When** text renders, **Then** Inter is loaded via useFonts.native.ts.
3. **Given** a completion animation on web, **When** it plays, **Then** it uses CSS animation drivers. **Given** a completion animation on iOS, **When** it plays, **Then** it uses Reanimated animation drivers.

---

### Edge Cases

- What happens when a household has only one member? Accent color assignment should still work; the single member gets the first color from the palette.
- What happens when a household has the maximum 6 members? All 6 curated accent colors are assigned with no duplicates.
- What happens when a member has no avatar image? The fallback icon (UserIcon) is displayed with the member's accent color as background or ring.
- What happens when chore state colors overlap with member accent colors? The state color system and member accent colors use distinct, non-conflicting palettes.
- How do chore state colors appear for colorblind users? State is also conveyed through position, text labels, and iconography — color is an enhancement, not the sole indicator.

## Requirements *(mandatory)*

### Functional Requirements

**Theme and Visual Language**

- **FR-001**: The app MUST replace the luxury editorial theme with a new playful household theme. The new theme defines all design tokens: colors, spacing, radii, shadows, and typography.
- **FR-002**: The app MUST use Inter as the sole typeface across all UI elements — headings, body text, labels, and buttons. Playfair Display MUST be removed from the font stack entirely.
- **FR-003**: All interactive elements (cards, buttons, inputs, modals, avatars) MUST have rounded corners with 8-12px border-radius. No sharp rectangular edges.
- **FR-004**: The app MUST use a warm base palette: soft white background (not pure white), warm gray for secondary surfaces, charcoal for primary text. The dark mode variant MUST use deep warm grays (not pure black).
- **FR-005**: The existing dark mode toggle behavior MUST be preserved. The new theme MUST define both light and dark variants.

**Color-Coded Chore States**

- **FR-006**: The theme MUST define a functional color system for chore states: muted red/coral for overdue, warm amber/yellow for due soon (within 24 hours), soft green for completed, neutral gray for upcoming/not yet due.
- **FR-007**: Chore state colors MUST be applied to chore cards as a visible indicator (left border, background tint, or badge) so state is perceivable without reading text.
- **FR-008**: Chore state colors MUST meet WCAG 2.1 AA contrast requirements against both light and dark theme backgrounds.

**Member Identity**

- **FR-009**: Member avatars MUST be displayed prominently on chore cards next to the assigned person. Avatars MUST be at least 32px and use the existing Avatar component.
- **FR-010**: Each household member MUST be assigned a distinct accent color from a curated palette of 6 harmonious colors. This color MUST appear as a subtle tint or ring on their avatar and optionally on chores assigned to them.
- **FR-011**: Member avatars MUST be shown in the header/navigation area so the household feels present throughout the app.

**Micro-Interactions**

- **FR-012**: A completion animation MUST play when a user marks a chore as done. The animation MUST be 300-500ms, visually satisfying (e.g., checkmark scale + fade, card shrink, confetti burst), and non-blocking.
- **FR-013**: Animations MUST use CSS animations on web and Reanimated on native, matching the existing platform-specific animation strategy.
- **FR-014**: All interactive elements (buttons, chore cards, navigation tabs) MUST have a subtle press/tap feedback animation — a brief scale-down or opacity change on press.

**Component Restyling**

- **FR-015**: All components in the shared interface library (Button, Input, Avatar, ThemeSwitch, StepPageLayout, and others) MUST be restyled to match the playful household theme: rounded shapes, Inter typography, warm palette.
- **FR-016**: The main header and navigation tabs MUST be restyled with the new theme. Navigation MUST use rounded active indicators rather than editorial underlines.
- **FR-017**: The chore board MUST be restyled — chore cards MUST be rounded, show state color, display assignee avatar, and have the completion micro-interaction.
- **FR-018**: The members page MUST be restyled with larger avatar presence and member accent colors.
- **FR-019**: Auth flows (login, signup) MUST be restyled to match the playful theme — welcoming, simple, rounded inputs and buttons.

**Platform Parity**

- **FR-020**: All visual changes MUST render correctly on both web (Chromium, Safari) and iOS (Expo/React Native).
- **FR-021**: Font loading MUST work on both platforms — Inter via useFonts on native and CSS @font-face on web.
- **FR-022**: Animations MUST use the correct platform-specific engine (CSS on web, Reanimated on native) via the existing Tamagui animation driver configuration.

### Key Entities

- **Playful Household Theme**: The complete design token set replacing the luxury editorial theme. Defines color scales, semantic tokens, spacing, radii, shadows, and typography for both light and dark modes.
- **Chore State Color Map**: A mapping of four chore states (overdue, due-soon, done, upcoming) to four distinct, accessible colors used as visual indicators on chore cards.
- **Member Accent Color Palette**: A set of 6 curated, harmonious colors assigned to household members for identity differentiation. Each member gets a unique color.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing unit tests pass with 80%+ coverage maintained after the redesign.
- **SC-002**: All existing Playwright integration tests pass without modification to test assertions.
- **SC-003**: Chore state (overdue, due soon, done, upcoming) is visually distinguishable without reading text, verified by visual inspection of the chore board.
- **SC-004**: Chore completion triggers a visible animation on both web and iOS that lasts 300-500ms.
- **SC-005**: Member avatars (32px+) are visible on chore cards and in the header area.
- **SC-006**: All interactive elements have rounded corners (8-12px) — no sharp rectangular edges remain.
- **SC-007**: Inter is the only rendered typeface across all screens — no Playfair Display visible anywhere.
- **SC-008**: The app starts and all screens render on web with `bun dev`.
- **SC-009**: The app builds and runs on iOS simulator with `bun run ios` with the new theme applied.
- **SC-010**: Dark mode toggle works and the dark variant uses warm tones (no pure black backgrounds).

## Assumptions

- The existing Tamagui theming system supports the full scope of visual token changes without framework-level modifications.
- Inter is already loaded and available on both web and native platforms (confirmed in codebase).
- The existing Avatar component can be extended to accept an accent color prop with minimal changes.
- Completion animations can be implemented within the existing animation driver setup (CSS on web, Reanimated on native) without adding new dependencies.
- 6 curated accent colors are sufficient for the maximum supported household size (2-6 members).
- This is a visual-only redesign — no changes to database schema, migrations, Zero sync, server actions, or auth flows.
- Member accent colors are auto-assigned (not user-selectable) based on a deterministic algorithm (e.g., member creation order or member ID hash).
- The completion animation style is a single, non-configurable default (e.g., checkmark scale + fade) — configurability is deferred to future scope.
- The bump action does not receive a micro-interaction in this redesign — it is noted as future scope.
