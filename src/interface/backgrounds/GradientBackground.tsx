import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, View } from 'tamagui'

interface GradientBackgroundProps {
  useImage?: boolean
  useInsets?: boolean
  children?: React.ReactNode
}

export const GradientBackground = ({
  useInsets = true,
  children,
}: GradientBackgroundProps) => {
  const inset = useSafeAreaInsets()
  const theme = useTheme()

  return (
    <View flex={1} bg={theme.background.val} pb={useInsets ? inset.bottom : 0}>
      {children}
    </View>
  )
}
