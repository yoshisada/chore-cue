import { test, expect } from '@playwright/test'

import {
  MEMBERS_PATH,
  computedStyle,
  hexToCssRgb,
  loginAsDemo,
  memberAccentColors,
  pixels,
} from './support/ui'

/**
 * FR-018 — the members page shows people prominently: larger avatars than the
 * board's, each ringed in its own accent colour.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test.describe.configure({ timeout: 90_000 })

test('FR-018: member avatars are large and carry the accent palette', async ({
  page,
}) => {
  await loginAsDemo(page, MEMBERS_PATH)

  const avatars = page.getByTestId('member-avatar')
  await expect(avatars.first()).toBeVisible()

  const total = await avatars.count()
  expect(total, 'the household should list at least one member').toBeGreaterThan(0)

  const accents = memberAccentColors.map((colour) => hexToCssRgb(colour))

  for (let index = 0; index < total; index += 1) {
    const avatar = avatars.nth(index)
    const box = await avatar.boundingBox()

    // members-page avatars are the "lg" size — bigger than the 36px board ones
    expect(box?.width ?? 0, `member avatar #${index} width`).toBeGreaterThanOrEqual(44)

    const ring = avatar.locator('xpath=..')
    expect(pixels(await computedStyle(ring, 'outline-width'))).toBeGreaterThan(0)
    expect(accents).toContain(await computedStyle(ring, 'outline-color'))
  }

  // the accent is assigned by roster position
  const firstRing = avatars.first().locator('xpath=..')
  expect(await computedStyle(firstRing, 'outline-color')).toBe(accents[0])
})
