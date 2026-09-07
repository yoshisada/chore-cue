import { test, expect } from '@playwright/test'

import {
  BOARD_TEST_TIMEOUT,
  DAILY_BUMP_LIMIT,
  SYNC_TIMEOUT,
  archiveChore,
  bumpQuotaLabel,
  choreCard,
  createChore,
  fillChoreForm,
  navigateToChoreBoard,
  openCreateSheet,
  readBumpsUsed,
  reloadBoard,
  submitChoreForm,
  uniqueTitle,
  waitForBoardVisible,
} from './helpers'

import type { Page } from '@playwright/test'

/**
 * bumping, and the rules that gate it.
 *
 * a fresh household has exactly one member, so every chore is self-assigned and
 * every bump button explains itself as "Assigned to you". to exercise a real
 * bump this spec adds a local member (a household member with no login), assigns
 * a chore to them, bumps it, and cleans both up again.
 *
 * the daily quota is per *sender* and resets at the sender's midnight, so the
 * shared demo user can legitimately reach this spec with 0..5 bumps already
 * spent today; both states are asserted rather than assumed.
 */

function memberCard(page: Page, name: string) {
  return page
    .getByTestId('member-card')
    .filter({ has: page.getByRole('heading', { name, exact: true }) })
}

async function addLocalMember(page: Page, name: string) {
  // navigate like a user, via the tab: a full-page load of /home/members
  // mis-hydrates in the production bundle and bounces back to the feed
  await page.getByTestId('nav-tab-members').click()
  // 'attached', not visible: the page container measures 0-high on web
  // (flex-basis 0) even while its children render — see waitForBoardVisible
  await page
    .getByTestId('members-page')
    .waitFor({ state: 'attached', timeout: SYNC_TIMEOUT })

  await page.getByRole('button', { name: 'Add member', exact: true }).first().click()
  const sheet = page.getByTestId('member-add-sheet')
  await expect(sheet).toBeVisible()
  await sheet.getByPlaceholder('Name').fill(name)
  await sheet.getByRole('button', { name: 'Add member', exact: true }).click()

  await expect(memberCard(page, name)).toBeVisible({ timeout: SYNC_TIMEOUT })
}

async function deactivateLocalMember(page: Page, name: string) {
  await page.getByTestId('nav-tab-members').click()
  await expect(memberCard(page, name)).toBeVisible({ timeout: SYNC_TIMEOUT })
  await memberCard(page, name).getByRole('button', { name: 'Deactivate' }).click()
  await expect(memberCard(page, name)).toHaveCount(0, { timeout: SYNC_TIMEOUT })
}

test.describe('Bumping and the daily bump quota', () => {
  test.describe.configure({ timeout: BOARD_TEST_TIMEOUT })

  test.beforeEach(async ({ page }) => {
    await navigateToChoreBoard(page)
  })

  test('a self-assigned chore cannot be bumped, and says why', async ({ page }) => {
    const title = uniqueTitle('Self assigned')
    const card = await createChore(page, { title, tags: ['Kitchen'] })

    const bump = card.getByTestId('chore-bump-button')
    await expect(bump).toBeVisible()
    await expect(bump).toBeDisabled()
    await expect(bump).toHaveText('No bump')
    await expect(card.getByTestId('chore-bump-blocked-reason')).toHaveText(
      'Assigned to you'
    )

    await archiveChore(page, title)
  })

  test('the composer reports the daily bump quota', async ({ page }) => {
    const used = await readBumpsUsed(page)

    expect(used).toBeGreaterThanOrEqual(0)
    expect(used).toBeLessThanOrEqual(DAILY_BUMP_LIMIT)
  })

  test('a chore assigned to another member can be bumped until the quota runs out', async ({
    page,
  }) => {
    const memberName = uniqueTitle('Roomie')
    const title = uniqueTitle('Bumpable chore')

    await addLocalMember(page, memberName)

    await page.getByTestId('nav-tab-home').click()
    await waitForBoardVisible(page)

    // read the quota and fill the composer in the same sheet visit
    await openCreateSheet(page)
    const used = await readBumpsUsed(page)
    await fillChoreForm(page, { title, tags: ['Kitchen'], assignee: memberName })
    await submitChoreForm(page)

    const card = choreCard(page, title)
    await expect(card).toBeVisible({ timeout: SYNC_TIMEOUT })
    const bump = card.getByTestId('chore-bump-button')

    if (used >= DAILY_BUMP_LIMIT) {
      // today's quota is already spent: the button must refuse and explain
      await expect(bump).toBeDisabled()
      await expect(card.getByTestId('chore-bump-blocked-reason')).toHaveText(
        'Daily limit reached'
      )
    } else {
      await expect(bump).toBeEnabled()
      await expect(bump).toHaveText('Bump')

      await bump.click()

      await openCreateSheet(page)
      await expect(bumpQuotaLabel(page)).toHaveText(`${used + 1} of 5 daily bumps used`, {
        timeout: SYNC_TIMEOUT,
      })
      await reloadBoard(page)
    }

    await archiveChore(page, title)
    await deactivateLocalMember(page, memberName)
  })
})
