import { test, expect } from '@playwright/test'

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test('US-3: Member avatar on chore cards (32px+)', async ({ page }) => {
  // TODO: View chore board, verify assigned member avatar >=32px
  await page.goto('/')
})

test('US-3: Member accent colors — distinct per member', async ({ page }) => {
  // TODO: View avatars for 2+ members, verify distinct accent colors
  await page.goto('/')
})

test('US-3: Member avatars in header/nav', async ({ page }) => {
  // TODO: Verify member avatars visible in header area
  await page.goto('/')
})
