import { createAnimations } from '@tamagui/animations-css'
import { animationsCSS } from '@tamagui/config/v5-css'

export const animationsRoot = createAnimations({
  ...animationsCSS.animations,

  // Luxury editorial timing presets
  luxurySlow: 'ease-out 500ms',
  luxuryMedium: 'ease-out 700ms',
  luxuryCinematic: 'ease-out 1500ms',
})
