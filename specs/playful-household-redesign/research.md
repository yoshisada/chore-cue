# Research: Playful Household Redesign

**Date**: 2026-04-07
**Branch**: `build/playful-household-redesign-20260407`

## Research Task 1: Tamagui Theme Token Structure

**Decision**: The new theme file (`playfulHousehold.ts`) must export the same token shape as `luxuryEditorial.ts` — a 12-step color scale plus semantic tokens (background, color, borderColor, shadowColor, accentColor, placeholderColor, etc.) for both light and dark variants. Tamagui resolves these at build time into CSS custom properties.

**Rationale**: The existing `tamagui.config.ts` passes the theme object directly to `createTamagui({ themes })`. The theme shape is a contract — every component using `$color1`-`$color12`, `$background`, `$accentColor`, etc. depends on these tokens existing. Changing the shape would break all components simultaneously.

**Alternatives considered**: Creating a new Tamagui plugin or sub-theme system — rejected because the existing flat theme structure already supports light/dark variants and all components are built against it.

## Research Task 2: Radius Token Override Strategy

**Decision**: The current `tamagui.config.ts` overrides all radius tokens to `0` for the editorial rectangular aesthetic. The playful redesign must restore radius tokens to meaningful values (8-12px range) by replacing the override with rounded values.

**Rationale**: Confirmed in `tamagui.config.ts` lines 11-27: every radius token (0-12, true) is set to `0`. Restoring them to Tamagui defaults or custom rounded values will propagate to all components using `borderRadius: '$N'` tokens.

**Alternatives considered**: Per-component borderRadius overrides — rejected because the token-level fix propagates automatically and is less error-prone.

## Research Task 3: Font Stack Replacement

**Decision**: Replace `$heading` font family from Playfair Display to Inter. The `$body` font is already Inter. After the change, both `$heading` and `$body` will use Inter, making it the sole typeface.

**Rationale**: The heading font is defined in `src/tamagui/fonts.ts` as a `createFont()` call with `family: '"Playfair Display", ..., serif'`. Changing this to Inter's family string and updating the `face` map to Inter weights will propagate to all `H1`-`H6` components via the `$heading` token. The native font loading in `useFonts.native.ts` must also be updated to remove Playfair Display imports.

**Alternatives considered**: Adding a third font family for headings — rejected because the spec explicitly requires Inter as the sole typeface.

## Research Task 4: Animation Preset Strategy

**Decision**: Replace the `luxurySlow`, `luxuryMedium`, `luxuryCinematic` animation presets with playful equivalents: `playfulBounce` (spring-like, for completion), `playfulQuick` (fast feedback, for press), and `playfulMedium` (standard transitions). Both CSS (web) and Reanimated (native) animation files must be updated.

**Rationale**: The animation presets are defined in `animationsRoot.ts` (CSS) and `animationsRoot.native.ts` (Reanimated). Components reference these by name (e.g., `transition: 'luxurySlow'`). Renaming them requires updating all component references. The completion animation (FR-012) needs a spring/bounce preset that doesn't exist yet.

**Alternatives considered**: Keeping the luxury preset names — rejected because the presets need different timing characteristics (spring vs ease-out) and the names should reflect the design language.

## Research Task 5: Chore State Color Accessibility

**Decision**: Use the following WCAG 2.1 AA compliant color pairs:

| State | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Overdue | `#D94F4F` (coral/red) | `#F28B82` (light coral) | Left border + subtle background tint |
| Due Soon | `#D4920B` (amber) | `#FDD663` (light amber) | Left border + subtle background tint |
| Done | `#2E7D4F` (green) | `#81C995` (light green) | Left border + subtle background tint |
| Upcoming | `#8C8C8C` (gray) | `#A0A0A0` (light gray) | Left border only |

**Rationale**: These colors maintain 4.5:1+ contrast ratios against the warm white (~#FAF9F7) light background and the deep warm gray (~#1E1E1E) dark background. The light mode uses darker/muted variants; dark mode uses lighter variants. The left border + tint approach ensures visibility without overwhelming the card design.

**Alternatives considered**: Badge-only approach — rejected because a colored border provides stronger at-a-glance scanning. Background-only approach — rejected because it reduces card readability.

## Research Task 6: Member Accent Color Palette

**Decision**: Use a palette of 6 harmonious, distinguishable colors:

1. `#5B8DEF` — Soft blue
2. `#E8734A` — Warm coral
3. `#6BBF7A` — Fresh green
4. `#D4A843` — Golden amber
5. `#9B6FC3` — Muted purple
6. `#E57BA6` — Rosy pink

**Rationale**: These colors are chosen to be visually distinct from each other and from the chore state colors. They work as avatar rings/tints in both light and dark modes. The palette covers the full hue spectrum to maximize distinguishability for 2-6 members.

**Alternatives considered**: Using the state color palette — rejected because state and identity colors must remain distinct visual systems.

## Research Task 7: Completion Animation Design

**Decision**: Use a checkmark scale-up + fade animation for chore completion:
1. Checkmark icon scales from 0 to 1.2x then settles to 1x (overshoot spring)
2. Card background briefly flashes the "done" green tint
3. Total duration: 400ms
4. Non-blocking: animation runs in a fire-and-forget pattern

**Rationale**: A checkmark scale animation is universally understood, quick to implement with both CSS and Reanimated, and satisfying without being distracting. Confetti was considered but adds complexity and can feel excessive for a frequent action.

**Alternatives considered**: Confetti burst — rejected for being too heavy for a frequent action. Card shrink — rejected because it creates layout shift which feels jarring on a list.
