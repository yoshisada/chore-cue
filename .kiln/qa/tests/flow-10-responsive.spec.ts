import { test, expect } from '@playwright/test'

import {
  LIGHT_BACKGROUND,
  LOGIN_PATH,
  backgroundColorsInUse,
  hasNoHorizontalOverflow,
  hexToCssRgb,
} from './support/ui'

/**
 * FR-020 / SC-008 — the app renders without breaking at tablet and phone
 * widths. each test sets its own viewport so the result does not depend on
 * which playwright project is running it.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

const viewports = [
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
]

for (const viewport of viewports) {
  test(`FR-020: the app renders at the ${viewport.name} viewport (${viewport.width}x${viewport.height})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

    const heading = page.getByRole('heading', { name: /Login to ChoreCue/ })
    await expect(heading).toBeVisible()

    const box = await heading.boundingBox()
    expect(box?.width ?? 0).toBeLessThanOrEqual(viewport.width)

    await expect(page.getByRole('button', { name: 'Continue with Email' })).toBeVisible()
    expect(await hasNoHorizontalOverflow(page), 'the page scrolls sideways').toBe(true)
    expect(await backgroundColorsInUse(page)).toContain(hexToCssRgb(LIGHT_BACKGROUND))
  })
}

test('SC-008: the app boots on web and serves a titled page', async ({ page }) => {
  const response = await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  expect(response?.status() ?? 0).toBeLessThan(400)
  await expect(page).not.toHaveTitle('')
  await expect(page.getByRole('heading', { name: /Login to ChoreCue/ })).toBeVisible()
})
