import { useTheme } from 'tamagui'

import { getIconSize } from './helpers'

import type { IconProps } from './types'
import type { ColorTokens } from 'tamagui'

export const useIconProps = ({
  size,
  color = '$color11' as ColorTokens,
  ...restProps
}: IconProps) => {
  const theme = useTheme()
  const sizeValue = getIconSize(size)

  // `$`-prefixed values are theme tokens; anything else is already a resolved
  // color (react-navigation's tab tints, for instance) and is used verbatim.
  // use .get() for css var() instead of hardcoded value for ssr
  const colorValue = color.startsWith('$')
    ? theme[color as ColorTokens]?.get() || theme.color11.get()
    : color

  return {
    width: sizeValue,
    height: sizeValue,
    fill: colorValue,
    ...restProps,
  }
}
