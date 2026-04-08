import { test, expect } from '@playwright/test';

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
});

test('US-1: Glanceable chore state colors — all 4 states visible', async ({ page }) => {
  // TODO: Navigate to chore board
  await page.goto('/');
  // Step 1: Verify overdue chore has coral/red indicator
  // Step 2: Verify due-soon chore has amber/yellow indicator
  // Step 3: Verify done chore has green indicator
  // Step 4: Verify upcoming chore has gray indicator
});

test('US-1: Chore state color contrast — light mode', async ({ page }) => {
  // TODO: Check WCAG AA contrast for state colors against light background
  await page.goto('/');
});

test('US-1: Chore state color contrast — dark mode', async ({ page }) => {
  // TODO: Toggle dark mode, check contrast
  await page.goto('/');
});

test('US-1: Chore state transition updates color', async ({ page }) => {
  // TODO: Observe state transition from due-soon to overdue
  await page.goto('/');
});
