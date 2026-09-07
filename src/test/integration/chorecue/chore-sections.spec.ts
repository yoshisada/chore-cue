import { test, expect } from '@playwright/test'

import {
  BOARD_TEST_TIMEOUT,
  archiveChore,
  choreCard,
  choreCards,
  createChore,
  navigateToChoreBoard,
  section,
  sectionCard,
  uniqueTitle,
} from './helpers'

/**
 * the board shell and its due-state sections.
 *
 * a section only renders when it holds at least one chore, so instead of
 * asserting against whatever the demo household currently contains, each test
 * that needs a card in a known bucket creates one: a `Daily time` chore is due
 * at 19:00 local, which is always inside the 24h "due soon" window.
 */
test.describe('Chore board sections', () => {
  test.describe.configure({ timeout: BOARD_TEST_TIMEOUT })

  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
  })

  test('renders the board shell: hero, create action and search', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Welcome to/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create a chore' })).toBeVisible()
    await expect(page.getByPlaceholder('Search chores...')).toBeVisible()
  })

  test('a daily chore is grouped under Due Soon with a matching header count', async ({
    page,
  }) => {
    const title = uniqueTitle('Section daily')
    await createChore(page, { title, recurrence: 'Daily time' })

    const dueSoon = section(page, 'dueSoon')
    await expect(dueSoon).toBeVisible()
    await expect(dueSoon.getByText('Due Soon', { exact: true })).toBeVisible()
    await expect(sectionCard(page, 'dueSoon', title)).toBeVisible()

    // the header badge counts exactly the cards rendered inside the section
    const cardCount = await dueSoon.getByTestId('chore-card').count()
    await expect(dueSoon.getByTestId('chore-section-count')).toHaveText(String(cardCount))

    await archiveChore(page, title)
  })

  test('a daily chore carries a due label for its 7:00 PM recurrence', async ({
    page,
  }) => {
    const title = uniqueTitle('Section label')
    const card = await createChore(page, { title, recurrence: 'Daily time' })

    await expect(card.getByText(/Due (today|tomorrow) at 7:00 PM/)).toBeVisible()
    await expect(card.getByText(/Daily time/)).toBeVisible()

    await archiveChore(page, title)
  })

  test('search narrows the board to the matching chore', async ({ page }) => {
    const title = uniqueTitle('Section search')
    await createChore(page, { title })

    await page.getByPlaceholder('Search chores...').fill(title)

    await expect(choreCards(page)).toHaveCount(1)
    await expect(choreCard(page, title)).toBeVisible()

    await page.getByPlaceholder('Search chores...').fill('')
    await archiveChore(page, title)
  })

  test('a tag chip filters the board down to chores carrying that tag', async ({
    page,
  }) => {
    const title = uniqueTitle('Section tag')
    const tag = uniqueTitle('Zone')
    await createChore(page, { title, tags: [tag] })

    await page.getByRole('button', { name: tag, exact: true }).click()

    await expect(choreCards(page)).toHaveCount(1)
    await expect(choreCard(page, title)).toBeVisible()

    await page.getByRole('button', { name: 'All', exact: true }).click()
    await archiveChore(page, title)
  })
})
