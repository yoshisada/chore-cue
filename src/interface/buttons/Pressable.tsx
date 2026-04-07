import { styled, View } from 'tamagui'

export const Pressable = styled(View, {
  hitSlop: 10,
  transition: 'playfulQuick',
  pressStyle: {
    opacity: 0.7,
  },
})
