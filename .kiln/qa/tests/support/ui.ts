import { expect } from '@playwright/test'

import {
  choreStateColors,
  memberAccentColors,
  playfulDarkTheme,
  playfulLightTheme,
} from '../../../../src/tamagui/themes/playfulHousehold'

import type { Locator, Page } from '@playwright/test'

/**
 * shared helpers for the QA flow specs.
 *
 * the palette is imported from the app's own theme module rather than copied,
 * so a token change breaks these tests instead of silently drifting past them.
 */

export { choreStateColors, memberAccentColors, playfulDarkTheme, playfulLightTheme }

export const LOGIN_PATH = '/auth/login'
export const SIGNUP_PATH = '/auth/signup/email'
export const FEED_PATH = '/home/feed'
export const MEMBERS_PATH = '/home/members'

export const LIGHT_BACKGROUND = playfulLightTheme.background // #FAF9F7
export const DARK_BACKGROUND = playfulDarkTheme.background // #2C2825

const READY_TEST_IDS: Record<string, string> = {
  [FEED_PATH]: 'chore-board',
  [MEMBERS_PATH]: 'members-page',
}

/** signs in with the dev-only demo button and lands on `path` */
export async function loginAsDemo(page: Page, path: string = FEED_PATH) {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' })

  const demoButton = page.locator('[data-testid="login-as-demo"]')
  await demoButton.waitFor({ state: 'visible', timeout: 15_000 })
  await demoButton.click()

  await page.waitForURL((url) => !url.toString().includes('/auth/login'), {
    timeout: 30_000,
  })

  await page.goto(path, { waitUntil: 'domcontentloaded' })

  const readyTestId = READY_TEST_IDS[path]
  if (readyTestId) {
    await expect(page.getByTestId(readyTestId)).toBeVisible({ timeout: 20_000 })
  }
}

// ---------- board fixtures ----------

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
}

export function choreCard(page: Page, title: string): Locator {
  return page
    .getByTestId('chore-card')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
}

/**
 * creates a throwaway chore so a visual assertion has something to look at
 * without touching the household's seeded chores. a chore needs a title and at
 * least one tag to validate.
 */
export async function createTemporaryChore(page: Page, title: string): Promise<Locator> {
  await page.getByRole('button', { name: 'Create a chore' }).click()
  const sheet = page.getByTestId('chore-create-sheet')
  await expect(sheet).toBeVisible()

  await sheet.getByPlaceholder('Chore title').fill(title)
  await sheet.getByPlaceholder('Add a tag').fill('QA')
  await sheet.getByRole('button', { name: 'Add', exact: true }).click()
  await sheet.getByRole('button', { name: 'Add chore' }).click()

  const card = choreCard(page, title)
  await expect(card).toBeVisible({ timeout: 15_000 })
  return card
}

export async function archiveChore(page: Page, title: string) {
  const card = choreCard(page, title)
  await card.getByRole('button', { name: 'Archive', exact: true }).click()
  await expect(card).toHaveCount(0, { timeout: 15_000 })
}

// ---------- colour utilities ----------

export interface Rgb {
  r: number
  g: number
  b: number
}

export function parseRgb(value: string): Rgb {
  const match = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(value)
  if (!match) throw new Error(`not an rgb colour: "${value}"`)
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
}

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace('#', '')
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  }
}

/** the exact string `getComputedStyle` reports for a hex colour */
export function hexToCssRgb(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${r}, ${g}, ${b})`
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (raw: number) => {
    const c = raw / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05)
}

export function isPureWhite({ r, g, b }: Rgb): boolean {
  return r === 255 && g === 255 && b === 255
}

export function isPureBlack({ r, g, b }: Rgb): boolean {
  return r === 0 && g === 0 && b === 0
}

// ---------- DOM utilities ----------

export function computedStyle(locator: Locator, property: string): Promise<string> {
  return locator.evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property
  )
}

export function pixels(value: string): number {
  return Number.parseFloat(value.replace('px', '')) || 0
}

/** the first painted background walking down from <body> */
export async function effectiveBackgroundColor(page: Page): Promise<string> {
  return page.evaluate(() => {
    const transparent = (value: string) =>
      value === 'transparent' || value === 'rgba(0, 0, 0, 0)'

    let node: Element | null = document.body
    while (node) {
      const bg = window.getComputedStyle(node).backgroundColor
      if (!transparent(bg)) return bg
      node = node.firstElementChild
    }
    return window.getComputedStyle(document.body).backgroundColor
  })
}

/**
 * every distinct font-family actually painting text — only elements holding
 * their own text nodes count, so unstyled wrappers do not pollute the set
 */
export function fontFamiliesInUse(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const families = new Set<string>()
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const ownsText = Array.from(el.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim()
      )
      if (!ownsText) continue
      families.add(window.getComputedStyle(el).fontFamily)
    }
    return Array.from(families)
  })
}

/** every distinct painted background colour on the page */
export function backgroundColorsInUse(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const colours = new Set<string>()
    const nodes: Element[] = [
      document.body,
      ...Array.from(document.querySelectorAll('body *')),
    ]
    for (const el of nodes) {
      const bg = window.getComputedStyle(el).backgroundColor
      if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') continue
      colours.add(bg)
    }
    return Array.from(colours)
  })
}

/** true when the document does not scroll sideways */
export function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
  )
}

export interface PressSnapshot {
  transform: string
  opacity: string
}

/**
 * holds the pointer down on an element and reports the computed transform and
 * opacity while it is pressed — tamagui applies `pressStyle` on pointerdown, so
 * a resting/pressed difference is the observable form of press feedback.
 */
export async function readPressFeedback(
  page: Page,
  locator: Locator
): Promise<{ resting: PressSnapshot; pressed: PressSnapshot }> {
  const snapshot = async (): Promise<PressSnapshot> => ({
    transform: await computedStyle(locator, 'transform'),
    opacity: await computedStyle(locator, 'opacity'),
  })

  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) throw new Error('element has no bounding box')

  const resting = await snapshot()

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  const pressed = await snapshot()
  await page.mouse.up()

  return { resting, pressed }
}
