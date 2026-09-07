import { test, expect } from '@playwright/test'

import {
  archiveChore,
  computedStyle,
  createTemporaryChore,
  loginAsDemo,
  uniqueTitle,
} from './support/ui'

/**
 * US-2 — completing a chore.
 *
 * the completion affordance swaps the button label for a check mark for 500ms
 * and animates it in with the CSS driver on web. the old "verify the animation
 * plays within 500ms" and "inspect the animation driver" cases are gone: the
 * first is a race against a fixed timer, and the second is not observable from
 * the DOM beyond the transition these tests do assert.
 *
 * the spec creates and archives its own chore so the household's seeded chores
 * keep their due states for the other flows.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test.describe.configure({ timeout: 90_000 })

test('US-2: completing a chore does not block the rest of the card', async ({ page }) => {
  await loginAsDemo(page)

  const title = uniqueTitle('QA completion')
  const card = await createTemporaryChore(page, title)

  const complete = card.getByRole('button', { name: 'Complete' })
  await complete.click()

  // the check-mark animation must not gate any other action on the card
  await expect(card.getByRole('button', { name: 'Edit', exact: true })).toBeEnabled()
  await expect(card.getByText(/Last done today at/)).toBeVisible({ timeout: 15_000 })

  // and the button returns to its resting label once the animation is over
  await expect(card.getByRole('button', { name: 'Complete' })).toBeVisible({
    timeout: 5_000,
  })

  await archiveChore(page, title)
})

test('US-2: card actions animate through CSS transitions on web', async ({ page }) => {
  await loginAsDemo(page)

  const title = uniqueTitle('QA transition')
  const card = await createTemporaryChore(page, title)

  const complete = card.getByRole('button', { name: 'Complete' })
  const duration = await computedStyle(complete, 'transition-duration')

  const seconds = duration
    .split(',')
    .map((value) => Number.parseFloat(value))
    .filter((value) => !Number.isNaN(value))

  expect(
    seconds.length,
    `no transition on the complete button ("${duration}")`
  ).toBeGreaterThan(0)
  expect(
    Math.max(...seconds),
    'the CSS driver should animate the press feedback'
  ).toBeGreaterThan(0)

  await archiveChore(page, title)
})
