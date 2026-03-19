import { SizableText, View, YStack } from 'tamagui'

import { CameraIcon } from '~/interface/icons/phosphor/CameraIcon'

export function PhotoThumbnail({ label }: { label: string }) {
  return (
    <YStack gap="$1" items="center" width={48}>
      <View
        width={48}
        height={48}
        bg="$color3"
        items="center"
        justify="center"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <CameraIcon size={20} color="$color8" />
      </View>
      <SizableText
        fontFamily="$body"
        size="$1"
        color="$color8"
        numberOfLines={1}
        maxWidth={48}
      >
        {label}
      </SizableText>
    </YStack>
  )
}
