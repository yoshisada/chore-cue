# Data Model: Playful Household Redesign

**Date**: 2026-04-07
**Branch**: `build/playful-household-redesign-20260407`

## Overview

This is a visual-only redesign. **No database schema changes, no migrations, no Zero sync modifications, no server action changes.**

All entities below are client-side design tokens and configuration — not persisted data.

## Entity 1: Playful Household Theme

The complete design token set replacing `luxuryEditorial.ts`.

**Attributes**:
- 12-step color scale (color1-color12) for both light and dark variants
- Semantic tokens: background, backgroundHover, backgroundPress, backgroundFocus, backgroundStrong, backgroundTransparent
- Text tokens: color, colorHover, colorPress, colorFocus, colorTransparent
- Border tokens: borderColor, borderColorHover, borderColorPress, borderColorFocus
- Shadow tokens: shadowColor, shadowColorHover
- Special tokens: placeholderColor, accentColor, accentBackground, accentForeground

**State transitions**: Light mode <-> Dark mode (via existing ThemeSwitch toggle)

## Entity 2: Chore State Color Map

A mapping of chore due-bucket states to visual colors.

**Attributes**:
- `overdue`: coral/red pair (light mode + dark mode)
- `due`: amber/yellow pair (light mode + dark mode)
- `done`: green pair (light mode + dark mode)
- `upcoming`: gray pair (light mode + dark mode)

**Relationship**: Maps to `ChoreCard.dueBucket` from `src/features/chorecue/types.ts`

## Entity 3: Member Accent Color Palette

A fixed palette of 6 colors assigned to household members.

**Attributes**:
- Array of 6 hex color values, ordered by assignment priority
- Assignment algorithm: deterministic by member index (0-5)

**Relationship**: Maps to household member identity. Used by Avatar component as ring/tint color.

## Entity 4: Animation Presets

Named animation configurations for both CSS (web) and Reanimated (native).

**Attributes**:
- `playfulBounce`: spring-like, 400ms, for completion feedback
- `playfulQuick`: fast, 150ms, for press/tap feedback
- `playfulMedium`: standard, 300ms, for transitions

**Relationship**: Referenced by components via Tamagui `transition` prop
