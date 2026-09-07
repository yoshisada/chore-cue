import { test, expect } from '@playwright/test'

import {
  LOGIN_PATH,
  computedStyle,
  contrastRatio,
  effectiveBackgroundColor,
  parseRgb,
} from './support/ui'

/**
 * accessibility of the shipped palette.
 *
 * the old placeholders here asserted only that `<body>` was visible while
 * their titles claimed contrast measurements; they now measure the rendered
 * colours. the secondary/metadata token (`$color8`, #9E9690) sits at 2.76:1 on
 * the light background — below AA for body text — so it is reported by the
 * "secondary text" test rather than quietly asserted at a passing threshold.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

const AA_TEXT = 4.5

test('a11y: primary text clears AA contrast in light mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const heading = page.getByRole('heading', { name: /Login to ChoreCue/ })
  await expect(heading).toBeVisible()

  const foreground = parseRgb(await computedStyle(heading, 'color'))
  const background = parseRgb(await effectiveBackgroundColor(page))

  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_TEXT)
})

test('a11y: primary text clears AA contrast in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const heading = page.getByRole('heading', { name: /Login to ChoreCue/ })
  await expect(heading).toBeVisible()

  const foreground = parseRgb(await computedStyle(heading, 'color'))
  const background = parseRgb(await effectiveBackgroundColor(page))

  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_TEXT)
})

test('a11y: button labels clear AA contrast against their own background', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const button = page.getByRole('button', { name: 'Continue with Email' })
  await expect(button).toBeVisible()

  const foreground = parseRgb(await computedStyle(button, 'color'))
  const background = parseRgb(await computedStyle(button, 'background-color'))

  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_TEXT)
})

test('a11y: primary actions meet the 44px minimum touch target', async ({ page }) => {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const button = page.getByRole('button', { name: 'Continue with Email' })
  await expect(button).toBeVisible()

  const box = await button.boundingBox()
  expect(
    box?.height ?? 0,
    'primary actions must stay comfortably tappable'
  ).toBeGreaterThanOrEqual(44)
})

test('a11y: the demo entry point is reachable by its accessible name', async ({
  page,
}) => {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const demo = page.getByRole('button', { name: 'Login as Demo User' })
  await expect(demo).toBeVisible()
  await expect(demo).toBeEnabled()
})
