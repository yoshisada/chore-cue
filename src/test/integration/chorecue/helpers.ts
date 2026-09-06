import { loginAsDemo } from '../helpers'

import type { Page } from '@playwright/test'

const BASE_URL = 'http://localhost:8081'

export async function navigateToChoreBoard(page: Page) {
  await loginAsDemo(page, '/home/feed')
}

export async function fillChoreForm(
  page: Page,
  options: {
    title: string
    category: string
    assignee?: 'Sam' | 'Alex'
    recurrence?: 'Every N days' | 'Weekly' | 'Daily time'
  }
) {
  await page.getByPlaceholder('Chore title').fill(options.title)
  await page.getByPlaceholder('Category').fill(options.category)

  if (options.assignee) {
    await page.getByRole('button', { name: options.assignee }).click()
  }

  if (options.recurrence) {
    await page.getByRole('button', { name: options.recurrence }).click()
  }
}

export async function clickAddChore(page: Page) {
  await page.getByRole('button', { name: 'Add chore' }).click()
}

export async function getChoreCards(page: Page) {
  return page.locator('[class*="Card"]').all()
}

export async function waitForBoardVisible(page: Page) {
  await page
    .getByText('ChoreCue Phase 1 on Takeout')
    .waitFor({ state: 'visible', timeout: 10000 })
}
