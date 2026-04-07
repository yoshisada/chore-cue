import {
  Input as TamaguiInput,
  styled,
  type GetProps,
  type TamaguiElement,
} from 'tamagui'

export const Input = styled(TamaguiInput, {
  height: 50,
  size: '$5',
  bg: '$color2',
  borderWidth: 1,
  borderColor: '$color6',
  borderRadius: '$3',
  placeholderTextColor: '$color8',
  fontFamily: '$body',
  transition: 'playfulQuick',

  focusVisibleStyle: {
    outlineWidth: 0,
    borderWidth: 2,
    borderColor: '$accentColor',
  },

  focusStyle: {
    borderWidth: 2,
    borderColor: '$accentColor',
  },
})

export type InputProps = GetProps<typeof Input>
