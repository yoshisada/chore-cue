import { test, expect } from '@playwright/test'

import {
  archiveChore,
  computedStyle,
  createTemporaryChore,
  hexToCssRgb,
  loginAsDemo,
  memberAccentColors,
  pixels,
  uniqueTitle,
} from './support/ui'

/**
 * US-3 — member identity on the board.
 *
 * every avatar renders at a fixed size and carries its member's accent colour
 * as an outline ring, so both are measurable from computed styles.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test.describe.configure({ timeout: 90_000 })

const accentRgb = memberAccentColors.map((colour) => hexToCssRgb(colour))

test('US-3: the assignee avatar on a chore card is at least 32px', async ({ page }) => {
  await loginAsDemo(page)

  const title = uniqueTitle('QA avatar size')
  const card = await createTemporaryChore(page, title)

  const avatar = card.getByTestId('chore-card-avatar')
  await expect(avatar).toBeVisible()

  const box = await avatar.boundingBox()
  expect(box, 'the card avatar has no bounding box').not.toBeNull()
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(32)
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(32)

  await archiveChore(page, title)
})

test('US-3: card avatars wear an accent-colour ring from the member palette', async ({
  page,
}) => {
  await loginAsDemo(page)

  const title = uniqueTitle('QA avatar ring')
  const card = await createTemporaryChore(page, title)

  const avatar = card.getByTestId('chore-card-avatar')
  await expect(avatar).toBeVisible()

  // the ring lives on the avatar frame that wraps the image/icon square
  const ring = avatar.locator('xpath=..')
  expect(pixels(await computedStyle(ring, 'outline-width'))).toBeGreaterThan(0)
  expect(accentRgb).toContain(await computedStyle(ring, 'outline-color'))

  await archiveChore(page, title)
})

test('US-3: member avatars are visible in the app header', async ({ page }) => {
  await loginAsDemo(page)

  const headerAvatars = page.getByTestId('header-member-avatar')
  await expect(headerAvatars.first()).toBeVisible()

  const first = headerAvatars.first().locator('xpath=..')
  expect(
    await computedStyle(first, 'outline-color'),
    'the first member takes the first accent colour'
  ).toBe(accentRgb[0])
})
