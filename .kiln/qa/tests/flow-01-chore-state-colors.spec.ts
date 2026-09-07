import { test, expect } from '@playwright/test'

import {
  archiveChore,
  choreStateColors,
  computedStyle,
  contrastRatio,
  hexToCssRgb,
  hexToRgb,
  createTemporaryChore,
  loginAsDemo,
  pixels,
  uniqueTitle,
} from './support/ui'

/**
 * US-1 — glanceable chore state colours.
 *
 * the board has three due states (overdue / due soon / upcoming); "done" is not
 * a board state — completing a chore reschedules it — so the old four-state
 * assertion is gone. the "state transition updates colour" case was deleted
 * with it: the bucket flips when wall-clock time crosses `nextDueAt`, which a
 * browser test cannot force.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test.describe.configure({ timeout: 90_000 })

test('US-1: every chore card is painted with its due-state colour', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await loginAsDemo(page)

  // the board must not be empty for this to mean anything
  const title = uniqueTitle('QA state colour')
  await createTemporaryChore(page, title)

  const expected: Record<string, string> = {
    overdue: hexToCssRgb(choreStateColors.light.overdue),
    dueSoon: hexToCssRgb(choreStateColors.light.due),
    upcoming: hexToCssRgb(choreStateColors.light.upcoming),
  }

  let checked = 0
  for (const [bucket, colour] of Object.entries(expected)) {
    const section = page.getByTestId(`chore-section-${bucket}`)
    if ((await section.count()) === 0) continue

    const cards = section.getByTestId('chore-card')
    const total = await cards.count()
    for (let index = 0; index < total; index += 1) {
      const card = cards.nth(index)
      expect(
        await computedStyle(card, 'border-left-color'),
        `${bucket} card #${index} state colour`
      ).toBe(colour)
      expect(pixels(await computedStyle(card, 'border-left-width'))).toBeGreaterThan(0)
      checked += 1
    }
  }

  expect(checked, 'the board rendered no chore cards to inspect').toBeGreaterThan(0)

  await archiveChore(page, title)
})

test('US-1: light-mode state colours are distinct and separated from the background', () => {
  const light = choreStateColors.light
  const background = hexToRgb('#FAF9F7')

  const values = [light.overdue, light.due, light.done, light.upcoming]
  expect(new Set(values).size, 'state colours must be distinguishable').toBe(
    values.length
  )

  // state colours paint borders, dots and tints — graphical objects, so WCAG
  // 1.4.11 asks for 3:1. measured against the soft-white background: overdue
  // 3.85, due 3.47, done 4.80, upcoming 3.20.
  for (const value of values) {
    expect(
      contrastRatio(hexToRgb(value), background),
      `${value} vs background`
    ).toBeGreaterThanOrEqual(3)
  }
})

test('US-1: dark-mode state colours clear the 3:1 non-text contrast bar', () => {
  const dark = choreStateColors.dark
  const background = hexToRgb('#2C2825')

  for (const value of [dark.overdue, dark.due, dark.done, dark.upcoming]) {
    expect(
      contrastRatio(hexToRgb(value), background),
      `${value} vs dark background`
    ).toBeGreaterThanOrEqual(3)
  }
})
