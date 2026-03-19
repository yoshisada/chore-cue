import { styled, View } from 'tamagui'

export const Pressable = styled(View, {
  hitSlop: 10,
  transition: 'luxurySlow',
  pressStyle: {
    opacity: 0.7,
  },
})
