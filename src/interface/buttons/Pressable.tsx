import { styled, View } from 'tamagui'

export const Pressable = styled(View, {
  hitSlop: 10,
  transition: 'playfulQuick',
  pressStyle: {
    scale: 0.97,
    opacity: 0.85,
  },
})
