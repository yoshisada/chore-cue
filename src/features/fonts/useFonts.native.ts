import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'

/**
 * Native font loading hook.
 * Loads Inter font family via expo-google-fonts.
 * The splash screen should be held until fontsLoaded is true.
 */
export function usePlayfulFonts() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  return { fontsLoaded }
}
