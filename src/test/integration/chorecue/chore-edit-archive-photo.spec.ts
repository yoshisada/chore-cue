import { test, expect } from '@playwright/test'

import { navigateToChoreBoard, waitForBoardVisible } from './helpers'

test.describe('Edit, archive, and photo flows on the board UI', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
    await waitForBoardVisible(page)
  })

  test('clicking Edit opens the editor panel', async ({ page }) => {
    const editButtons = page.getByRole('button', { name: 'Edit' })
    await editButtons.first().click()

    await expect(page.getByText('Edit chore')).toBeVisible()
  })

  test('editing and saving updates the chore title', async ({ page }) => {
    const editButtons = page.getByRole('button', { name: 'Edit' })
    await editButtons.first().click()

    const titleInput = page.getByPlaceholder('Chore title').nth(1)
    await titleInput.fill('Updated chore title')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText('Updated chore title')).toBeVisible()
  })

  test('archiving removes the chore from visible sections', async ({ page }) => {
    const choreTitle = await page.getByText('Take out compost').textContent()
    const archiveButtons = page.getByRole('button', { name: 'Archive' })
    await archiveButtons.first().click()

    const overdueSection = page.getByText('Overdue')
    // After archiving the only overdue chore, the section should disappear
    await expect(overdueSection).not.toBeVisible()
  })

  test('attach sample photo button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Attach sample photo' }).first()).toBeVisible()
  })

  test('clear photo button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Clear photo' }).first()).toBeVisible()
  })
})
