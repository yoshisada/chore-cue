#!/usr/bin/env bun

/**
 * @description npm postinstall tasks
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { $ } from 'bun'

// patch react-native deepFreezeAndThrowOnMutationInDev to warn instead of throw
// tamagui's styled() components mutate ref-like { current: ... } objects that
// get caught by RN's recursive dev-mode prop freezing
try {
  const rnFreezePath = join(
    require.resolve('react-native/package.json'),
    '../Libraries/Utilities/deepFreezeAndThrowOnMutationInDev.js',
  )
  const freezeSource = readFileSync(rnFreezePath, 'utf-8')
  if (freezeSource.includes('throw Error(')) {
    writeFileSync(
      rnFreezePath,
      freezeSource.replace(
        'throw Error(',
        'console.warn(',
      ),
    )
    console.info('Patched react-native deepFreezeAndThrowOnMutationInDev (warn instead of throw)')
  }
} catch {
  // ignore if file not found
}

await $`bun run one patch`
