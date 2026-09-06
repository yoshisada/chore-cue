import { test, expect } from '@playwright/test'

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test('FR-019: Auth login — rounded styling', async ({ page }) => {
  // BLOCKED: Requires credentials
  test.skip(true, 'Blocked: requires test credentials in .env.test')
  await page.goto('/auth/login')
})

test('FR-019: Auth signup — rounded styling', async ({ page }) => {
  // BLOCKED: Requires credentials
  test.skip(true, 'Blocked: requires test credentials in .env.test')
  await page.goto('/auth/signup')
})
