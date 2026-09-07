import { test, expect } from '@playwright/test'

import {
  MEMBERS_PATH,
  choreStateColors,
  computedStyle,
  hexToCssRgb,
  loginAsDemo,
  memberAccentColors,
} from './support/ui'

/**
 * palette edge cases: how accent colours are handed out, and how they relate to
 * the due-state colours.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test.describe.configure({ timeout: 90_000 })

const accents = memberAccentColors.map((colour) => hexToCssRgb(colour))

test('edge: each member takes the accent colour for its roster position', async ({
  page,
}) => {
  await loginAsDemo(page, MEMBERS_PATH)

  const avatars = page.getByTestId('member-avatar')
  await expect(avatars.first()).toBeVisible()

  const total = await avatars.count()
  expect(total).toBeGreaterThan(0)

  for (let index = 0; index < total; index += 1) {
    const ring = avatars.nth(index).locator('xpath=..')
    expect(
      await computedStyle(ring, 'outline-color'),
      `member #${index} accent colour`
    ).toBe(accents[index % accents.length])
  }
})

test('edge: the accent palette gives six households members six distinct colours', () => {
  expect(memberAccentColors.length).toBe(6)
  expect(new Set(memberAccentColors).size).toBe(6)

  // the assignment is `index % palette.length`, so the first six are unique
  const assigned = Array.from(
    { length: 6 },
    (_, index) => memberAccentColors[index % memberAccentColors.length]
  )
  expect(new Set(assigned).size).toBe(6)
})

test('edge: a member with no photo falls back to the user icon', async ({ page }) => {
  await loginAsDemo(page, MEMBERS_PATH)

  const avatar = page.getByTestId('member-avatar').first()
  await expect(avatar).toBeVisible()

  await expect(avatar.locator('svg').first()).toBeVisible()
  expect(await avatar.locator('img').count(), 'no member photo is uploaded yet').toBe(0)
})

test('edge: due-state colours and member accent colours never collide', () => {
  const stateColours = [
    ...Object.values(choreStateColors.light),
    ...Object.values(choreStateColors.dark),
  ].map((value) => value.toLowerCase())

  for (const accent of memberAccentColors) {
    expect(stateColours, `${accent} is both an accent and a state colour`).not.toContain(
      accent.toLowerCase()
    )
  }
})
