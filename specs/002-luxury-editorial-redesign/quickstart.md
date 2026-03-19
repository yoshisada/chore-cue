# Quickstart: Luxury Editorial Redesign

## Purpose

This quickstart describes the intended implementation sequence for the Luxury Editorial Redesign defined in [spec.md](./spec.md).

## Preconditions

- The Phase 1 MVP (branch `001-phase1-chore-loop`) is complete and stable with all chore loop functionality working.
- The active branch is `002-luxury-editorial-redesign`.
- Local tooling supports Bun, Expo, and the Tamagui + One application stack.
- The developer can run the app on both web and iOS simulator to verify cross-platform rendering.

## Recommended Build Order

1. Define the luxury editorial color palette as a Tamagui theme configuration, creating both light and dark mode mappings with the warm monochromatic palette and gold accent.
2. Load the serif heading font (Playfair Display) and sans-serif body font (Inter) on both web (Google Fonts CDN) and native (expo-google-fonts), registering them as Tamagui font families.
3. Override the global border radius tokens and component defaults to zero, establishing the rectangular editorial aesthetic across all elements.
4. Define custom animation presets for luxury timing (500ms interactions, 700ms color transitions) in both the web and native animation configurations.
5. Restyle the shared interface components (Button, Input, Card, Headings, Avatar, Dialog) with the luxury editorial tokens, updating each component's default styles and interactive states.
6. Redesign the chore board layout to use thin single-line borders, uppercase section labels with wide tracking, and architectural card styling — replacing the colored theme block sections.
7. Implement the gold sliding reveal animation for primary buttons with platform-specific implementations for web and native.
8. Implement the underline-only input styling with gold focus accent.
9. Restyle the navigation header, auth screens, settings screen, and empty states to match the luxury editorial system.
10. Verify that all existing Phase 1 tests pass without regression and that coverage remains at or above 80%.

## Verification Focus

- The warm monochromatic palette is applied consistently — no pure black or pure white anywhere in the rendered UI.
- Both the serif heading font and sans-serif body font load correctly on web and native, with system fallbacks preserving the serif vs. sans-serif distinction.
- All interactive elements have zero border radius — sharp rectangular edges everywhere.
- Primary button gold sliding reveal animation completes in at least 500ms on both platforms.
- Text input focus transitions the bottom border to gold.
- Chore board sections use typographic hierarchy and thin borders, not colored backgrounds.
- Dark mode inverts the palette correctly while maintaining gold accent and typographic hierarchy.
- All primary text passes WCAG AA contrast ratio (4.5:1) in both light and dark modes.
- All interactive touch targets are at least 48 points in height.
- Reduced motion preference is respected — transitions complete instantly when enabled.
- The chore board remains fully functional — create, complete, bump, edit, and archive flows work identically to pre-redesign behavior.

## Deferred Work

- Visible editorial grid lines (web-only decorative feature)
- SVG noise paper texture overlay (web-only decorative feature)
- Vertical text labels (CSS writing-mode, web-only)
- Drop caps for introductory paragraphs
- Grayscale-to-color image transitions (deferred until photo storage is implemented)
- Mixed italic headline styling beyond the primary screen heading
- Advanced asymmetric grid layouts using offset columns
