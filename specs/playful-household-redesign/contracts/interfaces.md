# Interface Contracts: Playful Household Redesign

**Date**: 2026-04-07
**Branch**: `build/playful-household-redesign-20260407`

## Overview

This redesign replaces visual tokens and component styling. No external APIs or data contracts change. The contracts below define the internal interface boundaries that must be preserved — the theme token shape, animation preset names, and component prop extensions.

## Contract 1: Theme Token Shape

The new theme file (`playfulHousehold.ts`) must export the same shape as `luxuryEditorial.ts`. Both `light` and `dark` variants must define all tokens listed below.

| Token Group | Tokens | Requirement |
|-------------|--------|-------------|
| Color Scale | `color1`-`color12` | 12-step warm palette, light-to-dark in light mode, inverted in dark |
| Background | `background`, `backgroundHover`, `backgroundPress`, `backgroundFocus`, `backgroundStrong`, `backgroundTransparent` | Soft white (light) / deep warm gray (dark), no pure white or pure black |
| Text | `color`, `colorHover`, `colorPress`, `colorFocus`, `colorTransparent` | Charcoal (light) / warm white (dark) |
| Border | `borderColor`, `borderColorHover`, `borderColorPress`, `borderColorFocus` | Semi-transparent, warm tones |
| Shadow | `shadowColor`, `shadowColorHover` | Warm shadow tones |
| Accent | `accentColor`, `accentBackground`, `accentForeground` | Teal or warm accent replacing gold |
| Placeholder | `placeholderColor` | Muted warm gray |

**Export shape**:
```typescript
export const playfulHouseholdThemes = {
  light: { /* all tokens above */ },
  dark: { /* all tokens above */ },
} as const
```

## Contract 2: Radius Token Override

The `tamagui.config.ts` radius token override must change from all-zero to rounded values.

| Token | Old Value | New Value |
|-------|-----------|-----------|
| `0` | `0` | `0` |
| `1` | `0` | `2` |
| `2` | `0` | `4` |
| `3` | `0` | `6` |
| `4` | `0` | `8` |
| `5` | `0` | `10` |
| `6` | `0` | `12` |
| `7`-`12` | `0` | `12`-`20` (graduated) |
| `true` | `0` | `10` (default rounded) |

## Contract 3: Font Configuration

The heading font must change from Playfair Display to Inter.

| Property | Old Value | New Value |
|----------|-----------|-----------|
| `heading.family` | `'"Playfair Display", "Georgia", "Times New Roman", serif'` | `'"Inter", system-ui, -apple-system, sans-serif'` |
| `heading.face` | Playfair Display weight map | Inter weight map (same as body font) |
| `heading.weight` | `3: '400'` (Playfair min) | `3: '300'` (Inter Light) |

Native font loading (`useFonts.native.ts`):
- Remove: All `@expo-google-fonts/playfair-display` imports
- Keep: All `@expo-google-fonts/inter` imports
- Rename: `useLuxuryFonts` -> `usePlayfulFonts`

## Contract 4: Animation Presets

Both `animationsRoot.ts` (CSS) and `animationsRoot.native.ts` (Reanimated) must define the same preset names.

| Old Preset | New Preset | CSS Value | Reanimated Value |
|-----------|-----------|-----------|-----------------|
| `luxurySlow` | `playfulBounce` | `'cubic-bezier(0.34, 1.56, 0.64, 1) 400ms'` | `{ type: 'spring', damping: 12, stiffness: 150 }` |
| `luxuryMedium` | `playfulMedium` | `'ease-out 300ms'` | `{ type: 'timing', duration: 300 }` |
| `luxuryCinematic` | `playfulQuick` | `'ease-out 150ms'` | `{ type: 'timing', duration: 150 }` |

**Component reference update**: All components using `transition: 'luxurySlow'` etc. must update to the new names.

| File | Old Reference | New Reference |
|------|--------------|---------------|
| `src/interface/buttons/Button.tsx` | `transition: 'luxurySlow'` | `transition: 'playfulQuick'` |
| `src/interface/buttons/Pressable.tsx` | `transition: 'luxurySlow'` | `transition: 'playfulQuick'` |
| `src/interface/forms/Input.tsx` | `transition: 'luxurySlow'` | `transition: 'playfulQuick'` |
| `src/interface/theme/ThemeSwitch.tsx` | `transition: 'luxurySlow'` | `transition: 'playfulQuick'` |

## Contract 5: Avatar Component Extension

The `Avatar` component must accept an optional `accentColor` prop.

```typescript
export type AvatarProps = Omit<ViewProps, 'size'> & {
  image: string | null | undefined
  name?: string
  size?: number | SimpleSize
  active?: boolean
  isOnline?: boolean | null
  disableBorder?: boolean
  gradient?: boolean
  gradientColors?: string[]
  accentColor?: string  // NEW: member accent color for ring/tint
}
```

**Behavior**: When `accentColor` is provided, display it as a 2px ring around the avatar. When not provided, fall back to existing `$borderColor` behavior.

## Contract 6: Chore State Color Tokens

New exported constants for chore state colors (used by ChoreHomePage).

```typescript
export const choreStateColors = {
  light: {
    overdue: '#D94F4F',
    due: '#D4920B',
    done: '#2E7D4F',
    upcoming: '#8C8C8C',
  },
  dark: {
    overdue: '#F28B82',
    due: '#FDD663',
    done: '#81C995',
    upcoming: '#A0A0A0',
  },
} as const
```

**Location**: Exported from the new theme file alongside the theme tokens.

## Contract 7: Member Accent Color Palette

```typescript
export const memberAccentColors = [
  '#5B8DEF', // Soft blue
  '#E8734A', // Warm coral
  '#6BBF7A', // Fresh green
  '#D4A843', // Golden amber
  '#9B6FC3', // Muted purple
  '#E57BA6', // Rosy pink
] as const
```

**Location**: Exported from the new theme file.
**Assignment**: `memberAccentColors[memberIndex % 6]`
