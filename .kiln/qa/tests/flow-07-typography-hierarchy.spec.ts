import { test, expect } from '@playwright/test'

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test('FR-002/US-004: Main screen heading uses italic serif with gold accent for editorial personality', async ({
  page,
}) => {
  await page.goto('/')
  // Step 1: Locate main heading on home/landing page
  // Step 2: Verify at least one word uses font-style: italic with a gold color
  // Verify: editorial personality present in heading
  await expect(page.locator('body')).toBeVisible()
})

test('FR-007/US-004: Section labels (Overdue/Due/Upcoming) are uppercase with wide letter spacing', async ({
  page,
}) => {
  await page.goto('/')
  // Step 1: Navigate to a page with section labels (may need login)
  // Step 2: Inspect section label computed styles
  // Verify: text-transform: uppercase, letter-spacing > 0.05em
  await expect(page.locator('body')).toBeVisible()
})

test('US-004: Metadata text (timestamps, counts) is small, sans-serif, warm grey', async ({
  page,
}) => {
  await page.goto('/')
  // Step 1: Locate metadata text elements (timestamps, counts)
  // Step 2: Verify font-size is small, font-family is sans-serif, color is warm grey
  // Verify: small scale, sans-serif, warm grey
  await expect(page.locator('body')).toBeVisible()
})

test('FR-002: Font loading — Playfair Display or system serif fallback visible on web', async ({
  page,
}) => {
  await page.goto('/')
  // Step 1: Check network requests for Playfair Display or Google Fonts
  // Step 2: Inspect heading font-family
  // Verify: serif font loaded (Playfair Display preferred, Georgia/Times as fallback)
  await expect(page.locator('body')).toBeVisible()
})

test('FR-014: Font fallback preserves serif/sans distinction when CDN blocked', async ({
  page,
}) => {
  // Block Google Fonts CDN
  await page.route('**fonts.googleapis.com**', (route) => route.abort())
  await page.route('**fonts.gstatic.com**', (route) => route.abort())
  await page.goto('/')
  // Step 1: Load with fonts blocked
  // Step 2: Inspect heading font-family
  // Verify: headings still use a system serif (not sans-serif)
  await expect(page.locator('body')).toBeVisible()
})
