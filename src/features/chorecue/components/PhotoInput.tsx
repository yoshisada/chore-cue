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
    <YStack gap="$2">
      <Paragraph opacity={0.8}>
        {photoLabel ? `Attached photo: ${photoLabel}` : 'No photo attached'}
      </Paragraph>
      <XStack gap="$2" flexWrap="wrap">
        <Button size="$4" variant="outlined" onPress={onPickSample}>
          Attach sample photo
        </Button>
        <Button size="$4" theme="gray" variant="outlined" onPress={onClear}>
          Clear photo
        </Button>
      </XStack>
    </YStack>
  )
}

