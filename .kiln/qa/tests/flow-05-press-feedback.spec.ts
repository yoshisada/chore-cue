import { test, expect } from '@playwright/test';

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
});

test('US-5: Press feedback on buttons', async ({ page }) => {
  await page.goto('/');
  // TODO: Press a button, verify scale-down or opacity change
});

test('US-5: Press feedback on chore cards', async ({ page }) => {
  await page.goto('/');
  // TODO: Press a chore card, verify press feedback
});

test('US-5: Press feedback on navigation tabs — rounded indicator', async ({ page }) => {
  await page.goto('/');
  // TODO: Tap nav tab, verify rounded active indicator (not underline)
});

test('FR-016: Navigation uses rounded pill indicator', async ({ page }) => {
  await page.goto('/');
  // TODO: Inspect active tab indicator shape
});
