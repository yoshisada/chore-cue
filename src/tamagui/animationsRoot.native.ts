import { createAnimations } from '@tamagui/animations-reanimated'
import { animations as v5Animations } from '@tamagui/config/v5-reanimated'

export const animationsRoot = createAnimations({
  ...v5Animations.animations,

  // Luxury editorial timing presets
  luxurySlow: {
    type: 'timing',
    duration: 500,
  },
  luxuryMedium: {
    type: 'timing',
    duration: 700,
  },
  luxuryCinematic: {
    type: 'timing',
    duration: 1500,
  },
})
