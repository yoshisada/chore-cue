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
const WARM_GRAY = '#9E9690'
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
  color7: '#C4BBB0',
  color8: WARM_GRAY,
  color9: '#7A736D',
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

// Chore state color tokens (Contract 6)
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

// Member accent color palette (Contract 7)
export const memberAccentColors = [
  '#5B8DEF', // Soft blue
  '#E8734A', // Warm coral
  '#6BBF7A', // Fresh green
  '#D4A843', // Golden amber
  '#9B6FC3', // Muted purple
  '#E57BA6', // Rosy pink
] as const
