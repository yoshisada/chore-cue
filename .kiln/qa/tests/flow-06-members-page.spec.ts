import { test, expect } from '@playwright/test';

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
});

test('FR-018: Members page — larger avatars + accent colors', async ({ page }) => {
  await page.goto('/');
  // TODO: Navigate to members page, verify avatar size and accent colors
});
