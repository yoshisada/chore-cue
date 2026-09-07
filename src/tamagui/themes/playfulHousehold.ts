/**
 * Playful Household Theme
 *
 * Warm, approachable palette — soft whites, warm grays, teal accent.
 * Light mode: soft white background, charcoal text.
 * Dark mode: deep warm gray background, warm white text. No pure black.
 */

// Warm palette constants
const SOFT_WHITE = '#FAF9F7'
const WARM_CREAM = '#F0EDE8'
// Secondary/metadata text. 4.70:1 on SOFT_WHITE — clears WCAG AA (4.5:1) for
// body text while staying a muted warm gray.
const WARM_GRAY = '#766F69'
const DEEP_CHARCOAL = '#2C2825'

// Teal accent — warm, approachable replacement for gold
const TEAL_LIGHT = '#1A8A7D'
const TEAL_DARK = '#3DD9C8'

// 12-step warm scale (light to dark)
const lightScale = {
  color1: SOFT_WHITE,
  color2: '#F5F2EE',
  color3: '#F0EDE8',
  color4: WARM_CREAM,
  color5: '#E3DDD5',
  color6: '#D5CEC5',
  // color7 darkened from #C4BBB0 to keep the ramp evenly spaced once color8
  // moved down to meet AA — it is a non-text step (nothing renders in it), so
  // this only closes the 1.80 → 4.70 gap the AA fix would otherwise leave.
  color7: '#A39B95',
  color8: WARM_GRAY,
  // color9 darkened from #7A736D so the ramp stays monotonic now that color8
  // clears AA: contrast on SOFT_WHITE runs 4.70 → 6.06 → 7.17 for steps 8-10.
  color9: '#655E58',
  color10: '#5A534E',
  color11: '#3D3733',
  color12: DEEP_CHARCOAL,
} as const

// Inverted scale for dark mode
const darkScale = {
  color1: DEEP_CHARCOAL,
  color2: '#342F2B',
  color3: '#3D3733',
  color4: '#4A4340',
  color5: '#5A534E',
  color6: '#7A736D',
  color7: '#948C85',
  color8: '#AEA59D',
  color9: '#C4BBB0',
  color10: '#D5CEC5',
  color11: '#E3DDD5',
  color12: SOFT_WHITE,
} as const

export const playfulLightTheme = {
  ...lightScale,
  background: SOFT_WHITE,
  backgroundHover: '#F5F2EE',
  backgroundPress: '#F0EDE8',
  backgroundFocus: WARM_CREAM,
  backgroundStrong: '#F5F2EE',
  backgroundTransparent: 'rgba(250, 249, 247, 0)',
  color: DEEP_CHARCOAL,
  colorHover: '#3D3733',
  colorPress: '#4A4340',
  colorFocus: '#5A534E',
  colorTransparent: 'rgba(44, 40, 37, 0)',
  borderColor: 'rgba(44, 40, 37, 0.15)',
  borderColorHover: 'rgba(44, 40, 37, 0.25)',
  borderColorPress: 'rgba(44, 40, 37, 0.3)',
  borderColorFocus: DEEP_CHARCOAL,
  shadowColor: 'rgba(44, 40, 37, 0.08)',
  shadowColorHover: 'rgba(44, 40, 37, 0.12)',
  placeholderColor: WARM_GRAY,
  accentColor: TEAL_LIGHT,
  accentBackground: TEAL_LIGHT,
  accentForeground: SOFT_WHITE,
} as const

export const playfulDarkTheme = {
  ...darkScale,
  background: DEEP_CHARCOAL,
  backgroundHover: '#342F2B',
  backgroundPress: '#3D3733',
  backgroundFocus: '#4A4340',
  backgroundStrong: '#342F2B',
  backgroundTransparent: 'rgba(44, 40, 37, 0)',
  color: SOFT_WHITE,
  colorHover: '#E3DDD5',
  colorPress: '#D5CEC5',
  colorFocus: '#C4BBB0',
  colorTransparent: 'rgba(250, 249, 247, 0)',
  borderColor: 'rgba(250, 249, 247, 0.15)',
  borderColorHover: 'rgba(250, 249, 247, 0.25)',
  borderColorPress: 'rgba(250, 249, 247, 0.3)',
  borderColorFocus: SOFT_WHITE,
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  shadowColorHover: 'rgba(0, 0, 0, 0.3)',
  placeholderColor: '#AEA59D',
  accentColor: TEAL_DARK,
  accentBackground: TEAL_DARK,
  accentForeground: DEEP_CHARCOAL,
} as const

export const playfulHouseholdThemes = {
  light: playfulLightTheme,
  dark: playfulDarkTheme,
} as const

/**
 * A raw (non-token) color literal. Tamagui accepts `#...` strings anywhere a
 * `$token` is accepted, but not a widened `string`, so the helpers that read
 * the palettes below must preserve this shape.
 */
export type HexColor = `#${string}`

/**
 * Chore state color tokens (Contract 6).
 *
 * These paint graphical objects — the card's left border, its background tint,
 * and the section-header dot — so WCAG 1.4.11 applies: 3:1 against the mode's
 * background. Measured against #FAF9F7 the light set runs overdue 3.85,
 * due 3.47, done 4.80, upcoming 3.20; against #2C2825 the dark set runs
 * overdue 6.12, due 10.42, done 7.46, upcoming 5.59.
 *
 * `overdue` is additionally used as error text (MembersPage) at body size.
 */
export const choreStateColors = {
  light: {
    overdue: '#D94F4F',
    // Darkened from #D4920B (2.52:1 — failed 1.4.11) to 3.47:1, same ~40° hue.
    due: '#B57A06',
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

// Member accent color palette (Contract 7)
export const memberAccentColors = [
  '#5B8DEF', // Soft blue
  '#E8734A', // Warm coral
  '#6BBF7A', // Fresh green
  '#D4A843', // Golden amber
  '#9B6FC3', // Muted purple
  '#E57BA6', // Rosy pink
] as const
