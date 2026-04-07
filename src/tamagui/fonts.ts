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
  family: '"Playfair Display", "Georgia", "Times New Roman", serif',
  size: baseFonts.heading.size,
  lineHeight: {
    // Tighter line heights for editorial feel
    1: 16,
    2: 20,
    3: 24,
    4: 28,
    5: 32,
    6: 36,
    7: 42,
    8: 48,
    9: 56,
    10: 64,
    11: 72,
    12: 84,
    13: 96,
    14: 112,
    15: 128,
    16: 144,
  },
  weight: {
    3: '400', // Regular (Playfair Display has no 300 weight)
    4: '400', // Regular
    5: '500', // Medium
    6: '600', // SemiBold
    7: '700', // Bold
  },
  letterSpacing: baseFonts.heading.letterSpacing,
  face: {
    300: { normal: 'PlayfairDisplay_400Regular', italic: 'PlayfairDisplay_400Regular_Italic' },
    400: { normal: 'PlayfairDisplay_400Regular', italic: 'PlayfairDisplay_400Regular_Italic' },
    500: { normal: 'PlayfairDisplay_500Medium', italic: 'PlayfairDisplay_500Medium_Italic' },
    600: { normal: 'PlayfairDisplay_600SemiBold', italic: 'PlayfairDisplay_600SemiBold_Italic' },
    700: { normal: 'PlayfairDisplay_700Bold', italic: 'PlayfairDisplay_700Bold_Italic' },
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
