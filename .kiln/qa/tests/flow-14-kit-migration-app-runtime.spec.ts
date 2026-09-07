import { test, expect } from '@playwright/test'

import { LIGHT_BACKGROUND, backgroundColorsInUse, hexToCssRgb } from './support/ui'

/**
 * post-migration runtime smoke tests.
 *
 * three cases were removed from this file: the two "luxury editorial preserved"
 * assertions (zero border radius, serif headings) describe the design the
 * playful-household redesign replaced — rounded corners and Inter are now the
 * contract, asserted in flow-04 and flow-08 — and the skipped "Zero sync
 * round-trip" placeholder carried no assertions. that round trip is now covered
 * for real by `src/test/integration/chorecue/chore-create.spec.ts`
 * ("a created chore survives a page reload").
 */
test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test('kit/SC-003: App loads on port 8081 after migration with no server errors', async ({
  page,
}) => {
  const response = await page.goto('http://localhost:8081')
  expect(response?.status()).toBeLessThan(500)
  await expect(page.locator('body')).toBeVisible()
})

test('kit/SC-003: No app-level JS console errors on initial load after migration (backend not required)', async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  await page.goto('http://localhost:8081')
  await page.waitForLoadState('networkidle')
  // Filter known infrastructure errors requiring Docker/Zero/Postgres backend.
  // These are pre-existing on the base branch — not migration regressions.
  const blocking = consoleErrors.filter(
    (e) =>
      !e.includes('Warning') &&
      !e.includes('DevTools') &&
      !e.includes('favicon') &&
      !e.includes('ProtocolError') && // Zero sync — backend not running (pre-existing)
      !e.includes('SchemaVersionNotSupported') && // Zero sync — backend not running (pre-existing)
      !e.includes('replicated tables') && // Zero sync — backend not running (pre-existing)
      !e.includes('Failed to connect') && // Zero sync — backend not running (pre-existing)
      !e.includes('reloading') && // Zero sync reload loop (pre-existing)
      !e.includes('clientID=') && // Zero sync internal logs (pre-existing)
      !e.includes('does not recognize') && // Tamagui camelCase→DOM prop warning (pre-existing in 002 branch)
      !e.includes('textTransform') // Tamagui textTransform on DOM element (pre-existing in 002 branch)
  )
  expect(
    blocking,
    `App-level console errors after migration:\n${blocking.join('\n')}`
  ).toHaveLength(0)
})

test('kit/SC-008: the warm palette survived the migration — no pure white', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('http://localhost:8081')
  await expect(page.locator('body')).toBeVisible()

  const bgColor = await page.evaluate(
    () => window.getComputedStyle(document.body).backgroundColor
  )
  expect(bgColor, 'Background should not be pure white').not.toBe('rgb(255, 255, 255)')
  expect(await backgroundColorsInUse(page)).toContain(hexToCssRgb(LIGHT_BACKGROUND))
})
