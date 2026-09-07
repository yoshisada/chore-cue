import { test, expect } from '@playwright/test'

import {
  LOGIN_PATH,
  archiveChore,
  computedStyle,
  createTemporaryChore,
  loginAsDemo,
  pixels,
  readPressFeedback,
  uniqueTitle,
} from './support/ui'

/**
 * US-5 — press feedback.
 *
 * tamagui applies `pressStyle` on pointer-down, so holding the mouse over an
 * element and re-reading its computed transform/opacity is the observable form
 * of the feedback. the old "FR-016: navigation uses a rounded pill indicator"
 * case duplicated the tab-indicator test below and was deleted rather than
 * asserted twice.
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test.describe.configure({ timeout: 90_000 })

test('US-5: buttons visibly react while pressed', async ({ page }) => {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const button = page.getByRole('button', { name: 'Continue with Email' })
  await expect(button).toBeVisible()

  const { resting, pressed } = await readPressFeedback(page, button)

  expect(
    pressed.transform !== resting.transform || pressed.opacity !== resting.opacity,
    `no press feedback: transform ${resting.transform} -> ${pressed.transform}, opacity ${resting.opacity} -> ${pressed.opacity}`
  ).toBe(true)
})

test('US-5: chore cards visibly react while pressed', async ({ page }) => {
  await loginAsDemo(page)

  const title = uniqueTitle('QA press feedback')
  const card = await createTemporaryChore(page, title)

  const { resting, pressed } = await readPressFeedback(page, card)

  expect(
    pressed.transform !== resting.transform || pressed.opacity !== resting.opacity,
    `no press feedback on the chore card: transform ${resting.transform} -> ${pressed.transform}`
  ).toBe(true)

  await archiveChore(page, title)
})

test('US-5/FR-016: the active navigation tab is a rounded highlight, not an underline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await loginAsDemo(page)

  const activeTab = page.getByTestId('nav-tab-home')
  await expect(activeTab).toBeVisible()

  const background = await computedStyle(activeTab, 'background-color')
  expect(background, 'the active tab should be filled').not.toBe('rgba(0, 0, 0, 0)')

  expect(
    pixels(await computedStyle(activeTab, 'border-top-left-radius'))
  ).toBeGreaterThan(0)
  expect(
    pixels(await computedStyle(activeTab, 'border-bottom-width')),
    'the editorial underline indicator is gone'
  ).toBe(0)

  const inactiveTab = page.getByTestId('nav-tab-members')
  expect(
    await computedStyle(inactiveTab, 'background-color'),
    'only the active tab is highlighted'
  ).toBe('rgba(0, 0, 0, 0)')
})
