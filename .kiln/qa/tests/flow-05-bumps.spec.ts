import { test, expect } from '@playwright/test';

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
});

test.skip('Phase1/FR-013: Send polite bump — stays associated with chore and assignee — requires credentials', async ({ page }) => {
  // blocked:credentials
  await page.goto('/');
  // Step 1: Log in
  // Step 2: Find a chore assigned to another household member
  // Step 3: Tap the bump action
  // Verify: bump sent with polite reminder wording; associated with that chore
});

test.skip('Phase1/FR-013: Bump daily limit — first 5 bumps accepted — requires credentials', async ({ page }) => {
  // blocked:credentials
  await page.goto('/');
  // Step 1: Log in
  // Step 2: Send bumps 1 through 5 for the same chore/day
  // Verify: all 5 bumps accepted
});

test.skip('Phase1/FR-014: Bump daily limit — 6th bump blocked — requires credentials', async ({ page }) => {
  // blocked:credentials
  await page.goto('/');
  // Step 1: Log in, send 5 bumps
  // Step 2: Attempt 6th bump
  // Verify: system blocks the 6th bump
});
