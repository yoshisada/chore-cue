import { test, expect } from '@playwright/test'

import { clickAddChore, fillChoreForm, navigateToChoreBoard, waitForBoardVisible } from './helpers'

test.describe('Chore creation through the board UI', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
    await waitForBoardVisible(page)
  })

  test('adds a chore with title and category', async ({ page }) => {
    await fillChoreForm(page, { title: 'Mop floor', category: 'Kitchen' })
    await clickAddChore(page)

    await expect(page.getByText('Mop floor')).toBeVisible()
  })

  test('new chore appears in the Due Soon section', async ({ page }) => {
    await fillChoreForm(page, { title: 'Dust shelves', category: 'Living room' })
    await clickAddChore(page)

    await expect(page.getByText('Newly scheduled for today')).toBeVisible()
  })

  test('chore form resets after adding', async ({ page }) => {
    await fillChoreForm(page, { title: 'Wash dishes', category: 'Kitchen' })
    await clickAddChore(page)

    const titleInput = page.getByPlaceholder('Chore title')
    await expect(titleInput).toHaveValue('')
  })
})
