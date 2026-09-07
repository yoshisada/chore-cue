import { router } from 'one'
import { useState } from 'react'
import { isWeb, Spinner, View, XStack, YStack } from 'tamagui'

import { APP_NAME } from '~/constants/app'
import { signInAsDemo } from '~/features/auth/client/signInAsDemo'
import { isDemoMode } from '~/helpers/isDemoMode'
import { Link } from '~/interface/app/Link'
import { LogoIcon } from '~/interface/app/LogoIcon'
import { Button } from '~/interface/buttons/Button'
import { AppleIcon } from '~/interface/icons/AppleIcon'
import { GoogleIcon } from '~/interface/icons/GoogleIcon'
import { H2 } from '~/interface/text/Headings'
import { showToast } from '~/interface/toast/helpers'

export const LoginPage = () => {
  const [demoLoading, setDemoLoading] = useState<boolean>(false)

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    showToast(`${provider} login coming soon!`, { type: 'info' })
  }

  return (
    <YStack
      flex={1}
      justify="center"
      items="center"
      $platform-web={{ minHeight: '100vh' }}
    >
      <View
        width={80}
        height={80}
        my="$4"
        items="center"
        justify="center"
        transition="playfulBounce"
        enterStyle={{ scale: 0.95, opacity: 0 }}
      >
        <LogoIcon size={42} />
      </View>

      <YStack
        gap="$6"
        width="100%"
        items="center"
        bg="$background"
        rounded="$4"
        p={isWeb ? '$6' : '$4'}
        maxW={isWeb ? 400 : '90%'}
      >
        <H2 text="center">Login to {APP_NAME}</H2>

        <YStack
          key="welcome-content"
          gap="$4"
          items="center"
          width="100%"
          transition="medium"
          enterStyle={{ opacity: 0, y: 10 }}
          exitStyle={{ opacity: 0, y: -10 }}
          position="relative"
          overflow="hidden"
        >
          <YStack width="100%" gap="$3">
            <Link
              href="/auth/signup/email"
              $platform-web={{
                display: 'contents',
              }}
              asChild
            >
              <Button
                size="$5"
                variant="floating"
                pressStyle={{
                  scale: 0.97,
                  opacity: 0.9,
                }}
                enterStyle={{ opacity: 0, scale: 0.95 }}
              >
                Continue with Email
              </Button>
            </Link>

            {/* DEMO mode - enabled in dev or when VITE_DEMO_MODE=1 */}
            {isDemoMode && (
              <Button
                variant="outlined"
                size="$5"
                onPress={async () => {
                  setDemoLoading(true)
                  const { error } = await signInAsDemo()
                  setDemoLoading(false)
                  if (error) {
                    showToast('Demo login failed', { type: 'error' })
                    return
                  }
                  router.replace('/home/feed')
                }}
                disabled={demoLoading}
                width="100%"
                data-testid="login-as-demo"
                pressStyle={{
                  scale: 0.97,
                }}
                enterStyle={{ opacity: 0, scale: 0.95 }}
              >
                {demoLoading ? <Spinner size="small" /> : 'Login as Demo User'}
              </Button>
            )}
          </YStack>

          <XStack width="100%" gap="$3" justify="center" overflow="visible">
            <Button
              size="$5"
              onPress={() => handleSocialLogin('google')}
              pressStyle={{
                scale: 0.97,
                bg: '$color2',
              }}
              hoverStyle={{
                bg: '$color2',
              }}
              enterStyle={{ opacity: 0, scale: 0.95 }}
              icon={<GoogleIcon size={18} />}
            />

            <Button
              size="$5"
              onPress={() => handleSocialLogin('apple')}
              pressStyle={{
                scale: 0.97,
                bg: '$color2',
              }}
              hoverStyle={{
                bg: '$color2',
              }}
              enterStyle={{ opacity: 0, scale: 0.95 }}
              icon={<AppleIcon size={20} />}
            />
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  )
}
