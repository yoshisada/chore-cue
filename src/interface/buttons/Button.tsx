import { Button as TamaguiButton, styled, type GetProps } from 'tamagui'

export const Button = styled(TamaguiButton, {
  render: 'button',
  borderWidth: 0,
  cursor: 'pointer',
  fontFamily: '$body',
  minHeight: 48,
  borderRadius: '$4',
  transition: 'playfulQuick',

  focusVisibleStyle: {
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineColor: '$accentColor',
  },

  pressStyle: {
    scale: 0.97,
  },

  variants: {
    variant: {
      default: {
        bg: '$color12',
        color: '$color1',
        hoverStyle: {
          bg: '$accentBackground',
          color: '$accentForeground',
        },
        pressStyle: {
          bg: '$accentBackground',
          color: '$accentForeground',
          scale: 0.97,
        },
      },
      outlined: {
        bg: 'transparent',
        borderWidth: 1,
        borderColor: '$color6',
        hoverStyle: {
          bg: '$color3',
          borderColor: '$color8',
        },
        pressStyle: {
          bg: '$color2',
          borderColor: '$color6',
          scale: 0.97,
        },
      },
      transparent: {
        bg: 'transparent',
        hoverStyle: { bg: '$color2' },
        pressStyle: { bg: '$color1', opacity: 0.8, scale: 0.97 },
      },
      floating: {
        bg: '$color12',
        color: '$color1',
        shadowColor: '$shadowColor',
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
        hoverStyle: {
          bg: '$accentBackground',
          color: '$accentForeground',
          shadowRadius: 12,
        },
        pressStyle: {
          bg: '$accentBackground',
          color: '$accentForeground',
          scale: 0.97,
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
  },
})

export type ButtonProps = GetProps<typeof Button>
