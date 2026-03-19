import { test, expect } from '@playwright/test'

import { navigateToChoreBoard, waitForBoardVisible } from './helpers'

test.describe('Completing chores from the board UI', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
    await waitForBoardVisible(page)
  })

  test('completing a chore shows reset label', async ({ page }) => {
    const completeButtons = page.getByRole('button', { name: 'Complete' })
    await completeButtons.first().click()

    await expect(page.getByText('Reset for the next cycle')).toBeVisible()
  })

  test('completing a chore shows completed just now', async ({ page }) => {
    const completeButtons = page.getByRole('button', { name: 'Complete' })
    await completeButtons.first().click()

    await expect(page.getByText('Completed just now')).toBeVisible()
  })
})
