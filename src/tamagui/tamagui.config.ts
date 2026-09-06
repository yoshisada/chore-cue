import { defaultConfig } from '@tamagui/config/v5'
import { createTamagui } from 'tamagui'

import { animationsRoot } from './animationsRoot'
import { fonts } from './fonts'
import { playfulHouseholdThemes } from './themes/playfulHousehold'

// Rounded radius tokens for playful household aesthetic
const tokens = {
  ...defaultConfig.tokens,
  radius: {
    ...defaultConfig.tokens.radius,
    0: 0,
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    5: 10,
    6: 12,
    7: 12,
    8: 14,
    9: 16,
    10: 18,
    11: 18,
    12: 20,
    true: 10,
  },
}

export const config = createTamagui({
  ...defaultConfig,
  tokens,
  animations: animationsRoot,
  fonts,
  // tamagui optimization - reduce bundle size by avoiding themes js on client
  // tamagui will hydrate it from CSS which improves lighthouse scores
  themes:
    process.env.VITE_ENVIRONMENT === 'client'
      ? ({} as typeof playfulHouseholdThemes)
      : playfulHouseholdThemes,
})

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}

  interface TypeOverride {
    groupNames(): 'button' | 'message' | 'icon' | 'item' | 'frame' | 'card'
  }
}
