import { test, expect } from '@playwright/test'

import {
  BOARD_TEST_TIMEOUT,
  SYNC_TIMEOUT,
  archiveChore,
  choreCard,
  choreCards,
  createChore,
  createSheet,
  fillChoreForm,
  navigateToChoreBoard,
  openCreateSheet,
  sectionCard,
  submitChoreForm,
  uniqueTitle,
} from './helpers'

/**
 * creating a chore through the composer sheet.
 *
 * chores are persisted now, so every test here creates a uniquely titled chore
 * and archives it again — the demo household is shared between runs.
 */
test.describe('Chore creation', () => {
  test.describe.configure({ timeout: BOARD_TEST_TIMEOUT })

  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
  })

  test('a created chore appears on the board with its tag and assignee', async ({
    page,
  }) => {
    const title = uniqueTitle('Mop floor')
    const card = await createChore(page, { title, tags: ['Kitchen'] })

    await expect(card.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(card.getByText(/Kitchen/)).toBeVisible()
    await expect(card.getByRole('button', { name: 'Complete' })).toBeVisible()

    await archiveChore(page, title)
  })

  test('a daily chore lands in the Due Soon section', async ({ page }) => {
    const title = uniqueTitle('Dust shelves')
    await createChore(page, { title, tags: ['Living room'], recurrence: 'Daily time' })

    await expect(sectionCard(page, 'dueSoon', title)).toBeVisible()

    await archiveChore(page, title)
  })

  test('the composer resets after a chore is added', async ({ page }) => {
    const title = uniqueTitle('Wash dishes')
    await createChore(page, { title, tags: ['Kitchen'] })
    await archiveChore(page, title)

    await openCreateSheet(page)
    await expect(createSheet(page).getByPlaceholder('Chore title')).toHaveValue('')
    await expect(createSheet(page).getByText('No photo attached')).toBeVisible()
  })

  test('a chore with no title is rejected and nothing is added', async ({ page }) => {
    const before = await choreCards(page).count()

    await openCreateSheet(page)
    await fillChoreForm(page, { title: '   ', tags: ['Kitchen'] })
    await submitChoreForm(page)

    // the composer closes, but the invalid draft never reaches the board
    await expect(choreCards(page)).toHaveCount(before)
  })

  test('a created chore survives a page reload', async ({ page }) => {
    const title = uniqueTitle('Persisted chore')
    await createChore(page, { title, tags: ['Kitchen'] })

    await page.reload({ waitUntil: 'domcontentloaded' })

    await expect(choreCard(page, title)).toBeVisible({ timeout: SYNC_TIMEOUT })

    await archiveChore(page, title)
  })
})
