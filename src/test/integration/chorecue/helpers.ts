import { expect } from '@playwright/test'

import { loginAsDemo } from '../helpers'

import type { Locator, Page } from '@playwright/test'

/**
 * mirrors `RecurrenceSummary` in `~/features/chorecue/types` — restated here so
 * the Playwright project needs no path-alias resolution of app source
 */
export type RecurrenceSummary = 'Every N days' | 'Weekly' | 'Daily time'

/**
 * helpers for the chore-board Playwright specs.
 *
 * every selector here is anchored on a `testID` that `ChoreHomePage` actually
 * renders (tamagui maps `testID` to `data-testid` on web) or on an ARIA role,
 * never on decorative prose. the board is persistent now — chores live in
 * Postgres and sync through Zero — so specs create their own uniquely titled
 * chores and archive them again instead of leaning on whatever rows the demo
 * household happens to hold.
 */

/** wide enough for a cold Zero sync on CI, still bounded */
const SYNC_TIMEOUT = 15_000

/**
 * demo login plus a Zero round trip does not fit the 30s project default, so
 * every chore spec opts into a longer per-test budget.
 */
export const BOARD_TEST_TIMEOUT = 90_000

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
}

export async function navigateToChoreBoard(page: Page) {
  await loginAsDemo(page, '/home/feed')
  await waitForBoardVisible(page)
}

export async function waitForBoardVisible(page: Page) {
  await page
    .getByTestId('chore-board')
    .waitFor({ state: 'visible', timeout: SYNC_TIMEOUT })
  // the hero action renders before any row has synced, so this is the earliest
  // point at which the board is actually interactive
  await page
    .getByRole('button', { name: 'Create a chore' })
    .waitFor({ state: 'visible', timeout: SYNC_TIMEOUT })
}

/** every chore card currently on the board (archived chores are not queried) */
export function choreCards(page: Page): Locator {
  return page.getByTestId('chore-card')
}

/** the one card whose title heading is exactly `title` */
export function choreCard(page: Page, title: string): Locator {
  return page
    .getByTestId('chore-card')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
}

export type SectionKey = 'overdue' | 'dueSoon' | 'upcoming'

/** a due-state section; only rendered when it holds at least one chore */
export function section(page: Page, key: SectionKey): Locator {
  return page.getByTestId(`chore-section-${key}`)
}

export function sectionCard(page: Page, key: SectionKey, title: string): Locator {
  return section(page, key)
    .getByTestId('chore-card')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
}

export function createSheet(page: Page): Locator {
  return page.getByTestId('chore-create-sheet')
}

export function editSheet(page: Page): Locator {
  return page.getByTestId('chore-edit-sheet')
}

export async function openCreateSheet(page: Page) {
  await page.getByRole('button', { name: 'Create a chore' }).click()
  await expect(createSheet(page)).toBeVisible()
}

export interface ChoreFormInput {
  title: string
  tags?: string[]
  assignee?: string
  recurrence?: RecurrenceSummary
  attachPhoto?: boolean
}

/** fills the *open* create sheet; the edit sheet has the same field shape */
export async function fillChoreForm(
  page: Page,
  options: ChoreFormInput,
  sheet: Locator = createSheet(page)
) {
  await sheet.getByPlaceholder('Chore title').fill(options.title)

  for (const tag of options.tags ?? []) {
    await sheet.getByPlaceholder('Add a tag').fill(tag)
    await sheet.getByRole('button', { name: 'Add', exact: true }).click()
  }

  if (options.assignee) {
    await sheet.getByRole('button', { name: options.assignee, exact: true }).click()
  }

  if (options.recurrence) {
    await sheet.getByRole('button', { name: options.recurrence, exact: true }).click()
  }

  if (options.attachPhoto) {
    await sheet.getByRole('button', { name: 'Attach sample photo' }).click()
  }
}

export async function submitChoreForm(page: Page) {
  await createSheet(page).getByRole('button', { name: 'Add chore' }).click()
}

/** `validateChoreDraft` rejects a chore with no tags, so every create carries one */
export const DEFAULT_TAG = 'QA'

/** open the composer, fill it, submit it, and wait for the card to sync back */
export async function createChore(page: Page, options: ChoreFormInput): Promise<Locator> {
  await openCreateSheet(page)
  await fillChoreForm(page, {
    ...options,
    tags: options.tags?.length ? options.tags : [DEFAULT_TAG],
  })
  await submitChoreForm(page)

  const card = choreCard(page, options.title)
  await expect(card).toBeVisible({ timeout: SYNC_TIMEOUT })
  return card
}

/** the quota the composer reports, e.g. "2 of 5 daily bumps used" */
export const DAILY_BUMP_LIMIT = 5

/** the composer line that reports the viewer's quota for today */
export function bumpQuotaLabel(page: Page): Locator {
  return createSheet(page).getByText(/of 5 daily bumps used/)
}

/**
 * reads the viewer's bump quota out of the composer sheet, opening it first if
 * it is not already up.
 *
 * the sheet has no explicit close control, so the caller either submits the
 * form or calls `reloadBoard` to get back to a plain board.
 */
export async function readBumpsUsed(page: Page): Promise<number> {
  if (!(await createSheet(page).isVisible())) {
    await openCreateSheet(page)
  }

  const label = bumpQuotaLabel(page)
  await expect(label).toBeVisible()
  const text = (await label.textContent()) ?? ''
  const match = /(\d+)\s+of\s+5\s+daily bumps used/.exec(text.replace(/\s+/g, ' '))
  const used = match?.[1]
  if (used === undefined) {
    throw new Error(`could not read the bump quota from "${text}"`)
  }

  return Number(used)
}

/** the sheets have no close button, so a reload is the reliable way back */
export async function reloadBoard(page: Page) {
  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForBoardVisible(page)
}

/** archives a chore from its card, leaving the demo household as we found it */
export async function archiveChore(page: Page, title: string) {
  const card = choreCard(page, title)
  await card.getByRole('button', { name: 'Archive', exact: true }).click()
  await expect(card).toHaveCount(0, { timeout: SYNC_TIMEOUT })
}

export { SYNC_TIMEOUT }
