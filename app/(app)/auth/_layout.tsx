import { Slot, Stack } from 'one'
import { isWeb } from 'tamagui'

export function AuthAndOnboardingLayout() {
  return (
    <>
      {isWeb ? (
        <Slot />
      ) : (
        <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
          <Stack.Screen name="login" />
          <Stack.Screen name="login/password" />
          <Stack.Screen name="signup/[method]" />
        </Stack>
      )}
    </>
  )
}
