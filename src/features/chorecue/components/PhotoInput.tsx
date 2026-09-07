import { Paragraph, XStack, YStack } from 'tamagui'

import { Button } from '~/interface/buttons/Button'

export function PhotoInput({
  photoLabel,
  onPickSample,
  onClear,
}: {
  photoLabel: string
  onPickSample: () => void
  onClear: () => void
}) {
  return (
    <YStack gap="$3">
      <Paragraph fontFamily="$body" color="$color8" size="$2">
        {photoLabel ? `Attached photo: ${photoLabel}` : 'No photo attached'}
      </Paragraph>
      <XStack gap="$3" flexWrap="wrap">
        <Button size="$4" variant="outlined" onPress={onPickSample}>
          Attach sample photo
        </Button>
        <Button size="$4" variant="outlined" onPress={onClear}>
          Clear photo
        </Button>
      </XStack>
    </YStack>
  )
}
