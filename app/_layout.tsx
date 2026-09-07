import './root.css'

import { Slot, Stack } from 'one'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { isWeb } from 'tamagui'
import { YStack } from 'tamagui'

import { usePlayfulFonts } from '~/features/fonts/useFonts'
import { PlatformSpecificRootProvider } from '~/interface/platform/PlatformSpecificRootProvider'
import { TamaguiRootProvider } from '~/tamagui/TamaguiRootProvider'

export function Layout() {
  const { fontsLoaded } = usePlayfulFonts()

  if (!fontsLoaded) {
    return null
  }

  return (
    <html lang="en-US">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta property="og:image" content={`${process.env.ONE_SERVER_URL}/og.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={`${process.env.ONE_SERVER_URL}/og.jpg`} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
        />
        <link rel="icon" href="/favicon.svg" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>

      <body>
        <div style={{ display: 'contents' }} data-testid="app-container">
          <PlatformSpecificRootProvider>
            <TamaguiRootProvider>
              <SafeAreaProvider>
                {isWeb ? (
                  <YStack flex={1}>
                    <Slot />
                  </YStack>
                ) : (
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(app)" />
                  </Stack>
                )}
              </SafeAreaProvider>
            </TamaguiRootProvider>
          </PlatformSpecificRootProvider>
        </div>
      </body>
    </html>
  )
}
