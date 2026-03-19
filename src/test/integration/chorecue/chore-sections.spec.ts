import { test, expect } from '@playwright/test'

import { navigateToChoreBoard, waitForBoardVisible } from './helpers'

test.describe('Due-state sections on the feed screen', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
    await waitForBoardVisible(page)
  })

  test('displays Overdue section with chore count', async ({ page }) => {
    await expect(page.getByText('Overdue')).toBeVisible()
  })

  test('displays Due Soon section', async ({ page }) => {
    await expect(page.getByText('Due Soon')).toBeVisible()
  })

  test('displays Upcoming section', async ({ page }) => {
    await expect(page.getByText('Upcoming')).toBeVisible()
  })

  test('shows chore metadata (category and assignee)', async ({ page }) => {
    await expect(page.getByText('Kitchen | Sam')).toBeVisible()
  })

  test('shows recurrence summary on chore cards', async ({ page }) => {
    await expect(page.getByText('Every N days')).toBeVisible()
  })
})
