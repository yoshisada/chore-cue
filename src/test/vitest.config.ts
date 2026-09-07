import { join, resolve } from 'node:path'

import { tamaguiPlugin } from '@tamagui/vite-plugin'
import { defineConfig } from 'vitest/config'

const rootDir = resolve(__dirname, '..', '..')

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/test/unit/**/*.test.ts',
      'src/test/unit/**/*.test.tsx',
      'packages/*/src/**/*.test.ts',
      'packages/*/src/**/*.test.tsx',
    ],
    outputFile: {
      json: 'src/test/unit/.output/results.json',
    },
    reporters: ['default', 'json'],
    logHeapUsage: false,
    disableConsoleIntercept: true,
    testTimeout: 10_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      include: [
        'src/features/chorecue/boardState.ts',
        'src/features/chorecue/choreRules.ts',
        'src/features/chorecue/recurrence.ts',
        'src/features/chorecue/starterChores.ts',
        'src/features/chorecue/timezone.ts',
        'src/features/auth/householdContext.ts',
        'src/features/members/memberState.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 80,
      },
    },
  },

  resolve: {
    alias: {
      '~': resolve(rootDir, 'src'),
    },
  },

  plugins: [
    tamaguiPlugin({
      disableExtraction: true,
      disableInitialBuild: true,
      useReactNativeWebLite: true,
      components: ['tamagui'],
      config: join(rootDir, 'src/tamagui/tamagui.config.ts'),
    }),
  ],
})
