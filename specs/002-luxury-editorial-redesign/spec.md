# Feature Specification: Luxury Editorial Redesign

**Feature Branch**: `002-luxury-editorial-redesign`
**Created**: 2026-03-18
**Status**: Draft
**Input**: User description: "Apply Luxury/Editorial design system to ChoreCue UI — editorial typography, monochromatic palette with gold accents, cinematic motion, asymmetric layouts, and luxury component styling across all screens"

## User Scenarios & Testing

### User Story 1 - Refined Visual Identity Across All Screens (Priority: P1)

When a household member opens ChoreCue on any device, the app presents a cohesive luxury editorial aesthetic: warm monochromatic palette, editorial serif and sans-serif font pairing, generous whitespace, and sharp rectangular elements. The experience feels premium, curated, and intentional — like an expensive magazine rather than a generic utility app.

**Why this priority**: Visual identity is the foundation of the redesign. Every other story builds on top of these base tokens (colors, fonts, spacing, radii, shadows). Without this layer, no other story can achieve the luxury feel.

**Independent Test**: Open the app on both web and mobile. Every screen uses the warm alabaster background, charcoal foreground text, editorial serif headings, clean sans-serif body text, and zero rounded corners. No pure black or pure white appears anywhere in the interface.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** any screen renders, **Then** the background uses a warm off-white tone (not pure white), all primary text uses a soft charcoal (not pure black), and secondary text uses a warm grey.
2. **Given** a user views any heading, **When** the heading renders, **Then** it uses a high-contrast serif typeface with tight line height, while body text uses a clean sans-serif with relaxed line height.
3. **Given** a user views any interactive element (button, card, input), **When** the element renders, **Then** it has perfectly rectangular edges with no rounded corners.
4. **Given** a user views the app on a small screen, **When** the layout adapts, **Then** typography scales proportionally, spacing reduces gracefully, and the core luxury aesthetic is preserved — not replaced with a generic mobile layout.

---

### User Story 2 - Luxury Chore Board Experience (Priority: P2)

The main chore board — the most-used screen — transforms into an editorial layout. Chore sections (overdue, due, upcoming) are separated by clean single-line borders rather than colored theme blocks. Chore cards are defined by architectural top borders, generous padding, and subtle depth. The overall hierarchy creates a clear visual rhythm using dramatic type scale contrast between section labels and card content.

**Why this priority**: The chore board is where users spend most of their time. It must embody the luxury aesthetic most strongly to justify the redesign.

**Independent Test**: Open the chore board with chores in all three due states. Sections are clearly differentiated by typographic hierarchy and thin border dividers rather than colored backgrounds. Cards feel spacious and elevated. The layout uses intentional asymmetry where appropriate.

**Acceptance Scenarios**:

1. **Given** a user views the chore board, **When** sections render, **Then** each section is introduced by a small uppercase label with wide letter spacing, followed by chore cards separated by thin single-line borders.
2. **Given** a chore card displays, **When** the user views it, **Then** the card uses generous internal spacing, a thin architectural top border, and presents title, category, assignee, and due information in a clear editorial hierarchy.
3. **Given** a user views overdue chores, **When** the section renders, **Then** urgency is communicated through typographic weight and a gold accent on the section marker — not through a colored background block.
4. **Given** a user views the chore board on mobile, **When** the layout adapts, **Then** cards maintain generous padding (reduced proportionally), section labels remain uppercase with wide tracking, and the editorial feel is preserved.

---

### User Story 3 - Deliberate Interactive States and Motion (Priority: P3)

All interactions feel slow, deliberate, and expensive. Buttons animate with a sliding gold reveal on press/hover. Inputs use underline-only styling with a gold focus accent. Transitions between states take longer than typical apps — creating a cinematic quality that rewards patience and conveys quality.

**Why this priority**: Motion and interaction design differentiate a luxury feel from a merely "clean" UI. Without cinematic timing and gold accents, the redesign looks flat instead of premium.

**Independent Test**: Interact with primary buttons, text inputs, and chore cards. Primary buttons reveal a gold layer on interaction. Inputs show only a bottom border that turns gold on focus. All transitions feel unhurried (minimum half a second for simple interactions, longer for visual reveals).

**Acceptance Scenarios**:

1. **Given** a user interacts with a primary button, **When** the interaction begins, **Then** a metallic gold layer slides in from one edge, text remains visible above the gold, and the full transition completes over at least 500 milliseconds.
2. **Given** a secondary button appears, **When** the user interacts with it, **Then** the background fills to dark with text inverting to light, transitioning smoothly over at least 500 milliseconds.
3. **Given** a user focuses a text input, **When** the input receives focus, **Then** only the bottom border is visible (no surrounding box), and the border transitions to gold on focus.
4. **Given** a user interacts with a chore card, **When** hover or press occurs, **Then** the card gains subtle additional depth through a soft shadow evolution — never a harsh drop shadow.
5. **Given** a user has reduced-motion preferences enabled, **When** animations would normally play, **Then** transitions complete instantly or use minimal motion while preserving color changes.

---

### User Story 4 - Editorial Typography Hierarchy (Priority: P4)

The app uses a dramatic two-font system: a high-contrast serif for headlines, quotes, and emphasis, paired with a humanist sans-serif for body text, labels, and UI elements. Uppercase labels with wide letter spacing introduce sections. Mixed italic styling within headlines adds editorial personality. The type scale spans from massive section headings to tiny metadata labels, creating the extreme contrast that defines luxury editorial design.

**Why this priority**: Typography is described as the single most critical element of the luxury editorial style. However, it can be refined iteratively after the base palette and layout are in place.

**Independent Test**: Review all text across the app. Headlines use the serif typeface. Body text, labels, and buttons use the sans-serif. Section labels are uppercase with visibly wider letter spacing. At least one headline uses mixed regular and italic styling for editorial personality.

**Acceptance Scenarios**:

1. **Given** a section heading renders, **When** the user reads it, **Then** it uses the serif typeface with tight line height and large scale relative to surrounding content.
2. **Given** a body paragraph, label, or button renders, **When** the user reads it, **Then** it uses the sans-serif typeface with comfortable line height and default letter spacing.
3. **Given** a section label renders (like "Overdue", "Due Soon", "Upcoming"), **When** the user views it, **Then** it is uppercase, uses a small font size, and has visibly wider letter spacing than body text.
4. **Given** the main screen heading renders, **When** the user views it, **Then** at least one word uses italic serif styling with a gold accent color, creating editorial personality.
5. **Given** metadata text renders (timestamps, counts), **When** the user views it, **Then** it uses a very small size in the sans-serif typeface with warm grey coloring.

---

### User Story 5 - Luxury Component Library (Priority: P5)

All reusable UI components — buttons, inputs, cards, dialogs, avatars, and navigation elements — are restyled to match the luxury editorial system. Components feel consistent with each other, use the monochromatic palette with gold accents sparingly, and maintain accessibility standards for contrast and touch targets.

**Why this priority**: Component consistency ensures the luxury feel is maintained as the app grows. This story captures the long tail of elements beyond the primary chore board.

**Independent Test**: Navigate through all app screens including settings, auth flows, dialogs, and navigation. Every component uses rectangular styling, the monochromatic palette, gold accents only for focus and interaction states, and maintains minimum touch target sizes.

**Acceptance Scenarios**:

1. **Given** a dialog appears, **When** the user views it, **Then** it has rectangular edges, uses the warm background color, and presents actions with the luxury button styling.
2. **Given** the navigation header renders, **When** the user views it, **Then** it uses the monochromatic palette, displays navigation items with the sans-serif typeface, and shows gold accents only on the active or hovered item.
3. **Given** a user avatar renders, **When** it appears, **Then** it has a rectangular shape (not circular) consistent with the zero-radius design principle.
4. **Given** any interactive element renders, **When** the user measures it, **Then** the minimum touch target is at least 48 points in height for adequate accessibility.
5. **Given** any text renders against its background, **When** contrast is measured, **Then** primary text achieves at least WCAG AA contrast ratio and secondary text maintains at least 4.5:1 contrast.

---

### Edge Cases

- What happens when the app transitions between light and dark modes? Dark mode uses the inverted palette (dark charcoal background, warm off-white text) while maintaining the same gold accent and typographic hierarchy.
- What happens when very long chore titles render in the editorial layout? Titles truncate gracefully with ellipsis rather than breaking the card layout or reducing font size below readable thresholds.
- What happens on devices that cannot load the custom serif font? The app falls back to a system serif (like Georgia or Times New Roman) that preserves the high-contrast serif character, rather than falling back to a sans-serif.
- What happens when a screen has no chores to display? Empty states use the serif typeface for a short editorial message with generous spacing, maintaining the luxury feel rather than showing a generic "no items" placeholder.
- What happens with right-to-left languages? The asymmetric layout principles mirror appropriately while maintaining the editorial spacing and typographic rules.

## Requirements

### Functional Requirements

- **FR-001**: The app MUST use a warm off-white background and soft charcoal foreground across all screens, never pure white or pure black.
- **FR-002**: The app MUST use a two-font typographic system: a high-contrast serif for headings and emphasis, and a humanist sans-serif for body text, labels, and UI elements.
- **FR-003**: All interactive elements (buttons, cards, inputs, containers) MUST have zero border radius — perfectly rectangular with no rounded corners.
- **FR-004**: The app MUST use a metallic gold as the sole accent color, reserved for hover states, focus indicators, interaction reveals, and small decorative emphasis — never as a large-area fill.
- **FR-005**: Primary buttons MUST animate with a gold sliding reveal on interaction, completing over at least 500 milliseconds.
- **FR-006**: Text inputs MUST display only a bottom border (no surrounding box) that transitions to gold on focus.
- **FR-007**: Section labels (overdue, due, upcoming) MUST render as uppercase text with wide letter spacing.
- **FR-008**: The chore board MUST separate sections with thin single-line borders and typographic hierarchy rather than colored background blocks.
- **FR-009**: All motion and transitions MUST use slow, deliberate timing: at least 500 milliseconds for simple interactions and at least 700 milliseconds for color or background transitions.
- **FR-010**: The app MUST respect the user's reduced-motion system preference by completing transitions instantly or with minimal motion while preserving color changes.
- **FR-011**: The app MUST support a dark mode that inverts the palette (dark charcoal background, warm off-white text) while maintaining the same gold accent and typographic hierarchy.
- **FR-012**: All primary text MUST achieve at least WCAG AA contrast ratio (4.5:1) against its background, and all secondary text MUST maintain at least 4.5:1 contrast.
- **FR-013**: All interactive touch targets MUST maintain a minimum height of 48 points for accessibility.
- **FR-014**: The serif and sans-serif fonts MUST load on both web and native platforms, with graceful system-font fallbacks that preserve the serif vs. sans-serif distinction.
- **FR-015**: Empty states MUST use the serif typeface for messaging with generous spacing, maintaining the luxury editorial feel.
- **FR-016**: Cards and containers MUST use thin single-line top borders for definition rather than full surrounding borders.
- **FR-017**: Shadows MUST be subtle and soft (low opacity) to create layered depth — never harsh or prominent drop shadows.
- **FR-018**: The layout MUST use generous vertical and horizontal spacing between sections and components, exceeding typical app spacing norms.

### Key Entities

- **Design Token Set**: The centralized collection of color values, font families, spacing scales, shadow definitions, border widths, and animation durations that define the luxury editorial style. Applied consistently across all platforms.
- **Component Variant**: A styled variation of a reusable UI element (button, input, card, dialog) that conforms to the luxury editorial system. Each variant specifies its visual states (default, hover, focus, pressed, disabled).

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of screens use the warm monochromatic palette — zero instances of pure black (#000000) or pure white (#FFFFFF) in rendered UI elements.
- **SC-002**: 100% of interactive elements have zero border radius — no rounded corners anywhere in the interface.
- **SC-003**: All primary text achieves at least WCAG AA contrast ratio (4.5:1) against its background across both light and dark modes.
- **SC-004**: All interactive touch targets are at least 48 points in height.
- **SC-005**: All simple interaction transitions complete in at least 500 milliseconds (when reduced-motion is not enabled).
- **SC-006**: The serif heading font loads successfully on both web and native, with system serif fallback verified to preserve the two-font hierarchy.
- **SC-007**: Users can identify the app's visual style as "premium" or "editorial" rather than "generic" or "utilitarian" in qualitative feedback — targeting at least 4 out of 5 surveyed users describing the aesthetic positively.
- **SC-008**: The redesign does not regress existing unit test coverage below the 80% threshold established in Phase 1.
- **SC-009**: The chore board remains fully functional after the redesign — all create, complete, bump, edit, and archive flows work identically to pre-redesign behavior.
- **SC-010**: The redesigned app renders correctly on both web browsers and mobile devices (iOS and Android) without platform-specific visual breakage.

## Assumptions

- The existing Phase 1 MVP functionality (chore CRUD, completions, bumps, auth) is stable and will not be modified during this redesign — only visual presentation changes.
- "Playfair Display" is the intended serif font and "Inter" is the intended sans-serif, based on the provided design system reference. If licensing or loading constraints arise, comparable alternatives that preserve the high-contrast serif and humanist sans-serif characteristics are acceptable.
- The design system's Tailwind-specific implementation notes (utility classes, CSS-only features like writing-mode vertical text, SVG noise texture overlays, and fixed-position grid lines) will be adapted to the project's actual styling system and cross-platform constraints. Features that are web-only (like visible grid lines) will be included on web and gracefully omitted on native.
- Photo assets in chore cards are not yet backed by real storage, so image-specific design treatments (grayscale-to-color transitions) will be deferred until photo storage is implemented.
- The gold accent color is used as a reference starting point. The exact hue may be adjusted during implementation to ensure it meets accessibility contrast requirements in both light and dark modes.

## Scope Boundaries

### In Scope

- All screens currently rendered by the ChoreCue app: chore board, auth flows, settings, navigation, dialogs
- Design token system (colors, typography, spacing, shadows, animation timing)
- Component restyling (buttons, inputs, cards, headings, navigation, avatars, dialogs, empty states)
- Light mode and dark mode support
- Web and native platform rendering
- Font loading for both web and native
- Accessibility maintenance (contrast, touch targets, reduced motion)

### Out of Scope

- New features or functionality changes — this is a visual-only redesign
- Backend, API, or data model changes
- Photo/image-specific treatments (grayscale filters, cinematic image reveals) until photo storage exists
- Marketing or landing pages
- Animated page transitions or route-level motion design
- Advanced web-only decorative elements (visible grid lines, SVG noise textures, vertical text labels) — these may be added as a follow-up enhancement
