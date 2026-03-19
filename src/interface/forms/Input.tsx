import {
  Input as TamaguiInput,
  styled,
  type GetProps,
  type TamaguiElement,
} from 'tamagui'

export const Input = styled(TamaguiInput, {
  height: 50,
  size: '$5',
  bg: 'transparent',
  borderWidth: 0,
  borderBottomWidth: 1,
  borderBottomColor: '$color6',
  borderRadius: 0,
  placeholderTextColor: '$color8',
  fontFamily: '$body',
  transition: 'luxurySlow',

  focusVisibleStyle: {
    outlineWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '$color12',
  },

  focusStyle: {
    borderBottomWidth: 2,
    borderBottomColor: '$color12',
  },
})

export type InputProps = GetProps<typeof Input>
