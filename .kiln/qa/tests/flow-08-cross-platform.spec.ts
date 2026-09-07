import { test, expect } from '@playwright/test'

import {
  LIGHT_BACKGROUND,
  LOGIN_PATH,
  backgroundColorsInUse,
  computedStyle,
  hexToCssRgb,
  pixels,
} from './support/ui'

/**
 * US-6 — the web build renders the same visual language as native: warm
 * palette, Inter, rounded shapes, CSS-driven motion.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test('US-6: the web build renders the playful theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: /Login to ChoreCue/ })).toBeVisible()
  expect(await backgroundColorsInUse(page)).toContain(hexToCssRgb(LIGHT_BACKGROUND))

  const button = page.getByRole('button', { name: 'Continue with Email' })
  expect(await computedStyle(button, 'font-family')).toContain('Inter')
  expect(pixels(await computedStyle(button, 'border-top-left-radius'))).toBeGreaterThan(0)
})

test('US-6: Inter is delivered through a CSS font stylesheet on web', async ({
  page,
}) => {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const fontHrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(
      (link) => link.getAttribute('href') ?? ''
    )
  )
  expect(
    fontHrefs.some(
      (href) => href.includes('fonts.googleapis.com') && href.includes('Inter')
    ),
    `no Inter stylesheet among ${JSON.stringify(fontHrefs)}`
  ).toBe(true)

  const rootBodyFont = await page.evaluate(() =>
    window.getComputedStyle(document.documentElement).getPropertyValue('--font-body')
  )
  expect(rootBodyFont).toContain('Inter')
})

test('US-6: motion on web runs through CSS transitions', async ({ page }) => {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const button = page.getByRole('button', { name: 'Continue with Email' })
  await expect(button).toBeVisible()

  const durations = (await computedStyle(button, 'transition-duration'))
    .split(',')
    .map((value) => Number.parseFloat(value))
    .filter((value) => !Number.isNaN(value))

  expect(durations.length, 'no CSS transition on a primary action').toBeGreaterThan(0)
  expect(Math.max(...durations)).toBeGreaterThan(0)
})
