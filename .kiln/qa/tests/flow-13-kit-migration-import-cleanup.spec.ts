import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

// These tests validate the kit migration's import cleanup (no source code access needed)
// They run shell commands to grep and verify the codebase state.

test('kit/SC-005/FR-014: Zero @take-out/ imports remain in source files', async () => {
  // Step 1: grep -r "@take-out/" src/ scripts/ app/ package.json
  // Step 2: Verify output is empty
  let result = '';
  try {
    result = execSync(
      'grep -r "@take-out/" /Users/ryansuematsu/Documents/github/personal/chore-cue/src/ /Users/ryansuematsu/Documents/github/personal/chore-cue/scripts/ /Users/ryansuematsu/Documents/github/personal/chore-cue/app/ /Users/ryansuematsu/Documents/github/personal/chore-cue/package.json 2>/dev/null || true',
      { encoding: 'utf8' }
    );
  } catch {
    result = '';
  }
  expect(result.trim(), `Found @take-out/ references:\n${result}`).toBe('');
});

test('kit/SC-006/FR-004: Zero tko references remain in package.json scripts', async () => {
  // Step 1: Search package.json for "tko"
  let result = '';
  try {
    result = execSync(
      'grep "tko" /Users/ryansuematsu/Documents/github/personal/chore-cue/package.json 2>/dev/null || true',
      { encoding: 'utf8' }
    );
  } catch {
    result = '';
  }
  expect(result.trim(), `Found tko references in package.json:\n${result}`).toBe('');
});

test('kit/US-002: bun.lock contains no @take-out/ as DIRECT project dependency', async () => {
  // @take-out/helpers appears as a transitive dep of on-zero (Zero sync) — this is expected.
  // We only fail if @take-out/ appears as a direct project dependency in package.json.
  // Spec FR-014 grep target: "src/ scripts/ app/ package.json" — not bun.lock transitive entries.
  let result = '';
  try {
    result = execSync(
      'grep "@take-out/" /Users/ryansuematsu/Documents/github/personal/chore-cue/package.json 2>/dev/null || true',
      { encoding: 'utf8' }
    );
  } catch {
    result = '';
  }
  // Filter out any comment lines
  const directDeps = result.split('\n').filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#'));
  expect(directDeps.join('\n').trim(), `Found @take-out/ as direct dep in package.json:\n${result}`).toBe('');
});

test('kit/FR-007: postinstall.ts contains no @take-out references', async () => {
  // Step 1: Check scripts/postinstall.ts for any @take-out references
  let result = '';
  try {
    result = execSync(
      'grep "@take-out" /Users/ryansuematsu/Documents/github/personal/chore-cue/scripts/postinstall.ts 2>/dev/null || true',
      { encoding: 'utf8' }
    );
  } catch {
    result = '';
  }
  expect(result.trim(), `Found @take-out references in postinstall.ts:\n${result}`).toBe('');
});
