/**
 * Luxury Editorial Theme
 *
 * Warm monochromatic palette — pure grey/white/black.
 * Light mode: warm alabaster background, rich charcoal text.
 * Dark mode: inverted — rich charcoal background, warm alabaster text.
 */

// Palette constants
const ALABASTER = '#F9F8F6'
const TAUPE = '#EBE5DE'
const WARM_GREY = '#6C6863'
const CHARCOAL = '#1A1A1A'

// 12-step warm monochromatic scale (light to dark)
const lightScale = {
  color1: ALABASTER,
  color2: '#F5F3F0',
  color3: '#F0ECE6',
  color4: TAUPE,
  color5: '#E0D5CC',
  color6: '#D4C5B7',
  color7: '#C8B4A6',
  color8: WARM_GREY,
  color9: '#5A534E',
  color10: '#4D3D37',
  color11: '#332824',
  color12: CHARCOAL,
} as const

// Inverted scale for dark mode
const darkScale = {
  color1: CHARCOAL,
  color2: '#252220',
  color3: '#332824',
  color4: '#4D3D37',
  color5: '#5A534E',
  color6: WARM_GREY,
  color7: '#8C7E75',
  color8: '#A89080',
  color9: '#C8B4A6',
  color10: '#D4C5B7',
  color11: TAUPE,
  color12: ALABASTER,
} as const

export const luxuryLightTheme = {
  ...lightScale,
  background: ALABASTER,
  backgroundHover: '#F5F3F0',
  backgroundPress: '#F0ECE6',
  backgroundFocus: TAUPE,
  backgroundStrong: '#F5F3F0',
  backgroundTransparent: 'rgba(249, 248, 246, 0)',
  color: CHARCOAL,
  colorHover: '#332824',
  colorPress: '#4D3D37',
  colorFocus: '#5A534E',
  colorTransparent: 'rgba(26, 26, 26, 0)',
  borderColor: 'rgba(26, 26, 26, 0.15)',
  borderColorHover: 'rgba(26, 26, 26, 0.25)',
  borderColorPress: 'rgba(26, 26, 26, 0.3)',
  borderColorFocus: CHARCOAL,
  shadowColor: 'rgba(26, 26, 26, 0.08)',
  shadowColorHover: 'rgba(26, 26, 26, 0.12)',
  placeholderColor: WARM_GREY,
} as const

export const luxuryDarkTheme = {
  ...darkScale,
  background: CHARCOAL,
  backgroundHover: '#252220',
  backgroundPress: '#332824',
  backgroundFocus: '#4D3D37',
  backgroundStrong: '#252220',
  backgroundTransparent: 'rgba(26, 26, 26, 0)',
  color: ALABASTER,
  colorHover: TAUPE,
  colorPress: '#D4C5B7',
  colorFocus: '#C8B4A6',
  colorTransparent: 'rgba(249, 248, 246, 0)',
  borderColor: 'rgba(249, 248, 246, 0.15)',
  borderColorHover: 'rgba(249, 248, 246, 0.25)',
  borderColorPress: 'rgba(249, 248, 246, 0.3)',
  borderColorFocus: ALABASTER,
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  shadowColorHover: 'rgba(0, 0, 0, 0.3)',
  placeholderColor: '#A89080',
} as const

export const luxuryEditorialThemes = {
  light: luxuryLightTheme,
  dark: luxuryDarkTheme,
} as const

// Exported palette constants for direct use in components
export const palette = {
  alabaster: ALABASTER,
  taupe: TAUPE,
  warmGrey: WARM_GREY,
  charcoal: CHARCOAL,
} as const
