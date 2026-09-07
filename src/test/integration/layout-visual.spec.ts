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

    // Verify key layout elements exist (current playful-household DOM)
    await expect(page.getByRole('heading', { name: /Welcome to/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create a chore' })).toBeVisible()
    await expect(page.getByPlaceholder('Search chores...')).toBeVisible()
  })
})
