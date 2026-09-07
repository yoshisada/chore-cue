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

test('edge: the accent palette gives six household members six distinct colours', () => {
  // the roster assignment is `palette[index % palette.length]`, so these two
  // invariants are what make the first six members distinguishable. the old
  // third assertion rebuilt the palette from itself and re-checked uniqueness
  // of the copy, which could not fail; it is gone.
  expect(memberAccentColors.length).toBe(6)
  expect(new Set(memberAccentColors).size, 'palette entries must not repeat').toBe(6)

  for (const accent of memberAccentColors) {
    expect(accent, `${accent} must be a 6-digit hex colour`).toMatch(/^#[0-9a-fA-F]{6}$/)
  }
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
