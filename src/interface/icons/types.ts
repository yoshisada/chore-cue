import type { FC } from 'react'
import type { SvgProps } from 'react-native-svg'
import type { ColorTokens, SizeTokens } from 'tamagui'

export type IconProps = SvgProps & {
  size?: number | SizeTokens
  /**
   * A `$`-prefixed theme token, or an already-resolved CSS/hex color. React
   * Navigation hands `tabBarIcon` a resolved tint string, so both must be
   * accepted; `useIconProps` only looks a value up in the theme when it is a
   * token.
   */
  color?: ColorTokens | (string & {})
}

export type IconComponent = FC<IconProps>
