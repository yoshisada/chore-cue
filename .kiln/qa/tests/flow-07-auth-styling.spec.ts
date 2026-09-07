import { test, expect } from '@playwright/test'

import {
  LIGHT_BACKGROUND,
  LOGIN_PATH,
  SIGNUP_PATH,
  backgroundColorsInUse,
  computedStyle,
  hexToCssRgb,
  pixels,
} from './support/ui'

/**
 * FR-019 — the auth screens wear the same playful styling as the app.
 *
 * these no longer need credentials: both screens render before any session
 * exists, so the styling is inspectable directly.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test('FR-019: the login screen uses rounded controls on the warm palette', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: /Login to ChoreCue/ })).toBeVisible()

  const button = page.getByRole('button', { name: 'Continue with Email' })
  await expect(button).toBeVisible()
  expect(pixels(await computedStyle(button, 'border-top-left-radius'))).toBeGreaterThan(0)
  expect(await computedStyle(button, 'font-family')).toContain('Inter')

  expect(await backgroundColorsInUse(page)).toContain(hexToCssRgb(LIGHT_BACKGROUND))
})

test('FR-019: the email signup screen uses a rounded input and a rounded action', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(SIGNUP_PATH, { waitUntil: 'domcontentloaded' })

  const input = page.locator('[data-testid="email-input"]')
  const next = page.locator('[data-testid="next-button"]')

  await expect(input).toBeVisible()
  await expect(next).toBeVisible()

  expect(pixels(await computedStyle(input, 'border-top-left-radius'))).toBeGreaterThan(0)
  expect(pixels(await computedStyle(next, 'border-top-left-radius'))).toBeGreaterThan(0)
  expect(await computedStyle(input, 'font-family')).toContain('Inter')

  // the action stays disabled until an address is typed
  await expect(next).toBeDisabled()
  await input.fill('qa@example.com')
  await expect(next).toBeEnabled()
})
