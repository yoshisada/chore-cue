# Quickstart: Playful Household Redesign

**Date**: 2026-04-07
**Branch**: `build/playful-household-redesign-20260407`

## Prerequisites

- Node 24.3.0, Bun 1.2.22
- Docker (for backend services)
- iOS simulator (for mobile verification)

## Development Workflow

```bash
# 1. Start backend (Postgres + Zero)
bun backend

# 2. Start dev server (web + native)
bun dev

# 3. Web: open http://localhost:8081
# 4. iOS: in a separate terminal
bun run ios
```

## Files to Modify (by implementer)

### impl-theme (Theme Foundations — FR-001 to FR-005)

| File | Change |
|------|--------|
| `src/tamagui/themes/luxuryEditorial.ts` | Replace entirely with `playfulHousehold.ts` |
| `src/tamagui/tamagui.config.ts` | Import new theme, restore radius tokens |
| `src/tamagui/fonts.ts` | Change heading font from Playfair Display to Inter |
| `src/features/fonts/useFonts.native.ts` | Remove Playfair Display imports, keep Inter only |
| `src/tamagui/animationsRoot.ts` | Replace luxury presets with playful presets (CSS) |
| `src/tamagui/animationsRoot.native.ts` | Replace luxury presets with playful presets (Reanimated) |
| `src/tamagui/tamagui.generated.css` | Regenerate after theme/font/radius changes |

### impl-components (Components + Interactions — FR-006 to FR-022)

| File | Change |
|------|--------|
| `src/interface/buttons/Button.tsx` | Remove uppercase/letterSpacing, add rounded + press feedback |
| `src/interface/buttons/Pressable.tsx` | Update transition name, add scale press feedback |
| `src/interface/forms/Input.tsx` | Replace underline style with rounded bordered input |
| `src/interface/avatars/Avatar.tsx` | Add accentColor prop, rounded shape, accent ring |
| `src/interface/theme/ThemeSwitch.tsx` | Update transition names |
| `src/interface/text/Headings.tsx` | Change fontFamily from $heading to $body (since both are now Inter) |
| `src/interface/pages/StepPageLayout.native.tsx` | Update heading font references |
| `src/features/app/MainHeader.tsx` | Add member avatars to header |
| `src/features/app/NavigationTabs.tsx` | Replace underline indicator with rounded pill |
| `src/features/chorecue/ChoreHomePage.tsx` | Add state colors, assignee avatars, completion animation |
| `src/features/members/MembersPage.tsx` | Larger avatars, accent colors |
| `app/(app)/auth/login.tsx` | Restyle with rounded inputs/buttons |
| `app/(app)/auth/signup/[method].tsx` | Restyle with rounded inputs/buttons |

## Verification

```bash
# Unit tests (must pass with 80%+ coverage)
bun run test:unit
bun run test:unit:coverage

# Integration tests
bun run test:integration

# iOS build
bun run ios
```

## Key Constraints

- No database/migration/Zero changes
- No new npm dependencies
- All existing tests must pass unchanged
- Both web and iOS must render correctly
