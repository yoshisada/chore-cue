#!/usr/bin/env bun

/**
 * @description Upgrade packages by name (tamagui, one, zero, better-auth)
 */

import { $ } from 'bun'

const PACKAGES: Record<string, string[]> = {
  tamagui: ['tamagui', '@tamagui/*'],
  one: ['one', '@vxrn/*'],
  zero: ['@rocicorp/zero'],
  'better-auth': ['better-auth', '@better-auth/*'],
}

const args = process.argv.slice(2)
const target = args[0]
const extraArgs = args.slice(1)

if (!target) {
  console.info('Usage: bun scripts/up.ts <target> [options]')
  console.info(`Available targets: ${Object.keys(PACKAGES).join(', ')}`)
  process.exit(target ? 0 : 1)
}

const packages = PACKAGES[target]
if (!packages) {
  console.error(`Unknown target: ${target}`)
  console.error(`Available targets: ${Object.keys(PACKAGES).join(', ')}`)
  process.exit(1)
}

await $`bun update ${packages} ${extraArgs}`
