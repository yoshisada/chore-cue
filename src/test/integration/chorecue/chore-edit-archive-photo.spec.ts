import { test, expect } from '@playwright/test'

import {
  BOARD_TEST_TIMEOUT,
  SYNC_TIMEOUT,
  archiveChore,
  choreCard,
  createChore,
  createSheet,
  editSheet,
  navigateToChoreBoard,
  openCreateSheet,
  uniqueTitle,
} from './helpers'

/**
 * the editor sheet, archiving, and the photo-label affordance.
 *
 * the photo input is still label-only (`chore.photoLabel`) — `PhotoInput`
 * attaches a fixed sample filename rather than uploading anything — so that is
 * exactly what these assertions check.
 */
test.describe('Editing, archiving and photo labels', () => {
  test.describe.configure({ timeout: BOARD_TEST_TIMEOUT })

  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
  })

  test('Edit opens the editor prefilled with the chore', async ({ page }) => {
    const title = uniqueTitle('Editable chore')
    const card = await createChore(page, { title, tags: ['Kitchen'] })

    await card.getByRole('button', { name: 'Edit', exact: true }).click()

    await expect(editSheet(page)).toBeVisible()
    await expect(editSheet(page).getByText('Edit chore')).toBeVisible()
    await expect(editSheet(page).getByPlaceholder('Chore title')).toHaveValue(title)

    await editSheet(page).getByRole('button', { name: 'Save changes' }).click()
    await archiveChore(page, title)
  })

  test('saving an edited title updates the card', async ({ page }) => {
    const title = uniqueTitle('Before edit')
    const renamed = uniqueTitle('After edit')
    const card = await createChore(page, { title, tags: ['Kitchen'] })

    await card.getByRole('button', { name: 'Edit', exact: true }).click()
    await editSheet(page).getByPlaceholder('Chore title').fill(renamed)
    await editSheet(page).getByRole('button', { name: 'Save changes' }).click()

    await expect(choreCard(page, renamed)).toBeVisible({ timeout: SYNC_TIMEOUT })
    await expect(choreCard(page, title)).toHaveCount(0)

    await archiveChore(page, renamed)
  })

  test('archiving from the card removes it from the board for good', async ({ page }) => {
    const title = uniqueTitle('Archive me')
    const card = await createChore(page, { title, tags: ['Kitchen'] })

    await card.getByRole('button', { name: 'Archive', exact: true }).click()

    await expect(choreCard(page, title)).toHaveCount(0, { timeout: SYNC_TIMEOUT })

    await page.reload({ waitUntil: 'domcontentloaded' })
    // 'attached', not visible: the board container measures 0-high on web
    // (flex-basis 0) even while its children render — see waitForBoardVisible
    await page
      .getByTestId('chore-board')
      .waitFor({ state: 'attached', timeout: SYNC_TIMEOUT })
    await expect(choreCard(page, title)).toHaveCount(0)
  })

  test('archiving from the editor closes the editor and drops the chore', async ({
    page,
  }) => {
    const title = uniqueTitle('Archive from editor')
    const card = await createChore(page, { title, tags: ['Kitchen'] })

    await card.getByRole('button', { name: 'Edit', exact: true }).click()
    await expect(editSheet(page)).toBeVisible()
    await editSheet(page).getByRole('button', { name: 'Archive chore' }).click()

    await expect(editSheet(page)).toHaveCount(0, { timeout: SYNC_TIMEOUT })
    await expect(choreCard(page, title)).toHaveCount(0)
  })

  test('the composer attaches and clears a sample photo label', async ({ page }) => {
    await openCreateSheet(page)
    const sheet = createSheet(page)

    await expect(sheet.getByText('No photo attached')).toBeVisible()

    await sheet.getByRole('button', { name: 'Attach sample photo' }).click()
    await expect(sheet.getByText('Attached photo: kitchen-reference.jpg')).toBeVisible()

    await sheet.getByRole('button', { name: 'Clear photo' }).click()
    await expect(sheet.getByText('No photo attached')).toBeVisible()
  })

  test('a chore created with a photo shows its label on the card', async ({ page }) => {
    const title = uniqueTitle('Photo chore')
    const card = await createChore(page, {
      title,
      tags: ['Kitchen'],
      attachPhoto: true,
    })

    await expect(card.getByText('kitchen-reference.jpg')).toBeVisible()

    await archiveChore(page, title)
  })
})
