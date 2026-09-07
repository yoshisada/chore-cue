import { Separator, SizableText, XStack, styled } from 'tamagui'

import type { ReactNode } from 'react'

export const H1 = styled(SizableText, {
  render: 'h1',
  role: 'heading',
  fontFamily: '$heading',
  size: '$10',
  fontWeight: '700',
  color: '$color',
})

export const H2 = styled(SizableText, {
  render: 'h2',
  role: 'heading',
  fontFamily: '$heading',
  size: '$9',
  fontWeight: '700',
  color: '$color',
})

export const H3 = styled(SizableText, {
  render: 'h3',
  role: 'heading',
  fontFamily: '$heading',
  size: '$8',
  fontWeight: '600',
  color: '$color',
})

export const H4 = styled(SizableText, {
  render: 'h4',
  role: 'heading',
  fontFamily: '$heading',
  size: '$6',
  fontWeight: '600',
  color: '$color',
})

export const H5 = styled(SizableText, {
  render: 'h5',
  role: 'heading',
  fontFamily: '$heading',
  size: '$5',
  fontWeight: '500',
  color: '$color',
})

export const H6 = styled(SizableText, {
  render: 'h6',
  role: 'heading',
  fontFamily: '$heading',
  size: '$4',
  fontWeight: '500',
  color: '$color',
})

export const SubHeading = styled(SizableText, {
  fontFamily: '$body',
  size: '$5',
  color: '$color8',
  fontWeight: '300',

  $lg: {
    size: '$6',
  },
})

export const SepHeading = ({ children }: { children: ReactNode }) => {
  return (
    <XStack mt="$6" mb="$4" items="center" gap="$6">
      <H3 size="$4" color="$color8">
        {children}
      </H3>
      <Separator borderColor="$borderColor" opacity={0.5} />
    </XStack>
  )
}
