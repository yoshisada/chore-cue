import { test, expect } from '@playwright/test'

import { loginAsDemo } from './helpers'

test.describe('Layout visual verification', () => {
  test('full page layout screenshot', async ({ page }) => {
    await loginAsDemo(page, '/home/feed')
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: 'src/test/integration/.output/layout-full.png',
      fullPage: true,
    })

    // Verify key layout elements exist
    await expect(page.getByRole('heading', { name: 'Your Household' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create a chore' })).toBeVisible()

    // Verify tag filter bar renders "All" and tag chips
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
  })
})
