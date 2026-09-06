import { test, expect } from '@playwright/test'

test.use({
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
  screenshot: 'on',
})

test('US-4: Inter font — no Playfair Display anywhere', async ({ page }) => {
  // TODO: Inspect computed font-family on headings, body, labels, buttons
  await page.goto('/')
  // Verify: no element uses Playfair Display
})

test('US-4: Rounded corners on buttons (8-12px)', async ({ page }) => {
  await page.goto('/')
  // TODO: Inspect button border-radius
})

test('US-4: Rounded corners on cards (8-12px)', async ({ page }) => {
  await page.goto('/')
  // TODO: Inspect chore card border-radius
})

test('US-4: Rounded corners on inputs (8-12px)', async ({ page }) => {
  await page.goto('/')
  // TODO: Inspect form input border-radius
})

test('US-4: Warm palette — light mode (no pure white bg)', async ({ page }) => {
  await page.goto('/')
  // TODO: Check body/main background is not #FFFFFF or rgb(255,255,255)
})

test('US-4: Warm palette — dark mode (no pure black bg)', async ({ page }) => {
  await page.goto('/')
  // TODO: Toggle dark mode, check background is not #000000
})

test('US-4: Dark mode toggle works', async ({ page }) => {
  await page.goto('/')
  // TODO: Find and click dark mode toggle, verify theme changes
})
