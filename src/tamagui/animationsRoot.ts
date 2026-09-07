import { createAnimations } from '@tamagui/animations-css'
import { animationsCSS } from '@tamagui/config/v5-css'

export const animationsRoot = createAnimations({
  ...animationsCSS.animations,

  // Playful household timing presets
  playfulBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1) 400ms',
  playfulMedium: 'ease-out 300ms',
  playfulQuick: 'ease-out 150ms',
})
