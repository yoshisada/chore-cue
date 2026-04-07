# Implementation Plan: Playful Household Redesign

**Branch**: `build/playful-household-redesign-20260407` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/playful-household-redesign/spec.md`

## Summary

Replace the luxury editorial design system with a playful household theme. The change touches three layers: (1) theme tokens — new color palette, restored rounded radii, Inter-only fonts, and new animation presets; (2) component restyling — Button, Input, Avatar, Headings, NavigationTabs, MainHeader restyled with rounded shapes and press feedback; (3) feature page updates — ChoreHomePage gets state colors + assignee avatars + completion animation, MembersPage gets larger avatars + accent colors, auth flows get rounded styling. No data model, schema, or server changes.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: React 19 with React Compiler, Tamagui 2.0.0-rc.17, One (vxrn 1.9.9), Expo, React Native Reanimated 4.1.6
**Storage**: N/A — visual-only redesign, no data layer changes
**Testing**: Vitest (unit), Playwright (integration), 80% coverage threshold
**Target Platform**: Web (Chromium, Safari), iOS (Expo/React Native)
**Project Type**: Cross-platform mobile-first app
**Performance Goals**: No regressions; animations must be smooth (60fps)
**Constraints**: Offline-capable via Zero sync (unchanged), no new dependencies
**Scale/Scope**: ~20 files to modify, 0 new data models, 22 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| 1. Preserve The Shared Chore Loop | PASS | Visual reskin only — chore creation, completion, recurrence, and sync unchanged |
| 2. Keep Household Coordination Polite | PASS | No changes to bumps, notifications, or reminder wording |
| 3. Favor Small-Household Simplicity | PASS | 6-color accent palette sized for 2-6 members — small household optimized |
| 4. Require Flexible Recurrence Accuracy | PASS | No recurrence logic changes |
| 5. Ship The Smallest Useful Cross-Platform Slice | PASS | Minimal visual changes that span web + iOS; no scope creep |
| 6. Write Testable Product Specs | PASS | Spec includes acceptance scenarios, FRs, and measurable success criteria |
| 7. Maintain Coverage Discipline | PASS | 80% coverage maintained as SC-001; no logic changes that would drop coverage |

No violations. No complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/playful-household-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model (no schema changes)
├── quickstart.md        # Phase 1 quickstart guide
├── contracts/
│   └── interfaces.md    # Interface contracts
├── checklists/
│   └── requirements.md  # Specification quality checklist
├── agent-notes/
│   └── specifier.md     # Agent friction notes
└── tasks.md             # Phase 2 task breakdown
```

### Source Code (files to modify)

```text
src/tamagui/
├── themes/
│   └── luxuryEditorial.ts  → playfulHousehold.ts  # Theme tokens (impl-theme)
├── tamagui.config.ts       # Config: import new theme, radius tokens (impl-theme)
├── fonts.ts                # Heading font: Playfair → Inter (impl-theme)
├── animationsRoot.ts       # CSS animation presets (impl-theme)
├── animationsRoot.native.ts # Reanimated animation presets (impl-theme)
└── tamagui.generated.css   # Regenerated CSS (impl-theme)

src/features/fonts/
└── useFonts.native.ts      # Remove Playfair Display loading (impl-theme)

src/interface/
├── buttons/
│   ├── Button.tsx          # Restyle: rounded, press feedback (impl-components)
│   └── Pressable.tsx       # Update transition name, scale feedback (impl-components)
├── forms/
│   └── Input.tsx           # Restyle: rounded bordered (impl-components)
├── avatars/
│   └── Avatar.tsx          # Add accentColor prop, rounded (impl-components)
├── theme/
│   └── ThemeSwitch.tsx     # Update transition names (impl-components)
├── text/
│   └── Headings.tsx        # Optional: fontFamily $heading → $body (impl-components)
├── pages/
│   └── StepPageLayout.native.tsx  # Update heading refs (impl-components)
└── dialogs/
    └── Dialog.tsx          # Update heading refs if needed (impl-components)

src/features/
├── app/
│   ├── MainHeader.tsx      # Add member avatars to header (impl-components)
│   └── NavigationTabs.tsx  # Rounded pill indicator (impl-components)
├── chorecue/
│   └── ChoreHomePage.tsx   # State colors, avatars, completion animation (impl-components)
└── members/
    └── MembersPage.tsx     # Larger avatars, accent colors (impl-components)

app/(app)/auth/
├── login.tsx               # Restyle auth (impl-components)
└── signup/[method].tsx     # Restyle auth (impl-components)
```

**Structure Decision**: No new directories needed. The theme file is renamed in-place. All changes modify existing files.

## Implementation Strategy

### Two-Implementer Split

The work is split between two implementers based on file ownership:

1. **impl-theme** (FR-001 to FR-005): Theme tokens, fonts, palette, radii, animation presets. These are foundational — impl-components depends on them being done first.

2. **impl-components** (FR-006 to FR-022): State colors, avatars, animations, component restyling, feature page updates, auth restyling, platform parity verification. Depends on impl-theme completing the token foundation.

### Dependency Chain

```
impl-theme: Theme tokens → Fonts → Radii → Animation presets → CSS regeneration
     ↓
impl-components: State colors → Avatar enhancement → Component restyling →
                 ChoreHomePage → MembersPage → Auth flows → NavigationTabs →
                 MainHeader → Completion animation → Platform parity
```

### Risk Mitigations

1. **Hardcoded token values**: Some components may use raw hex colors instead of `$token` references. A grep for the luxury palette hex values (ALABASTER, CHARCOAL, GOLD) should catch these.

2. **Animation name references**: All `luxurySlow`/`luxuryMedium`/`luxuryCinematic` references must be updated. A grep will catch any missed references.

3. **CSS regeneration**: After theme/font/radius changes, `tamagui.generated.css` must be regenerated by running `bun dev` and capturing the output. This file is auto-generated.

4. **Playfair Display removal**: After removing from fonts.ts and useFonts.native.ts, verify with grep that no references remain in source code. The `@expo-google-fonts/playfair-display` package can be removed from `package.json`.
