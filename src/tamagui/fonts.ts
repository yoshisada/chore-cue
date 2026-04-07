import { createFont } from 'tamagui'
import { createSystemFont, fonts as baseFonts } from '@tamagui/config/v5'

const mono = createSystemFont({
  sizeLineHeight: (size) => (size >= 16 ? size * 1.2 + 8 : size * 1.15 + 5),
  font: {
    family: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
    weight: {
      0: '400',
    },
  },
})

const heading = createFont({
  family: '"Inter", system-ui, -apple-system, sans-serif',
  size: baseFonts.heading.size,
  lineHeight: {
    1: 18,
    2: 22,
    3: 26,
    4: 30,
    5: 34,
    6: 38,
    7: 44,
    8: 52,
    9: 60,
    10: 68,
    11: 78,
    12: 90,
    13: 102,
    14: 116,
    15: 132,
    16: 148,
  },
  weight: {
    3: '300', // Light (Inter supports 300)
    4: '400', // Regular
    5: '500', // Medium
    6: '600', // SemiBold
    7: '700', // Bold
  },
  letterSpacing: baseFonts.heading.letterSpacing,
  face: {
    300: { normal: 'Inter_300Light' },
    400: { normal: 'Inter_400Regular' },
    500: { normal: 'Inter_500Medium' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' },
  },
})

const body = createFont({
  family: '"Inter", system-ui, -apple-system, sans-serif',
  size: baseFonts.body.size,
  lineHeight: {
    // Relaxed line heights for readability
    1: 18,
    2: 22,
    3: 26,
    4: 30,
    5: 34,
    6: 38,
    7: 44,
    8: 52,
    9: 60,
    10: 68,
    11: 78,
    12: 90,
    13: 102,
    14: 116,
    15: 132,
    16: 148,
  },
  weight: {
    3: '300', // Light
    4: '400', // Regular
    5: '500', // Medium
    6: '600', // SemiBold
    7: '700', // Bold
  },
  letterSpacing: baseFonts.body.letterSpacing,
  face: {
    300: { normal: 'Inter_300Light' },
    400: { normal: 'Inter_400Regular' },
    500: { normal: 'Inter_500Medium' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' },
  },
})

export const fonts = {
  heading,
  body,
  mono,
}
