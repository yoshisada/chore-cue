import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Separator, SizableText, XStack, YStack, isWeb } from 'tamagui'

import { APP_NAME_LOWERCASE } from '~/constants/app'
import { useAuth } from '~/features/auth/client/authClient'
import { useHouseholdContext } from '~/features/auth/client/useHouseholdContext'
import { useLogout } from '~/features/auth/useLogout'
import { Avatar } from '~/interface/avatars/Avatar'
import { Button } from '~/interface/buttons/Button'
import { PageContainer } from '~/interface/layout/PageContainer'
import { H1 } from '~/interface/text/Headings'
import { ThemeSwitch, useToggleTheme } from '~/interface/theme/ThemeSwitch'

function SectionLabel({ children }: { children: string }) {
  return (
    <SizableText
      fontFamily="$body"
      size="$2"
      fontWeight="600"
      letterSpacing={3}
      textTransform="uppercase"
      color="$color8"
    >
      {children}
    </SizableText>
  )
}

export function ProfileSettingsPage() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const household = useHouseholdContext()
  const { logout } = useLogout()
  const { setting } = useToggleTheme()

  const displayName = user?.name || user?.username || 'User'
  const email = user?.email || ''
  const themeLabel = setting === 'system' ? 'System' : setting === 'dark' ? 'Dark' : 'Light'

  const Container = isWeb ? YStack : ScrollView

  return (
    <Container flex={1} bg="$background" {...(!isWeb && { contentContainerStyle: { paddingBottom: insets.bottom + 40 } })}>
      <PageContainer>
        <YStack gap="$6" py="$5">
          {/* Hero — profile card */}
          <YStack gap="$1">
            <H1 size="$8">
              Your{' '}
              <SizableText
                fontFamily="$heading"
                size="$8"
                fontWeight="700"
                fontStyle="italic"
                color="$color12"
              >
                Profile
              </SizableText>
            </H1>
          </YStack>

          <XStack
            borderTopWidth={2}
            borderTopColor="$color12"
            pt="$5"
            gap="$4"
            items="center"
          >
            <Avatar image={user?.image} name={displayName} size="xl" />
            <YStack flex={1} gap="$1">
              <SizableText fontFamily="$heading" size="$6" fontWeight="600">
                {displayName}
              </SizableText>
              {email ? (
                <SizableText fontFamily="$body" size="$2" color="$color8">
                  {email}
                </SizableText>
              ) : null}
              <SizableText fontFamily="$body" size="$2" color="$color8">
                {household.householdId}
              </SizableText>
            </YStack>
          </XStack>

          {/* Appearance */}
          <YStack gap="$3">
            <SectionLabel>Appearance</SectionLabel>
            <Separator />
            <XStack
              justify="space-between"
              items="center"
              py="$2"
            >
              <YStack gap="$1">
                <SizableText fontFamily="$body" size="$5">
                  Theme
                </SizableText>
                <SizableText fontFamily="$body" size="$2" color="$color8">
                  {themeLabel}
                </SizableText>
              </YStack>
              <ThemeSwitch size="$3" />
            </XStack>
          </YStack>

          {/* Account */}
          <YStack gap="$3">
            <SectionLabel>Account</SectionLabel>
            <Separator />
            <YStack pt="$2">
              <Button variant="outlined" onPress={logout}>
                Log out
              </Button>
            </YStack>
          </YStack>

          {/* Footer */}
          <YStack items="center" pt="$8" pb="$4">
            <SizableText fontFamily="$heading" size="$2" color="$color8" fontWeight="600">
              {APP_NAME_LOWERCASE}
            </SizableText>
            <SizableText fontFamily="$body" size="$1" color="$color8">
              v1.0.0
            </SizableText>
          </YStack>
        </YStack>
      </PageContainer>
    </Container>
  )
}
