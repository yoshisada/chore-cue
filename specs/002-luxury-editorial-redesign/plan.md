# Implementation Plan: Luxury Editorial Redesign

**Branch**: `002-luxury-editorial-redesign` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-luxury-editorial-redesign/spec.md`

## Summary

Redesign the ChoreCue app's visual layer from its default Tamagui v5 styling to a luxury editorial aesthetic: warm monochromatic palette with gold accents, Playfair Display + Inter font pairing, zero border radius, cinematic-speed animations, and architectural line-based layouts. The redesign touches only presentation — all Phase 1 MVP functionality (chore CRUD, completions, bumps, auth) remains unchanged. Implementation adapts the Tailwind-referenced design system to Tamagui's token and theme system, with platform-specific animation files for web (CSS) and native (Reanimated).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode), React 19 with React Compiler
**Primary Dependencies**: Tamagui 2.0.0-rc.17, One (vxrn 1.9.9), Expo, React Native Reanimated 4.1.6, @tamagui/animations-css (web), @tamagui/animations-reanimated (native)
**Storage**: N/A — this is a visual-only redesign with no data layer changes
**Testing**: Vitest for unit coverage, Playwright for browser integration — existing Phase 1 suite must not regress below 80% coverage
**Target Platform**: Web (all modern browsers) + iOS + Android via Expo
**Project Type**: Cross-platform mobile and web application
**Performance Goals**: Maintain 60fps during all animations, font loading must not block splash screen dismissal beyond current latency
**Constraints**: Cross-platform consistency (Tamagui must render identically on web and native for colors, fonts, spacing, borders), React Native does not support CSS-only features (writing-mode, SVG noise filters, fixed-position grid lines), serif font must load before first render on native
**Scale/Scope**: ~25 interface components to restyle, 1 primary feature screen (chore board), 3-4 secondary screens (auth, settings, navigation), 2 theme modes (light + dark)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `Preserve The Shared Chore Loop`: Pass. The redesign is visual-only — all chore creation, completion, bump, edit, and archive flows remain functionally identical.
- `Keep Household Coordination Polite`: Pass. Bump UI and reminder messaging are restyled but the polite defaults, wording, and rate-limit behavior are unchanged.
- `Favor Small-Household Simplicity`: Pass. No new complexity is introduced to the household model or UI flows. The redesign simplifies the visual hierarchy by removing colored section blocks.
- `Require Flexible Recurrence Accuracy`: Pass. Recurrence logic is not modified. Due-state display uses the same data — only the typographic and color treatment changes.
- `Ship The Smallest Useful Cross-Platform Slice`: Pass. The redesign scope is bounded to visual presentation across the existing screens. Web-only decorative elements (grid lines, noise textures, vertical text) are explicitly deferred.
- `Write Testable Product Specs`: Pass. The spec includes 18 functional requirements, 10 measurable success criteria, and 5 user stories with concrete acceptance scenarios.
- `Maintain Coverage Discipline`: Pass only if existing tests continue to pass after restyling. Visual changes should not break test assertions unless tests rely on specific style values, in which case they must be updated as part of this work.

## Project Structure

### Documentation (this feature)

```text
specs/002-luxury-editorial-redesign/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- tamagui/
|   |-- tamagui.config.ts          # Extended with luxury editorial themes
|   |-- fonts.ts                   # Updated with Playfair Display + Inter families
|   |-- themes/
|   |   `-- luxuryEditorial.ts     # NEW: Light + dark theme palette definitions
|   |-- animationsRoot.ts          # Extended with luxury timing presets (web)
|   `-- animationsRoot.native.ts   # Extended with luxury timing presets (native)
|-- features/
|   |-- chorecue/
|   |   |-- ChoreHomePage.tsx      # Restyled with editorial layout
|   |   `-- components/
|   |       `-- PhotoInput.tsx     # Restyled
|   |-- app/
|   |   |-- MainHeader.tsx         # Restyled with monochromatic palette
|   |   `-- NavigationTabs.tsx     # Restyled with gold active indicator
|   `-- fonts/
|       |-- useFonts.ts            # NEW: Web font loading stub
|       `-- useFonts.native.ts     # NEW: Native font loading via expo-google-fonts
|-- interface/
|   |-- buttons/
|   |   `-- Button.tsx             # Restyled with luxury variants + gold reveal
|   |-- forms/
|   |   `-- Input.tsx              # Restyled with underline-only + gold focus
|   |-- layout/
|   |   |-- PageContainer.tsx      # Updated spacing
|   |   `-- PageLayout.tsx         # Updated background color
|   |-- headings/
|   |   `-- Headings.tsx           # Updated to use serif heading font
|   |-- avatar/
|   |   `-- Avatar.tsx             # Updated to rectangular shape
|   |-- dialog/
|   |   `-- Dialog.tsx             # Restyled with luxury palette
|   `-- headers/
|       `-- ScrollHeader.tsx       # Restyled with monochromatic palette
`-- test/
    |-- unit/                      # Existing tests updated if style-dependent assertions break
    `-- integration/               # Existing tests verified for non-regression

app/
|-- root.css                       # Updated with Google Fonts import + luxury CSS variables
`-- _layout.tsx                    # Updated with Google Fonts link for web
```

**Structure Decision**: Use the existing root-level Takeout scaffold structure. No new directories beyond `src/tamagui/themes/` and `src/features/fonts/`. All changes modify existing files or add platform-specific variants alongside existing files.

## Phase 0: Research Summary

1. Tamagui's theme system supports custom color palettes mapped to `color1`-`color12` scales with semantic keys (`background`, `color`, `borderColor`, `shadowColor`). Light and dark themes are defined as separate objects with underscore naming convention.
2. Font loading uses `expo-google-fonts` packages on native (with `useFonts()` hook tied to splash screen lifecycle) and Google Fonts CDN on web (via CSS `@import` or `<link>` tag). Tamagui's `createSystemFont` accepts per-weight family mappings.
3. The gold sliding button animation requires platform-specific implementations: CSS transitions with absolute-positioned overlay on web, Reanimated `withTiming` with `Animated.View` on native. The codebase already follows this `.native.tsx` split pattern.
4. Zero border radius is enforced at two layers: overriding Tamagui radius tokens globally and updating individual interface component defaults.
5. Luxury animation timing presets can extend the existing animation configuration with named presets (`luxurySlow`, `luxuryMedium`, `luxuryCinematic`).
6. Reduced motion is handled automatically on web via CSS media query; on native via `AccessibilityInfo.isReduceMotionEnabled()`.
7. The chore board's current colored `<Theme>` section wrappers are replaced with thin borders and typographic hierarchy.
8. Web-only decorative elements (grid lines, noise, vertical text) are deferred to a follow-up.

## Post-Design Constitution Check

- `Preserve The Shared Chore Loop`: Still passes. No functional changes to chore flows.
- `Keep Household Coordination Polite`: Still passes. Bump and reminder presentation restyled but behavior unchanged.
- `Favor Small-Household Simplicity`: Still passes. No household model complexity added.
- `Require Flexible Recurrence Accuracy`: Still passes. Recurrence logic untouched.
- `Ship The Smallest Useful Cross-Platform Slice`: Still passes. Scope bounded to visual layer with web-only decorations deferred.
- `Write Testable Product Specs`: Still passes. Spec contains concrete, measurable requirements.
- `Maintain Coverage Discipline`: Still gated on implementation. Tests must pass at 80%+ after all visual changes are applied.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
