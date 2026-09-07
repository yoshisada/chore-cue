import { styled, YStack } from 'tamagui'

export const PageContainer = styled(YStack, {
  position: 'relative',
  mx: 'auto',
  flex: 1,
  flexBasis: 'auto',
  px: '$6',
  width: '100%',
  minW: 380,

  $md: {
    maxW: 760,
  },

  $lg: {
    maxW: 860,
  },

  $xl: {
    maxW: 1140,
  },
})

export const PageMainContainer = styled(PageContainer, {
  render: 'main',
  role: 'main',
})
