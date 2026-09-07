import { Slot } from 'one'
import { Spacer, YStack } from 'tamagui'

import { MainHeader } from '~/features/app/MainHeader'

export function TabsLayout() {
  return (
    <YStack flex={1}>
      <MainHeader />
      <Spacer height={50} />
      <YStack flex={1}>
        <Slot />
      </YStack>
    </YStack>
  )
}
