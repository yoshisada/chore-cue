import { test, expect } from '@playwright/test'

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test('US-2: Completion animation plays on web (300-500ms)', async ({ page }) => {
  // TODO: Complete a chore, verify visible animation
  await page.goto('/')
  // Step 1: Find a due chore
  // Step 2: Click complete button
  // Step 3: Verify animation plays within 500ms
})

test('US-2: Completion animation is non-blocking', async ({ page }) => {
  // TODO: Complete chore, immediately interact with another element
  await page.goto('/')
})

test('US-2: Completion animation uses CSS driver on web', async ({ page }) => {
  // TODO: Inspect that animation uses CSS transitions/keyframes
  await page.goto('/')
})
