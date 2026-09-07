import { createAnimations } from '@tamagui/animations-reanimated'
import { animations as v5Animations } from '@tamagui/config/v5-reanimated'

export const animationsRoot = createAnimations({
  ...v5Animations.animations,

  // Playful household timing presets
  playfulBounce: {
    type: 'spring',
    damping: 12,
    stiffness: 150,
  },
  playfulMedium: {
    type: 'timing',
    duration: 300,
  },
  playfulQuick: {
    type: 'timing',
    duration: 150,
  },
})
