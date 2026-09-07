import { memo } from 'react'
import { styled, View, YStack, type ViewProps } from 'tamagui'

import { Image } from '~/interface/image/Image'

import { UserIcon } from '../icons/phosphor/UserIcon'

export type SimpleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * The playful-household themes only define `light`/`dark` (no color sub-themes),
 * so the online dot uses a raw hex rather than a `$green*` token that resolves
 * to nothing.
 */
const ONLINE_INDICATOR_COLOR = '#2E7D4F'

const simpleSizes: Record<SimpleSize, number> = {
  xs: 24,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
}

function getSimpleSize(size: number | SimpleSize): number {
  if (typeof size === 'number') return size
  return simpleSizes[size] ?? 28
}

export type AvatarProps = Omit<ViewProps, 'size'> & {
  image: string | null | undefined
  name?: string
  size?: number | SimpleSize
  active?: boolean
  isOnline?: boolean | null
  disableBorder?: boolean
  gradient?: boolean
  gradientColors?: string[]
  /** a theme color token or a raw hex color, matching what tamagui accepts */
  accentColor?: ViewProps['outlineColor']
}

export const Avatar = memo(
  ({
    image,
    name,
    size: sizeIn = 28,
    active,
    isOnline,
    disableBorder,
    gradient,
    gradientColors,
    accentColor,
    ...rest
  }: AvatarProps) => {
    const size = getSimpleSize(sizeIn)
    const isBig = size > 40
    const scale = isBig ? size / 42 : size / 21

    return (
      <YStack
        pointerEvents="none"
        width={size}
        height={size}
        position="relative"
        rounded={9999}
        {...(!disableBorder && {
          outlineColor: accentColor ?? '$borderColor',
          outlineOffset: 1,
          outlineWidth: accentColor ? 2 : 0.5,
          outlineStyle: 'solid',
        })}
      >
        <SelectableSquare
          active={active || false}
          pressable={!!rest.onPress && !active}
          width={size}
          height={size}
          overflow="hidden"
          rounded={9999}
          {...rest}
        >
          {image ? (
            <Image
              src={image}
              alt={name ? `${name}'s avatar` : 'User avatar'}
              width={size}
              height={size}
              objectFit="cover"
            />
          ) : (
            <UserIcon size={size / 2} />
          )}
        </SelectableSquare>

        {typeof isOnline === 'boolean' ? (
          <View
            position="absolute"
            b={-1.1 * scale + (isBig ? 4.5 : 0)}
            r={-1.1 * scale + (isBig ? 4.5 : 0)}
            width={7 * scale}
            height={7 * scale}
            opacity={1}
            bg={isOnline ? ONLINE_INDICATOR_COLOR : '$color4'}
          />
        ) : null}
      </YStack>
    )
  }
)

const SelectableSquare = styled(View, {
  select: 'none',
  bg: '$color3',
  items: 'center',
  justify: 'center',

  variants: {
    active: {
      true: {
        outlineColor: '$accentColor',
        outlineWidth: 2,
        outlineStyle: 'solid',

        pressStyle: {
          outlineColor: '$color8',
        },
      },
    },

    pressable: {
      true: {
        hoverStyle: {
          outlineColor: '$color5',
          outlineWidth: 2,
          outlineStyle: 'solid',
        },

        pressStyle: {
          outlineColor: '$accentColor',
          outlineWidth: 2,
          outlineStyle: 'solid',
        },
      },
    },
  } as const,
})
