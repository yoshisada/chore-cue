import { test, expect } from '@playwright/test'

import {
  DARK_BACKGROUND,
  LIGHT_BACKGROUND,
  LOGIN_PATH,
  SIGNUP_PATH,
  archiveChore,
  backgroundColorsInUse,
  computedStyle,
  createTemporaryChore,
  effectiveBackgroundColor,
  fontFamiliesInUse,
  hexToCssRgb,
  isPureBlack,
  isPureWhite,
  loginAsDemo,
  parseRgb,
  pixels,
  uniqueTitle,
} from './support/ui'

/**
 * US-4 — the playful visual language: one sans-serif family, rounded corners,
 * and a warm palette in both schemes.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test.describe.configure({ timeout: 90_000 })

/** rounded, but neither square (the old editorial look) nor a pill */
const ROUNDED_MIN = 4
const ROUNDED_MAX = 20

test('US-4: Inter is the only typeface — no Playfair Display anywhere', async ({
  page,
}) => {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /Login to ChoreCue/ })).toBeVisible()

  const families = await fontFamiliesInUse(page)
  expect(families.length).toBeGreaterThan(0)

  for (const family of families) {
    expect(family.toLowerCase(), 'the editorial serif is gone').not.toContain('playfair')
    expect(family, `unexpected typeface: ${family}`).toContain('Inter')
  }
})

test('US-4: buttons have rounded corners', async ({ page }) => {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const button = page.getByRole('button', { name: 'Continue with Email' })
  await expect(button).toBeVisible()

  const radius = pixels(await computedStyle(button, 'border-top-left-radius'))
  expect(radius).toBeGreaterThanOrEqual(ROUNDED_MIN)
  expect(radius).toBeLessThanOrEqual(ROUNDED_MAX)
})

test('US-4: form inputs have rounded corners', async ({ page }) => {
  await page.goto(SIGNUP_PATH, { waitUntil: 'domcontentloaded' })

  const input = page.locator('[data-testid="email-input"]')
  await expect(input).toBeVisible()

  const radius = pixels(await computedStyle(input, 'border-top-left-radius'))
  expect(radius).toBeGreaterThanOrEqual(ROUNDED_MIN)
  expect(radius).toBeLessThanOrEqual(ROUNDED_MAX)
})

test('US-4: chore cards have rounded corners', async ({ page }) => {
  await loginAsDemo(page)

  const title = uniqueTitle('QA card radius')
  const card = await createTemporaryChore(page, title)

  const radius = pixels(await computedStyle(card, 'border-top-left-radius'))
  expect(radius).toBeGreaterThanOrEqual(ROUNDED_MIN)
  expect(radius).toBeLessThanOrEqual(ROUNDED_MAX)

  await archiveChore(page, title)
})

test('US-4: light mode is warm off-white, never pure white', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /Login to ChoreCue/ })).toBeVisible()

  const background = await effectiveBackgroundColor(page)
  expect(isPureWhite(parseRgb(background)), `background was ${background}`).toBe(false)
  expect(await backgroundColorsInUse(page)).toContain(hexToCssRgb(LIGHT_BACKGROUND))
})

test('US-4: dark mode is deep warm grey, never pure black', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /Login to ChoreCue/ })).toBeVisible()

  const background = await effectiveBackgroundColor(page)
  expect(isPureBlack(parseRgb(background)), `background was ${background}`).toBe(false)
  expect(await backgroundColorsInUse(page)).toContain(hexToCssRgb(DARK_BACKGROUND))
})

test('US-4: the settings theme toggle switches the app to the dark palette', async ({
  page,
}) => {
  // the toggle cycles light -> dark -> system, so from any starting point three
  // presses are enough to land on dark exactly once
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.emulateMedia({ colorScheme: 'light' })
  await loginAsDemo(page, '/home/settings')

  const toggle = page.getByRole('button', { name: 'Toggle theme' })
  await expect(toggle).toBeVisible({ timeout: 20_000 })

  let reachedDark = false
  for (let attempt = 0; attempt < 3 && !reachedDark; attempt += 1) {
    await toggle.click()
    reachedDark = (await backgroundColorsInUse(page)).includes(
      hexToCssRgb(DARK_BACKGROUND)
    )
  }

  expect(reachedDark, 'cycling the theme toggle never reached the dark palette').toBe(
    true
  )
})
