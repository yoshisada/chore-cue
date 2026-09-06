import { execFileSync } from 'child_process'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { test, expect } from '@playwright/test'

// These tests validate the kit migration's import cleanup (no source code access needed)
// They run shell commands to grep and verify the codebase state.

// Resolved from this spec's own location so the greps target the repo under test on
// any machine (CI, container, fresh clone) rather than one hardcoded checkout.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

// Self-check: a missing target would make an "empty grep output" assertion vacuous.
function repoPath(relativePath: string): string {
  const absolutePath = resolve(repoRoot, relativePath)
  expect(
    existsSync(absolutePath),
    `Grep target missing from repo root ${repoRoot}: ${relativePath}`
  ).toBe(true)
  return absolutePath
}

// grep exits 1 when there are no matches (the passing case); any other non-zero
// status is a tooling failure and is surfaced instead of being swallowed.
function grepRepo(pattern: string, relativePaths: string[]): string {
  const targets = relativePaths.map(repoPath)
  try {
    return execFileSync('grep', ['-r', pattern, ...targets], { encoding: 'utf8' })
  } catch (error) {
    const { status, stderr } = error as { status?: number; stderr?: string }
    if (status === 1) return ''
    throw new Error(`grep "${pattern}" failed with status ${status}: ${stderr ?? error}`)
  }
}

test('kit/SC-005/FR-014: Zero @take-out/ imports remain in source files', async () => {
  // Step 1: grep -r "@take-out/" src/ scripts/ app/ package.json
  // Step 2: Verify output is empty
  const result = grepRepo('@take-out/', ['src', 'scripts', 'app', 'package.json'])
  expect(result.trim(), `Found @take-out/ references:\n${result}`).toBe('')
})

test('kit/SC-006/FR-004: Zero tko references remain in package.json scripts', async () => {
  // Step 1: Search package.json for "tko"
  const result = grepRepo('tko', ['package.json'])
  expect(result.trim(), `Found tko references in package.json:\n${result}`).toBe('')
})

test('kit/US-002: bun.lock contains no @take-out/ as DIRECT project dependency', async () => {
  // @take-out/helpers appears as a transitive dep of on-zero (Zero sync) — this is expected.
  // We only fail if @take-out/ appears as a direct project dependency in package.json.
  // Spec FR-014 grep target: "src/ scripts/ app/ package.json" — not bun.lock transitive entries.
  const result = grepRepo('@take-out/', ['package.json'])
  // Filter out any comment lines
  const directDeps = result
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#'))
  expect(
    directDeps.join('\n').trim(),
    `Found @take-out/ as direct dep in package.json:\n${result}`
  ).toBe('')
})

test('kit/FR-007: postinstall.ts contains no @take-out references', async () => {
  // Step 1: Check scripts/postinstall.ts for any @take-out references
  const result = grepRepo('@take-out', ['scripts/postinstall.ts'])
  expect(result.trim(), `Found @take-out references in postinstall.ts:\n${result}`).toBe(
    ''
  )
})
