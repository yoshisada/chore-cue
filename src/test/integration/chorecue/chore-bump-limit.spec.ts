import { test, expect } from '@playwright/test'

import { navigateToChoreBoard, waitForBoardVisible } from './helpers'

test.describe('Bump-limit behavior on the board UI', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
    await waitForBoardVisible(page)
  })

  test('shows bump count indicator', async ({ page }) => {
    await expect(page.getByText(/of 5 daily bumps used/)).toBeVisible()
  })

  test('send bump button is visible for eligible chores', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Send bump' }).first()).toBeVisible()
  })

  test('clicking send bump updates the label with reminder text', async ({ page }) => {
    const bumpButton = page.getByRole('button', { name: 'Send bump' }).first()
    await bumpButton.click()

    await expect(page.getByText('gentle reminder sent')).toBeVisible()
  })
})
