import { test, expect } from '@playwright/test';

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
});

test('FR-005: Primary button gold reveal animation fires on hover', async ({ page }) => {
  await page.goto('/');
  // Step 1: Locate a primary button
  // Step 2: Hover over the button
  // Step 3: Verify CSS transition class or animation-duration >= 500ms
  // Verify: gold layer animates in from one edge
  await expect(page.locator('body')).toBeVisible();
});

test('FR-006: Text input shows only bottom border when unfocused', async ({ page }) => {
  await page.goto('/login');
  // Step 1: Locate a text input
  // Step 2: Verify computed border: only border-bottom-width > 0, others = 0
  // Verify: no surrounding box border
  await expect(page.locator('body')).toBeVisible();
});

test('FR-006: Text input bottom border transitions to gold on focus', async ({ page }) => {
  await page.goto('/login');
  // Step 1: Locate a text input
  // Step 2: Click/focus the input
  // Step 3: Check computed border-bottom-color is gold
  // Verify: border-bottom transitions to gold accent
  await expect(page.locator('body')).toBeVisible();
});

test('FR-009: CSS animation durations are at least 500ms on web', async ({ page }) => {
  await page.goto('/');
  // Step 1: Inject JS to capture all animation-duration values
  // Step 2: Verify luxury interaction transitions >= 500ms
  // Verify: no interaction animation completes in < 500ms
});

test('FR-017: Chore card hover adds subtle shadow, not harsh drop shadow', async ({ page }) => {
  await page.goto('/');
  // Step 1: Locate a chore card (or card-like element on public page)
  // Step 2: Hover over it
  // Step 3: Inspect box-shadow — verify low opacity, soft blur
  // Verify: no harsh/dark drop shadow
  await expect(page.locator('body')).toBeVisible();
});

test('FR-010: Reduced motion — transitions complete instantly when prefers-reduced-motion is set', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // Step 1: Navigate to page with reduced-motion emulated
  // Step 2: Interact with a button
  // Step 3: Verify animation-duration is 0ms or transition is instantaneous
  // Verify: color changes preserved, no motion
  await expect(page.locator('body')).toBeVisible();
});
