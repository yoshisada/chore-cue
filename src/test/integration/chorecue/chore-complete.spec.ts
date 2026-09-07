import { test, expect } from '@playwright/test'

import {
  BOARD_TEST_TIMEOUT,
  SYNC_TIMEOUT,
  archiveChore,
  choreCard,
  createChore,
  navigateToChoreBoard,
  sectionCard,
  uniqueTitle,
} from './helpers'

/**
 * completing a chore.
 *
 * `Daily time` chores recur at 19:00 local, so a freshly created one is always
 * "due soon" and — once completed — is rescheduled to the *next* 19:00, which is
 * more than 24h out and therefore "upcoming". that makes the reschedule
 * observable without any clock manipulation.
 */
test.describe('Completing chores', () => {
  test.describe.configure({ timeout: BOARD_TEST_TIMEOUT })

  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
  })

  test('completing a chore records when it was last done', async ({ page }) => {
    const title = uniqueTitle('Complete me')
    const card = await createChore(page, { title, recurrence: 'Daily time' })

    await card.getByRole('button', { name: 'Complete' }).click()

    await expect(card.getByText(/Last done today at/)).toBeVisible({
      timeout: SYNC_TIMEOUT,
    })

    await archiveChore(page, title)
  })

  test('completing a daily chore reschedules it out of Due Soon', async ({ page }) => {
    const title = uniqueTitle('Reschedule me')
    const card = await createChore(page, { title, recurrence: 'Daily time' })

    await expect(sectionCard(page, 'dueSoon', title)).toBeVisible()

    await card.getByRole('button', { name: 'Complete' }).click()

    await expect(sectionCard(page, 'upcoming', title)).toBeVisible({
      timeout: SYNC_TIMEOUT,
    })
    await expect(sectionCard(page, 'dueSoon', title)).toHaveCount(0)

    await archiveChore(page, title)
  })

  test('a completion survives a page reload', async ({ page }) => {
    const title = uniqueTitle('Durable completion')
    const card = await createChore(page, { title, recurrence: 'Daily time' })

    await card.getByRole('button', { name: 'Complete' }).click()
    await expect(card.getByText(/Last done today at/)).toBeVisible({
      timeout: SYNC_TIMEOUT,
    })

    await page.reload({ waitUntil: 'domcontentloaded' })

    const reloaded = choreCard(page, title)
    await expect(reloaded.getByText(/Last done today at/)).toBeVisible({
      timeout: SYNC_TIMEOUT,
    })

    await archiveChore(page, title)
  })
})
