import { defaultConfig } from '@tamagui/config/v5'
import { createTamagui } from 'tamagui'

import { animationsRoot } from './animationsRoot'
import { fonts } from './fonts'
import { luxuryEditorialThemes } from './themes/luxuryEditorial'

// Override radius tokens to zero for editorial rectangular aesthetic
const tokens = {
  ...defaultConfig.tokens,
  radius: {
    ...defaultConfig.tokens.radius,
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    true: 0,
  },
}

export const config = createTamagui({
  ...defaultConfig,
  tokens,
  animations: animationsRoot,
  fonts,
  // tamagui optimization - reduce bundle size by avoiding themes js on client
  // tamagui will hydrate it from CSS which improves lighthouse scores
  themes: process.env.VITE_ENVIRONMENT === 'client'
    ? ({} as typeof luxuryEditorialThemes)
    : luxuryEditorialThemes,
})

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}

  interface TypeOverride {
    groupNames(): 'button' | 'message' | 'icon' | 'item' | 'frame' | 'card'
  }
}
